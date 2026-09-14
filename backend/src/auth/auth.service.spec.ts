import { jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { UserRole, VerificationStatus } from '../database/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'createStudent' | 'findByEmail'>
  >;
  let jwtService: { sign: jest.Mock };
  let redisService: jest.Mocked<Pick<RedisService, 'set' | 'get'>>;

  const baseUser = {
    id: 'user-1',
    fullName: 'Student Name',
    email: 'student@university.edu',
    phoneNumber: '+919000000000',
    role: UserRole.STUDENT,
    verificationStatus: VerificationStatus.PENDING,
    profileImageKey: null,
  };

  beforeEach(() => {
    usersService = {
      createStudent: jest.fn(),
      findByEmail: jest.fn(),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };
    redisService = { set: jest.fn(), get: jest.fn() };

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as any,
      redisService as unknown as RedisService,
    );
  });

  describe('register', () => {
    it('hashes the password and returns an access token with the public user', async () => {
      usersService.createStudent.mockResolvedValue({
        ...baseUser,
        passwordHash: 'hashed',
      } as any);

      const result = await authService.register({
        fullName: 'Student Name',
        email: 'student@university.edu',
        phoneNumber: '+919000000000',
        password: 'SecurePassword123!',
      });

      expect(usersService.createStudent).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'student@university.edu',
          phoneNumber: '+919000000000',
        }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user.email).toBe('student@university.edu');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'missing@university.edu',
          password: 'whatever123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword123!', 4);
      usersService.findByEmail.mockResolvedValue({
        ...baseUser,
        passwordHash,
      } as any);

      await expect(
        authService.login({
          email: baseUser.email,
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns an access token when credentials are valid', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword123!', 4);
      usersService.findByEmail.mockResolvedValue({
        ...baseUser,
        passwordHash,
      } as any);

      const result = await authService.login({
        email: baseUser.email,
        password: 'CorrectPassword123!',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe(baseUser.email);
    });
  });

  describe('logout', () => {
    it('blacklists the token jti in Redis for its remaining lifetime', async () => {
      const exp = Math.floor(Date.now() / 1000) + 60;
      await authService.logout({
        id: 'user-1',
        email: baseUser.email,
        jti: 'jti-1',
        exp,
      });

      expect(redisService.set).toHaveBeenCalledWith(
        'auth:blacklist:jti-1',
        '1',
        expect.any(Number),
      );
    });
  });
});
