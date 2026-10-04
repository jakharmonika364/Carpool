import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Vehicle } from '../database/entities/vehicle.entity';
import {
  VerificationRecord,
  VerificationRecordStatus,
  VerificationRecordType,
} from '../database/entities/verification-record.entity';
import {
  VerificationStatusDto,
  VerificationTaskDto,
  VerificationTaskStatus,
} from './dto/verification-status.dto';
import { SubmitDlVerificationDto } from './dto/submit-dl-verification.dto';
import { SubmitRcVerificationDto } from './dto/submit-rc-verification.dto';
import { SubmitAadhaarVerificationDto } from './dto/submit-aadhaar-verification.dto';
import { isValidVerhoeff } from '../common/utils/verhoeff';

const MINIMUM_DRIVER_AGE = 18;

// Order the required driver-onboarding steps are presented in (matches the
// wizard's own numbering: Identity=1, DL=2, RC=3, Liveness=4) and the order
// "nextStep" is picked from. Aadhaar (step 5) is optional and deliberately
// excluded — it never blocks nextStep.
const TASK_ORDER: VerificationRecordType[] = [
  VerificationRecordType.DL,
  VerificationRecordType.RC,
  VerificationRecordType.LIVENESS,
];

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(VerificationRecord)
    private readonly verificationRecordsRepository: Repository<VerificationRecord>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    private readonly configService: ConfigService,
  ) {}

  async getStatusForUser(userId: string): Promise<VerificationStatusDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const records = await this.verificationRecordsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const tasks: Record<VerificationRecordType, VerificationTaskDto> = {
      [VerificationRecordType.DL]: this.latestTaskFor(
        records,
        VerificationRecordType.DL,
      ),
      [VerificationRecordType.LIVENESS]: this.latestTaskFor(
        records,
        VerificationRecordType.LIVENESS,
      ),
      [VerificationRecordType.RC]: this.latestTaskFor(
        records,
        VerificationRecordType.RC,
      ),
      [VerificationRecordType.AADHAAR]: this.latestTaskFor(
        records,
        VerificationRecordType.AADHAAR,
      ),
    };

    const nextStep =
      TASK_ORDER.find((type) => tasks[type].status !== 'verified') ?? null;

    // Single-vehicle onboarding for now: a driver has at most one Vehicle
    // row, created by submitRc(). Multi-vehicle support is future scope.
    const vehicle = await this.vehiclesRepository.findOne({
      where: { ownerId: userId },
    });

    return {
      identityComplete: Boolean(
        user.firstName && user.lastName && user.gender,
      ),
      dl: tasks[VerificationRecordType.DL],
      liveness: tasks[VerificationRecordType.LIVENESS],
      rc: tasks[VerificationRecordType.RC],
      aadhaar: tasks[VerificationRecordType.AADHAAR],
      nextStep,
      vehicle: vehicle
        ? {
            make: vehicle.make,
            model: vehicle.model,
            registrationNumber: vehicle.registrationNumber,
          }
        : null,
    };
  }

  // Dev-mode only: no KYC provider (e.g. Cashfree DigiLocker) is wired up
  // yet, so this never actually checks the DL against government records.
  // It validates format + a plausible age, then records an unconditional
  // "verified" outcome so the onboarding flow and hub screen have something
  // real to reflect. The raw DL number/DOB are used only for that check and
  // are never persisted — verification_records stores outcomes, not
  // documents, matching the PRD's "no raw government-ID numbers ... in
  // storage" rule.
  async submitDl(
    userId: string,
    dto: SubmitDlVerificationDto,
  ): Promise<VerificationStatusDto> {
    this.assertDevVerificationAllowed();

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    this.assertMinimumAge(dto.dateOfBirth);

    this.logger.log(
      `[dev-verification] DL submitted for user ${userId} — no KYC provider call made; recording a stub "verified" outcome.`,
    );

    await this.verificationRecordsRepository.save(
      this.verificationRecordsRepository.create({
        userId,
        type: VerificationRecordType.DL,
        status: VerificationRecordStatus.VERIFIED,
        providerRef: 'dev-mode-stub',
      }),
    );

    return this.getStatusForUser(userId);
  }

  // Dev-mode only: no transport-department lookup happens, the registration
  // number is validated for format only. Unlike DL/Aadhaar, this DOES
  // persist data beyond the check's outcome — make/model/registration
  // number are real vehicle attributes, not a document number, so they're
  // written to the (pre-existing, previously unused) vehicles table.
  // Colour/seat capacity aren't collected here and stay null until a
  // dedicated vehicle-management screen exists. Single-vehicle onboarding
  // for now: this updates the driver's one Vehicle row if they already
  // have one, rather than creating a duplicate.
  async submitRc(
    userId: string,
    dto: SubmitRcVerificationDto,
  ): Promise<VerificationStatusDto> {
    this.assertDevVerificationAllowed();

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    this.logger.log(
      `[dev-verification] RC submitted for user ${userId} — no transport-department lookup made; recording a stub "verified" outcome.`,
    );

    await this.verificationRecordsRepository.save(
      this.verificationRecordsRepository.create({
        userId,
        type: VerificationRecordType.RC,
        status: VerificationRecordStatus.VERIFIED,
        providerRef: 'dev-mode-stub',
      }),
    );

    const existingVehicle = await this.vehiclesRepository.findOne({
      where: { ownerId: userId },
    });
    await this.vehiclesRepository.save(
      this.vehiclesRepository.create({
        ...(existingVehicle ?? {}),
        ownerId: userId,
        make: dto.make,
        model: dto.model,
        registrationNumber: dto.registrationNumber,
      }),
    );

    return this.getStatusForUser(userId);
  }

  // Dev-mode only. No camera/liveness capture happens on the client and no
  // selfie is ever sent here — there's no KYC provider (e.g. Cashfree) wired
  // up to face-match it against anything, so a real photo would have
  // nowhere to go. With no real quality signal to check, the caller states
  // the outcome (see SubmitLivenessDto) and it's recorded as-is — a real
  // provider integration would replace `outcome` entirely with its verdict.
  // Each call appends a new row, so a rejected attempt followed by a
  // verified one is a real, visible audit trail, not an overwrite.
  async submitLiveness(
    userId: string,
    outcome: 'pass' | 'fail' = 'pass',
  ): Promise<VerificationStatusDto> {
    this.assertDevVerificationAllowed();

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const status =
      outcome === 'fail'
        ? VerificationRecordStatus.REJECTED
        : VerificationRecordStatus.VERIFIED;

    this.logger.log(
      `[dev-verification] Liveness "captured" for user ${userId} — no camera capture or face-match provider call made; recording a stub "${status}" outcome.`,
    );

    await this.verificationRecordsRepository.save(
      this.verificationRecordsRepository.create({
        userId,
        type: VerificationRecordType.LIVENESS,
        status,
        providerRef: 'dev-mode-stub',
      }),
    );

    return this.getStatusForUser(userId);
  }

  // Optional (step 5). Two checks here are real, not dev-mode fakes: the
  // Verhoeff checksum (public algorithm — confirms the number is
  // well-formed, not that UIDAI actually issued it) and the consent capture
  // (stamped as consentGivenAt, satisfying the DPDP Act's "explicit
  // consent at submission" requirement). What's still a dev-mode stub is
  // the "verified" outcome itself — no UIDAI/DigiLocker call happens, and
  // the raw Aadhaar number is validated in memory only, never persisted.
  async submitAadhaar(
    userId: string,
    dto: SubmitAadhaarVerificationDto,
  ): Promise<VerificationStatusDto> {
    this.assertDevVerificationAllowed();

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (!isValidVerhoeff(dto.aadhaarNumber)) {
      throw new BadRequestException(
        'aadhaarNumber failed checksum validation — check the digits and try again.',
      );
    }

    this.logger.log(
      `[dev-verification] Aadhaar submitted for user ${userId} — no UIDAI/DigiLocker call made; recording a stub "verified" outcome. Consent captured.`,
    );

    await this.verificationRecordsRepository.save(
      this.verificationRecordsRepository.create({
        userId,
        type: VerificationRecordType.AADHAAR,
        status: VerificationRecordStatus.VERIFIED,
        providerRef: 'dev-mode-stub',
        consentGivenAt: new Date(),
      }),
    );

    return this.getStatusForUser(userId);
  }

  private assertMinimumAge(dateOfBirth: string): void {
    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime()) || dob > new Date()) {
      throw new BadRequestException('dateOfBirth must be a valid past date.');
    }

    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age -= 1;
    }
    if (age < MINIMUM_DRIVER_AGE) {
      throw new BadRequestException(
        `You must be at least ${MINIMUM_DRIVER_AGE} to drive on this platform.`,
      );
    }
  }

  private assertDevVerificationAllowed(): void {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new ServiceUnavailableException(
        'DL verification is not configured. A real KYC provider must be wired up before this runs in production.',
      );
    }
  }

  private latestTaskFor(
    records: VerificationRecord[],
    type: VerificationRecordType,
  ): VerificationTaskDto {
    const latest = records.find((record) => record.type === type);
    const status: VerificationTaskStatus = latest?.status ?? 'not_started';
    return { status };
  }
}
