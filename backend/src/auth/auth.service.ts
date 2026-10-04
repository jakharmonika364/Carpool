import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { toPublicUser } from '../users/users.mapper';
import { AUTH_BLACKLIST_PREFIX } from './auth.constants';
import { AuthenticatedUser } from './strategies/jwt.strategy';
import {
  OTP_PROVIDER,
  OtpProvider,
  OtpProviderUnavailableError,
} from './otp/otp-provider';

// Per phone number, per window. A 6-digit code is guessable, so verify
// attempts are capped; sends are capped to limit SMS cost and abuse.
const OTP_WINDOW_SECONDS = 10 * 60;
const MAX_OTP_SENDS_PER_WINDOW = 5;
const MAX_OTP_VERIFY_ATTEMPTS_PER_WINDOW = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    @Inject(OTP_PROVIDER) private readonly otpProvider: OtpProvider,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.buildAuthResponse(user.id, user.email, user);
  }

  // Phone/OTP signup. With an OTP provider configured (MSG91_AUTH_KEY +
  // MSG91_TEMPLATE_ID) a real code is sent and checked. Without one, a
  // dev-mode stub is used so the onboarding flow still has a real account
  // behind it: nothing is sent and any 6-digit code (already enforced by
  // VerifyOtpDto's validator) is accepted. The stub never runs in production.
  async requestOtp(dto: RequestOtpDto): Promise<{ devMode: boolean }> {
    this.assertOtpAvailable();

    if (!this.otpProvider.isConfigured()) {
      this.logger.log(
        `[dev-otp] ${dto.channel} OTP requested for ${dto.phoneNumber} — no real message sent; any 6-digit code will be accepted on verify.`,
      );
      return { devMode: true };
    }

    // The provider integration sends SMS only; WhatsApp needs a separate
    // product and template. Say so instead of silently sending an SMS.
    if (dto.channel !== 'sms') {
      throw new BadRequestException(
        "WhatsApp codes aren't available yet. Please choose SMS.",
      );
    }

    await this.enforceLimit(
      'send',
      dto.phoneNumber,
      MAX_OTP_SENDS_PER_WINDOW,
      'Too many codes requested. Please wait a few minutes and try again.',
    );

    try {
      await this.otpProvider.sendOtp(dto.phoneNumber);
    } catch (error) {
      throw this.asServiceUnavailable(
        error,
        "We couldn't send your code right now. Please try again in a few minutes.",
      );
    }
    return { devMode: false };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    this.assertOtpAvailable();

    if (this.otpProvider.isConfigured()) {
      await this.enforceLimit(
        'verify',
        dto.phoneNumber,
        MAX_OTP_VERIFY_ATTEMPTS_PER_WINDOW,
        'Too many incorrect attempts. Please request a new code in a few minutes.',
      );

      let result: 'valid' | 'invalid';
      try {
        result = await this.otpProvider.verifyOtp(dto.phoneNumber, dto.code);
      } catch (error) {
        // PRD 9.8: a provider we couldn't reach is never a login, and is
        // not reported as a wrong code either.
        throw this.asServiceUnavailable(
          error,
          "We couldn't check your code right now. Please try again in a few minutes.",
        );
      }
      if (result === 'invalid') {
        throw new UnauthorizedException(
          'That code is incorrect or has expired.',
        );
      }
      await this.redisService.del(this.limitKey('verify', dto.phoneNumber));
    }

    const user = await this.usersService.findOrCreateByPhoneNumber(
      dto.phoneNumber,
    );
    return this.buildAuthResponse(user.id, user.email, user);
  }

  private assertOtpAvailable(): void {
    if (
      !this.otpProvider.isConfigured() &&
      this.configService.get<string>('NODE_ENV') === 'production'
    ) {
      throw new ServiceUnavailableException(
        'OTP delivery is not configured. A real SMS provider must be configured before this runs in production.',
      );
    }
  }

  // The phone number is hashed so it isn't stored in Redis keys.
  private limitKey(kind: 'send' | 'verify', phoneNumber: string): string {
    const hash = createHash('sha256').update(phoneNumber).digest('hex');
    return `otp:${kind}:${hash.slice(0, 32)}`;
  }

  private async enforceLimit(
    kind: 'send' | 'verify',
    phoneNumber: string,
    max: number,
    message: string,
  ): Promise<void> {
    const count = await this.redisService.incrementWithExpiry(
      this.limitKey(kind, phoneNumber),
      OTP_WINDOW_SECONDS,
    );
    if (count > max) {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private asServiceUnavailable(error: unknown, message: string): unknown {
    return error instanceof OtpProviderUnavailableError
      ? new ServiceUnavailableException(message)
      : error;
  }

  async logout(currentUser: AuthenticatedUser): Promise<void> {
    const ttlSeconds = currentUser.exp - Math.floor(Date.now() / 1000);
    if (ttlSeconds > 0) {
      await this.redisService.set(
        `${AUTH_BLACKLIST_PREFIX}${currentUser.jti}`,
        '1',
        ttlSeconds,
      );
    }
  }

  private buildAuthResponse(
    userId: string,
    email: string | null,
    user: Parameters<typeof toPublicUser>[0],
  ): AuthResponseDto {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { jwtid: randomUUID() },
    );
    return {
      accessToken,
      user: toPublicUser(user),
    };
  }
}
