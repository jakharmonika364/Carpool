import { jest } from '@jest/globals';
import {
  BadRequestException,
  HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { OtpProvider, OtpProviderUnavailableError } from './otp/otp-provider';
import { UserRole, VerificationStatus } from '../database/entities/user.entity';

describe('AuthService OTP', () => {
  const phone = '+919876543210';
  const user = {
    id: 'user-1',
    fullName: '',
    email: null,
    phoneNumber: phone,
    role: UserRole.STUDENT,
    verificationStatus: VerificationStatus.PENDING,
    profileImageKey: null,
  };

  let provider: {
    isConfigured: jest.Mock<() => boolean>;
    sendOtp: jest.Mock<OtpProvider['sendOtp']>;
    verifyOtp: jest.Mock<OtpProvider['verifyOtp']>;
  };
  let redis: {
    incrementWithExpiry: jest.Mock<RedisService['incrementWithExpiry']>;
    del: jest.Mock<RedisService['del']>;
  };
  let usersService: {
    findOrCreateByPhoneNumber: jest.Mock<() => Promise<typeof user>>;
  };
  let env: string;
  let service: AuthService;

  beforeEach(() => {
    provider = {
      isConfigured: jest.fn<() => boolean>().mockReturnValue(true),
      sendOtp: jest.fn<OtpProvider['sendOtp']>().mockResolvedValue(undefined),
      verifyOtp: jest.fn<OtpProvider['verifyOtp']>().mockResolvedValue('valid'),
    };
    redis = {
      incrementWithExpiry: jest
        .fn<RedisService['incrementWithExpiry']>()
        .mockResolvedValue(1),
      del: jest.fn<RedisService['del']>().mockResolvedValue(undefined),
    };
    usersService = {
      findOrCreateByPhoneNumber: jest
        .fn<() => Promise<typeof user>>()
        .mockResolvedValue(user),
    };
    env = 'development';

    service = new AuthService(
      usersService as unknown as UsersService,
      { sign: jest.fn().mockReturnValue('signed.jwt.token') } as any,
      redis as unknown as RedisService,
      { get: () => env } as any,
      provider as unknown as OtpProvider,
    );
  });

  describe('requestOtp', () => {
    it('sends a real SMS when a provider is configured', async () => {
      await expect(
        service.requestOtp({ phoneNumber: phone, channel: 'sms' }),
      ).resolves.toEqual({ devMode: false });
      expect(provider.sendOtp).toHaveBeenCalledWith(phone);
    });

    it('rejects WhatsApp instead of silently sending an SMS', async () => {
      await expect(
        service.requestOtp({ phoneNumber: phone, channel: 'whatsapp' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(provider.sendOtp).not.toHaveBeenCalled();
    });

    it('rate limits sends per phone number', async () => {
      redis.incrementWithExpiry.mockResolvedValue(6);
      await expect(
        service.requestOtp({ phoneNumber: phone, channel: 'sms' }),
      ).rejects.toBeInstanceOf(HttpException);
      expect(provider.sendOtp).not.toHaveBeenCalled();
    });

    it('reports a provider outage as unavailable, not as success', async () => {
      provider.sendOtp.mockRejectedValue(new OtpProviderUnavailableError('x'));
      await expect(
        service.requestOtp({ phoneNumber: phone, channel: 'sms' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('uses the dev stub when no provider is configured', async () => {
      provider.isConfigured.mockReturnValue(false);
      await expect(
        service.requestOtp({ phoneNumber: phone, channel: 'sms' }),
      ).resolves.toEqual({ devMode: true });
      expect(provider.sendOtp).not.toHaveBeenCalled();
    });

    it('refuses the dev stub in production', async () => {
      provider.isConfigured.mockReturnValue(false);
      env = 'production';
      await expect(
        service.requestOtp({ phoneNumber: phone, channel: 'sms' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('verifyOtp', () => {
    it('logs in on a valid code and clears the attempt counter', async () => {
      const result = await service.verifyOtp({
        phoneNumber: phone,
        code: '123456',
      });
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(provider.verifyOtp).toHaveBeenCalledWith(phone, '123456');
      expect(redis.del).toHaveBeenCalled();
    });

    it('rejects a wrong or expired code and never creates the user', async () => {
      provider.verifyOtp.mockResolvedValue('invalid');
      await expect(
        service.verifyOtp({ phoneNumber: phone, code: '000000' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(usersService.findOrCreateByPhoneNumber).not.toHaveBeenCalled();
    });

    it('never logs in when the provider is unreachable (PRD 9.8)', async () => {
      provider.verifyOtp.mockRejectedValue(
        new OtpProviderUnavailableError('x'),
      );
      await expect(
        service.verifyOtp({ phoneNumber: phone, code: '123456' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(usersService.findOrCreateByPhoneNumber).not.toHaveBeenCalled();
    });

    it('blocks brute-force guessing after too many attempts', async () => {
      redis.incrementWithExpiry.mockResolvedValue(6);
      await expect(
        service.verifyOtp({ phoneNumber: phone, code: '123456' }),
      ).rejects.toBeInstanceOf(HttpException);
      expect(provider.verifyOtp).not.toHaveBeenCalled();
    });

    it('keeps phone numbers out of Redis keys', async () => {
      await service.verifyOtp({ phoneNumber: phone, code: '123456' });
      const key = redis.incrementWithExpiry.mock.calls[0][0];
      expect(key).not.toContain('9876543210');
    });

    it('accepts any code in dev mode when no provider is configured', async () => {
      provider.isConfigured.mockReturnValue(false);
      const result = await service.verifyOtp({
        phoneNumber: phone,
        code: '654321',
      });
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(provider.verifyOtp).not.toHaveBeenCalled();
    });
  });
});
