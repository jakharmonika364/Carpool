import { jest } from '@jest/globals';
import { constants, generateKeyPairSync, privateDecrypt } from 'crypto';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { CashfreeKycProvider } from './cashfree-kyc.provider';
import { KycProviderUnavailableError } from './kyc-provider';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('CashfreeKycProvider', () => {
  let provider: CashfreeKycProvider;
  let fetchMock: jest.Mock<typeof fetch>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    const config = {
      CASHFREE_CLIENT_ID: 'test-id',
      CASHFREE_CLIENT_SECRET: 'test-secret',
    } as Record<string, string>;
    provider = new CashfreeKycProvider({
      get: (key: string) => config[key],
    } as unknown as ConfigService);
    fetchMock = jest.fn<typeof fetch>();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('is not configured without credentials', () => {
    const empty = new CashfreeKycProvider({
      get: () => undefined,
    } as unknown as ConfigService);
    expect(empty.isConfigured()).toBe(false);
    expect(provider.isConfigured()).toBe(true);
  });

  describe('verifyDrivingLicence', () => {
    const input = { dlNumber: 'KA0120198900984', dateOfBirth: '1994-08-05' };

    it('verifies a VALID, unexpired licence and sends the expected request', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          reference_id: 42,
          status: 'VALID',
          dl_validity: { non_transport: { to: '09/05/2099' } },
        }),
      );

      await expect(provider.verifyDrivingLicence(input)).resolves.toEqual({
        status: 'verified',
        providerRef: '42',
      });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(
        'https://sandbox.cashfree.com/verification/driving-license',
      );
      expect((init?.headers as Record<string, string>)['x-client-id']).toBe(
        'test-id',
      );
      const sent = JSON.parse(init?.body as string);
      expect(sent).toMatchObject({
        dl_number: 'KA0120198900984',
        dob: '1994-08-05',
      });
      expect(sent.verification_id).toMatch(/^dl-[0-9a-f-]{36}$/);
    });

    it('rejects an INVALID licence', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { reference_id: 7, status: 'INVALID' }),
      );
      await expect(provider.verifyDrivingLicence(input)).resolves.toMatchObject(
        { status: 'rejected', providerRef: '7' },
      );
    });

    it('rejects a VALID licence whose non-transport validity has passed', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          reference_id: 8,
          status: 'VALID',
          dl_validity: { non_transport: { to: '01/01/2001' } },
        }),
      );
      await expect(provider.verifyDrivingLicence(input)).resolves.toMatchObject(
        { status: 'rejected', reason: 'licence expired' },
      );
    });

    it('treats a malformed-licence 400 as a rejection, not an outage', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(400, {
          type: 'validation_error',
          code: 'driving_license_value_invalid',
          message: 'driving license is invalid',
        }),
      );
      await expect(provider.verifyDrivingLicence(input)).resolves.toMatchObject(
        { status: 'rejected' },
      );
    });

    it.each([
      [401, 'authentication_failed'],
      [403, 'ip_validation_failed'],
      [422, 'insufficient_balance'],
      [429, 'too_many_requests_per_ip'],
      [502, 'verification_failed'],
    ])(
      'never turns a %i %s into a pass or a rejection',
      async (status, code) => {
        fetchMock.mockResolvedValue(jsonResponse(status, { code, type: 'x' }));
        await expect(
          provider.verifyDrivingLicence(input),
        ).rejects.toBeInstanceOf(KycProviderUnavailableError);
      },
    );

    it('treats a network failure or timeout as unavailable', async () => {
      fetchMock.mockRejectedValue(new Error('socket hang up'));
      await expect(provider.verifyDrivingLicence(input)).rejects.toBeInstanceOf(
        KycProviderUnavailableError,
      );
    });
  });

  describe('verifyVehicleRc', () => {
    const input = { registrationNumber: 'HJ01ME5678' };

    it('verifies a VALID, active, non-commercial RC', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          reference_id: 9,
          status: 'VALID',
          rc_status: 'ACTIVE',
          is_commercial: false,
        }),
      );
      await expect(provider.verifyVehicleRc(input)).resolves.toEqual({
        status: 'verified',
        providerRef: '9',
      });
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://sandbox.cashfree.com/verification/vehicle-rc');
      expect(JSON.parse(init?.body as string)).toMatchObject({
        vehicle_number: 'HJ01ME5678',
      });
    });

    it('rejects a commercial registration (PRD: personal vehicles only)', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          reference_id: 10,
          status: 'VALID',
          rc_status: 'ACTIVE',
          is_commercial: true,
        }),
      );
      await expect(provider.verifyVehicleRc(input)).resolves.toMatchObject({
        status: 'rejected',
        reason: 'commercial registration',
      });
    });

    it('rejects an RC that is not active', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          reference_id: 11,
          status: 'VALID',
          rc_status: 'CANCELLED',
          is_commercial: false,
        }),
      );
      await expect(provider.verifyVehicleRc(input)).resolves.toMatchObject({
        status: 'rejected',
        reason: 'RC not active',
      });
    });

    it('rejects an INVALID RC', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { reference_id: 12, status: 'INVALID' }),
      );
      await expect(provider.verifyVehicleRc(input)).resolves.toMatchObject({
        status: 'rejected',
      });
    });
  });
  describe('x-cf-signature (Public Key 2FA)', () => {
    const dl = { dlNumber: 'KA0120198900984', dateOfBirth: '1994-08-05' };
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    const keyPath = join(
      mkdtempSync(join(tmpdir(), 'cf-key-')),
      'cashfree-public.pem',
    );
    writeFileSync(keyPath, publicKey.export({ type: 'spki', format: 'pem' }));

    function providerWith(config: Record<string, string>) {
      return new CashfreeKycProvider({
        get: (key: string) => config[key],
      } as unknown as ConfigService);
    }

    const base = {
      CASHFREE_CLIENT_ID: 'test-id',
      CASHFREE_CLIENT_SECRET: 'test-secret',
    };

    it('sends no signature header when no key path is configured', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, { status: 'INVALID' }));
      await providerWith(base).verifyDrivingLicence(dl);
      const headers = fetchMock.mock.calls[0][1]?.headers as Record<
        string,
        string
      >;
      expect(headers['x-cf-signature']).toBeUndefined();
    });

    it('sends RSA-OAEP(SHA-1) of "<clientId>.<unix seconds>" in base64', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, { status: 'INVALID' }));
      const before = Math.floor(Date.now() / 1000);
      await providerWith({
        ...base,
        CASHFREE_PUBLIC_KEY_PATH: keyPath,
      }).verifyDrivingLicence(dl);
      const after = Math.floor(Date.now() / 1000);

      const headers = fetchMock.mock.calls[0][1]?.headers as Record<
        string,
        string
      >;
      const plaintext = privateDecrypt(
        {
          key: privateKey,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha1',
        },
        Buffer.from(headers['x-cf-signature'], 'base64'),
      ).toString();

      const [clientId, timestamp] = plaintext.split('.');
      expect(clientId).toBe('test-id');
      expect(Number(timestamp)).toBeGreaterThanOrEqual(before);
      expect(Number(timestamp)).toBeLessThanOrEqual(after);
    });

    it('fails closed (unavailable) when the configured key file is unreadable', async () => {
      await expect(
        providerWith({
          ...base,
          CASHFREE_PUBLIC_KEY_PATH: join(tmpdir(), 'does-not-exist.pem'),
        }).verifyDrivingLicence(dl),
      ).rejects.toBeInstanceOf(KycProviderUnavailableError);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
