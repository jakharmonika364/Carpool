// Stable internal interface over the SMS/OTP vendor (PRD 5.8, adapter
// pattern), so AuthService never sees vendor request/response shapes.

export const OTP_PROVIDER = Symbol('OTP_PROVIDER');

export interface OtpProvider {
  isConfigured(): boolean;
  // phoneNumber is E.164 ("+919876543210").
  sendOtp(phoneNumber: string): Promise<void>;
  // "invalid" covers wrong, expired and already-used codes: the provider
  // answered and said no. A provider that couldn't answer throws
  // OtpProviderUnavailableError instead — that must never become a login
  // (PRD 9.8) or be reported to the user as "wrong code".
  verifyOtp(phoneNumber: string, code: string): Promise<'valid' | 'invalid'>;
}

export class OtpProviderUnavailableError extends Error {}
