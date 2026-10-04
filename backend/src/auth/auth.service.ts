import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { toPublicUser } from '../users/users.mapper';
import { AUTH_BLACKLIST_PREFIX } from './auth.constants';
import { AuthenticatedUser } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
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

  // Dev-mode phone/OTP signup: no SMS/WhatsApp provider is wired up yet, so
  // this never sends a real message. It exists so the mobile onboarding
  // flow (phone entry -> OTP -> role selection -> driver profile) has a real
  // account and token behind it instead of running entirely client-side.
  // requestOtp() intentionally does nothing but log — verifyOtp() accepts
  // any 6-digit code (already enforced by VerifyOtpDto's validator).
  async requestOtp(dto: RequestOtpDto): Promise<{ devMode: true }> {
    this.assertDevOtpAllowed();
    this.logger.log(
      `[dev-otp] ${dto.channel} OTP requested for ${dto.phoneNumber} — no real message sent; any 6-digit code will be accepted on verify.`,
    );
    return { devMode: true };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    this.assertDevOtpAllowed();
    const user = await this.usersService.findOrCreateByPhoneNumber(
      dto.phoneNumber,
    );
    return this.buildAuthResponse(user.id, user.email, user);
  }

  private assertDevOtpAllowed(): void {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new ServiceUnavailableException(
        'OTP delivery is not configured. A real SMS/WhatsApp provider must be wired up before this runs in production.',
      );
    }
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
