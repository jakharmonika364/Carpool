import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { Msg91OtpProvider } from './msg91-otp.provider';
import { OtpProviderUnavailableError } from './otp-provider';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Msg91OtpProvider', () => {
  let provider: Msg91OtpProvider;
  let fetchMock: jest.Mock<typeof fetch>;
  const originalFetch = global.fetch;
  const phone = '+919876543210';

  beforeEach(() => {
    const config: Record<string, string> = {
      MSG91_AUTH_KEY: 'test-authkey',
      MSG91_TEMPLATE_ID: 'tmpl-1',
    };
    provider = new Msg91OtpProvider({
      get: (key: string) => config[key],
    } as unknown as ConfigService);
    fetchMock = jest.fn<typeof fetch>();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('needs both an authkey and a template id to count as configured', () => {
    const only = (config: Record<string, string>) =>
      new Msg91OtpProvider({
        get: (key: string) => config[key],
      } as unknown as ConfigService).isConfigured();
    expect(provider.isConfigured()).toBe(true);
    expect(only({ MSG91_AUTH_KEY: 'k' })).toBe(false);
    expect(only({ MSG91_TEMPLATE_ID: 't' })).toBe(false);
  });

  describe('sendOtp', () => {
    it('posts to the OTP endpoint with the authkey in a header, not the URL', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { type: 'success', message: 'req-id' }),
      );
      await provider.sendOtp(phone);

      const [url, init] = fetchMock.mock.calls[0];
      const parsed = new URL(url as string);
      expect(parsed.origin + parsed.pathname).toBe(
        'https://control.msg91.com/api/v5/otp',
      );
      expect(parsed.searchParams.get('mobile')).toBe('919876543210');
      expect(parsed.searchParams.get('template_id')).toBe('tmpl-1');
      expect(parsed.searchParams.get('otp_length')).toBe('6');
      expect(url).not.toContain('test-authkey');
      expect(init?.method).toBe('POST');
      expect((init?.headers as Record<string, string>).authkey).toBe(
        'test-authkey',
      );
    });

    it.each([
      [200, { type: 'error', message: 'Template not found' }],
      [401, { type: 'error', message: 'Authentication failure' }],
      [500, null],
    ])('treats a failed send (%i) as unavailable', async (status, body) => {
      fetchMock.mockResolvedValue(jsonResponse(status, body));
      await expect(provider.sendOtp(phone)).rejects.toBeInstanceOf(
        OtpProviderUnavailableError,
      );
    });

    it('treats a network failure as unavailable', async () => {
      fetchMock.mockRejectedValue(new Error('socket hang up'));
      await expect(provider.sendOtp(phone)).rejects.toBeInstanceOf(
        OtpProviderUnavailableError,
      );
    });
  });

  describe('verifyOtp', () => {
    it('returns valid on success and sends mobile and otp', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { type: 'success', message: 'OTP verified success' }),
      );
      await expect(provider.verifyOtp(phone, '123456')).resolves.toBe('valid');

      const [url, init] = fetchMock.mock.calls[0];
      const parsed = new URL(url as string);
      expect(parsed.pathname).toBe('/api/v5/otp/verify');
      expect(parsed.searchParams.get('mobile')).toBe('919876543210');
      expect(parsed.searchParams.get('otp')).toBe('123456');
      expect(init?.method).toBe('GET');
    });

    it.each(['OTP not match', 'OTP expired', 'Mobile no. already verified'])(
      'returns invalid when the code is refused (%s)',
      async (message) => {
        fetchMock.mockResolvedValue(
          jsonResponse(200, { type: 'error', message }),
        );
        await expect(provider.verifyOtp(phone, '000000')).resolves.toBe(
          'invalid',
        );
      },
    );

    it('treats an unrecognised error as unavailable, never as a pass', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, { type: 'error', message: 'Authentication failure' }),
      );
      await expect(provider.verifyOtp(phone, '123456')).rejects.toBeInstanceOf(
        OtpProviderUnavailableError,
      );
    });

    it('treats a network failure as unavailable', async () => {
      fetchMock.mockRejectedValue(new Error('timeout'));
      await expect(provider.verifyOtp(phone, '123456')).rejects.toBeInstanceOf(
        OtpProviderUnavailableError,
      );
    });
  });
});
