import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpProvider, OtpProviderUnavailableError } from './otp-provider';

const BASE_URL = 'https://control.msg91.com/api/v5';
const REQUEST_TIMEOUT_MS = 10_000;
const OTP_LENGTH = 6; // matches VerifyOtpDto's 6-digit check.
const OTP_EXPIRY_MINUTES = 10;

// MSG91 answers {"type": "success" | "error", "message": "..."}. For verify,
// these messages mean the code itself was refused (as opposed to a problem
// with our credentials, template, balance or their service).
const CODE_REFUSED =
  /otp.*(not match|invalid|expired|incorrect)|invalid otp|already verified/i;

interface Msg91Body {
  type?: string;
  message?: string;
}

// Needs MSG91_AUTH_KEY and MSG91_TEMPLATE_ID (an OTP template; for SMS in
// India it must be DLT-approved or messages are silently dropped by
// carriers). If the authkey has IP Security on, this server's IP must be
// whitelisted in MSG91.
@Injectable()
export class Msg91OtpProvider implements OtpProvider {
  private readonly logger = new Logger(Msg91OtpProvider.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.authKey && this.templateId);
  }

  async sendOtp(phoneNumber: string): Promise<void> {
    const query = new URLSearchParams({
      template_id: this.templateId ?? '',
      mobile: toMsisdn(phoneNumber),
      otp_length: String(OTP_LENGTH),
      otp_expiry: String(OTP_EXPIRY_MINUTES),
    });
    const { ok, body } = await this.call('POST', `/otp?${query}`);

    if (!ok || body?.type !== 'success') {
      this.logFailure('send', body);
      throw new OtpProviderUnavailableError('MSG91 did not accept the send.');
    }
  }

  async verifyOtp(
    phoneNumber: string,
    code: string,
  ): Promise<'valid' | 'invalid'> {
    const query = new URLSearchParams({
      mobile: toMsisdn(phoneNumber),
      otp: code,
    });
    const { ok, body } = await this.call('GET', `/otp/verify?${query}`);

    if (ok && body?.type === 'success') {
      return 'valid';
    }
    if (body?.type === 'error' && CODE_REFUSED.test(body.message ?? '')) {
      return 'invalid';
    }

    this.logFailure('verify', body);
    throw new OtpProviderUnavailableError('MSG91 could not verify.');
  }

  private get authKey(): string | undefined {
    return this.configService.get<string>('MSG91_AUTH_KEY') || undefined;
  }

  private get templateId(): string | undefined {
    return this.configService.get<string>('MSG91_TEMPLATE_ID') || undefined;
  }

  // The authkey goes in a header, never the URL, so it can't end up in logs.
  private async call(
    method: 'GET' | 'POST',
    path: string,
  ): Promise<{ ok: boolean; body: Msg91Body | null }> {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          authkey: this.authKey ?? '',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error(`MSG91 request failed: ${(error as Error).name}`);
      throw new OtpProviderUnavailableError('MSG91 request failed.');
    }

    const body = (await response.json().catch(() => null)) as Msg91Body | null;
    return { ok: response.ok, body };
  }

  // MSG91's message text is generic ("Authentication failure", "Template
  // not found"), so it is safe to log and is what you need to diagnose a
  // misconfiguration. Phone numbers and codes are never logged.
  private logFailure(operation: string, body: Msg91Body | null): void {
    this.logger.error(
      `MSG91 ${operation} failed: ${body?.type ?? 'no-type'} — ${body?.message ?? 'no-message'}`,
    );
  }
}

// MSG91 wants the international number without the leading "+".
function toMsisdn(phoneNumber: string): string {
  return phoneNumber.replace(/^\+/, '');
}
