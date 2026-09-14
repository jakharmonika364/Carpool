import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { toPublicUser } from '../users/users.mapper';
import { AUTH_BLACKLIST_PREFIX } from './auth.constants';
import { AuthenticatedUser } from './strategies/jwt.strategy';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.usersService.createStudent({
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      passwordHash,
    });

    return this.buildAuthResponse(user.id, user.email, user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
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
    email: string,
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
