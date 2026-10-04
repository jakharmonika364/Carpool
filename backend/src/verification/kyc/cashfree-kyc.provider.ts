import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { constants, publicEncrypt, randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import {
  KycOutcome,
  KycProvider,
  KycProviderUnavailableError,
} from './kyc-provider';

const DEFAULT_BASE_URL = 'https://sandbox.cashfree.com/verification';
const REQUEST_TIMEOUT_MS = 10_000; // PRD 3.5: DL/RC check under 10s.

interface CashfreeDlResponse {
  reference_id?: number;
  status?: string;
  dl_validity?: { non_transport?: { to?: string | null } | null } | null;
}

interface CashfreeRcResponse {
  reference_id?: number;
  status?: string;
  rc_status?: string | null;
  is_commercial?: boolean | null;
}

// Sandbox (https://sandbox.cashfree.com/verification) only recognises
// Cashfree's published test numbers; point CASHFREE_BASE_URL at
// https://api.cashfree.com/verification (with live credentials) for
// production. Two-factor auth is either IP whitelisting (nothing extra to
// send) or the "Public Key" method, used when the server's IP changes: set
// CASHFREE_PUBLIC_KEY_PATH to the .pem Cashfree generated and every request
// carries a fresh x-cf-signature. Send the header only when Public Key is
// the active method in the dashboard.
@Injectable()
export class CashfreeKycProvider implements KycProvider {
  private readonly logger = new Logger(CashfreeKycProvider.name);
  private publicKeyPem?: string;

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  async verifyDrivingLicence(input: {
    dlNumber: string;
    dateOfBirth: string;
  }): Promise<KycOutcome> {
    const verificationId = this.newVerificationId('dl');
    const body = await this.post<CashfreeDlResponse>(
      '/driving-license',
      {
        verification_id: verificationId,
        dl_number: input.dlNumber,
        dob: input.dateOfBirth,
      },
      'driving_license_value_invalid',
    );
    const providerRef = String(body?.reference_id ?? verificationId);

    if (!body || body.status !== 'VALID') {
      return {
        status: 'rejected',
        providerRef,
        reason: 'provider reported the licence as invalid',
      };
    }

    // Drivers use their own (non-transport) vehicle, so that's the validity
    // window that matters. If the date is absent we trust the provider's
    // VALID; if present and past, reject.
    const expiry = parseDdMmYyyy(body.dl_validity?.non_transport?.to);
    if (expiry && expiry.getTime() < Date.now()) {
      return { status: 'rejected', providerRef, reason: 'licence expired' };
    }

    return { status: 'verified', providerRef };
  }

  async verifyVehicleRc(input: {
    registrationNumber: string;
  }): Promise<KycOutcome> {
    const verificationId = this.newVerificationId('rc');
    const body = await this.post<CashfreeRcResponse>(
      '/vehicle-rc',
      {
        verification_id: verificationId,
        vehicle_number: input.registrationNumber,
      },
      'vehicle_rc_value_invalid',
    );
    const providerRef = String(body?.reference_id ?? verificationId);

    if (!body || body.status !== 'VALID') {
      return {
        status: 'rejected',
        providerRef,
        reason: 'provider reported the RC as invalid',
      };
    }

    // PRD 1.6: personal, white-board vehicles only — no commercial cabs.
    if (body.is_commercial === true) {
      return {
        status: 'rejected',
        providerRef,
        reason: 'commercial registration',
      };
    }
    if (body.rc_status && body.rc_status.toUpperCase() !== 'ACTIVE') {
      return { status: 'rejected', providerRef, reason: 'RC not active' };
    }

    return { status: 'verified', providerRef };
  }

  private get clientId(): string | undefined {
    return this.configService.get<string>('CASHFREE_CLIENT_ID') || undefined;
  }

  private get clientSecret(): string | undefined {
    return (
      this.configService.get<string>('CASHFREE_CLIENT_SECRET') || undefined
    );
  }

  // RSA-OAEP (SHA-1 / MGF1) of "<clientId>.<unix seconds>" with Cashfree's
  // public key, base64-encoded. Valid ~5 minutes, so one per request.
  // Returns undefined when no key path is configured (IP-whitelist mode). A
  // configured but unreadable key throws rather than silently sending an
  // unsigned request that Cashfree would answer with a confusing 403.
  private buildSignature(): string | undefined {
    const keyPath = this.configService.get<string>('CASHFREE_PUBLIC_KEY_PATH');
    if (!keyPath) {
      return undefined;
    }

    if (!this.publicKeyPem) {
      try {
        this.publicKeyPem = readFileSync(keyPath, 'utf8');
      } catch {
        this.logger.error('Cashfree public key file could not be read.');
        throw new KycProviderUnavailableError('Cashfree key unreadable.');
      }
    }

    try {
      const plaintext = `${this.clientId}.${Math.floor(Date.now() / 1000)}`;
      return publicEncrypt(
        {
          key: this.publicKeyPem,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha1',
        },
        Buffer.from(plaintext),
      ).toString('base64');
    } catch {
      this.logger.error('Cashfree signature could not be generated.');
      throw new KycProviderUnavailableError('Cashfree signing failed.');
    }
  }

  // Cashfree: max 50 chars, alphanumerics / . / - / _ only, unique per call.
  private newVerificationId(prefix: string): string {
    return `${prefix}-${randomUUID()}`;
  }

  // Returns the parsed body, or null when Cashfree rejected the input itself
  // as malformed (invalidInputCode) — that's a real "no", not an outage.
  // Anything else non-2xx (bad credentials, IP not whitelisted, no balance,
  // rate limit, 5xx) throws KycProviderUnavailableError. Only error codes are
  // logged, never request bodies, so no document numbers reach the logs.
  private async post<T>(
    path: string,
    payload: Record<string, string>,
    invalidInputCode: string,
  ): Promise<T | null> {
    const baseUrl =
      this.configService.get<string>('CASHFREE_BASE_URL') || DEFAULT_BASE_URL;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-client-id': this.clientId ?? '',
      'x-client-secret': this.clientSecret ?? '',
    };
    const signature = this.buildSignature();
    if (signature) {
      headers['x-cf-signature'] = signature;
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.error(
        `Cashfree ${path} request failed: ${(error as Error).name}`,
      );
      throw new KycProviderUnavailableError('Cashfree request failed.');
    }

    const body = (await response.json().catch(() => null)) as
      (T & { code?: string; type?: string }) | null;

    if (response.ok) {
      return body;
    }

    if (response.status === 400 && body?.code === invalidInputCode) {
      return null;
    }

    this.logger.error(
      `Cashfree ${path} returned ${response.status} ${body?.code ?? 'no-code'} (${body?.type ?? 'no-type'}).`,
    );
    throw new KycProviderUnavailableError(
      `Cashfree responded ${response.status}.`,
    );
  }
}

// Cashfree dates in dl_validity are DD/MM/YYYY. Returns end-of-day UTC so a
// licence is still good on its expiry date.
function parseDdMmYyyy(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null;
  }
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }
  return new Date(
    Date.UTC(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
      23,
      59,
      59,
    ),
  );
}
