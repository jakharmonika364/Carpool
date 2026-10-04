import { ApiProperty } from '@nestjs/swagger';
import { VerificationRecordType } from '../../database/entities/verification-record.entity';

export type VerificationTaskStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'review';

export class VerificationTaskDto {
  @ApiProperty({
    enum: ['not_started', 'pending', 'verified', 'rejected', 'review'],
  })
  status: VerificationTaskStatus;
}

export class VehicleSummaryDto {
  @ApiProperty()
  make: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  registrationNumber: string;
}

export class VerificationStatusDto {
  @ApiProperty({ description: 'First/last name and gender all saved.' })
  identityComplete: boolean;

  @ApiProperty({ type: VerificationTaskDto })
  dl: VerificationTaskDto;

  @ApiProperty({ type: VerificationTaskDto })
  liveness: VerificationTaskDto;

  @ApiProperty({ type: VerificationTaskDto })
  rc: VerificationTaskDto;

  @ApiProperty({
    type: VerificationTaskDto,
    description: 'Optional (driver-onboarding step 5) — never affects nextStep.',
  })
  aadhaar: VerificationTaskDto;

  @ApiProperty({
    enum: [...Object.values(VerificationRecordType), null],
    nullable: true,
    description:
      'First required task (in dl, rc, liveness order) that is not yet verified, or null once all three are. Aadhaar is optional and never appears here.',
  })
  nextStep: VerificationRecordType | null;

  @ApiProperty({ type: VehicleSummaryDto, nullable: true })
  vehicle: VehicleSummaryDto | null;
}
