// Stable internal interface over whichever KYC vendor is in use (PRD 5.8,
// adapter pattern). Callers never see vendor request/response shapes, so
// swapping providers later doesn't touch VerificationService.

export const KYC_PROVIDER = Symbol('KYC_PROVIDER');

export interface KycOutcome {
  // "rejected" means the provider answered and the document did not check
  // out. A provider that couldn't answer at all throws
  // KycProviderUnavailableError instead — that is never an outcome.
  status: 'verified' | 'rejected';
  providerRef: string;
  // Internal only (logs). Never shown to users: PRD 5.9 forbids exposing
  // provider error details.
  reason?: string;
}

export interface KycProvider {
  isConfigured(): boolean;
  verifyDrivingLicence(input: {
    dlNumber: string;
    dateOfBirth: string;
  }): Promise<KycOutcome>;
  verifyVehicleRc(input: { registrationNumber: string }): Promise<KycOutcome>;
}

// Thrown for timeouts, network failures, auth/IP/balance problems and rate
// limits — anything where we don't have a real answer about the document.
// PRD 9.8: an uncertain check must surface as "try again", never as a pass.
export class KycProviderUnavailableError extends Error {}
