export type UserRole = 'student' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'suspended';
export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export interface User {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  gender: Gender | null;
  email: string;
  phoneNumber: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  profileImageKey: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type VerificationTaskStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'review';

export type VerificationTaskType = 'dl' | 'liveness' | 'rc' | 'aadhaar';

export interface VehicleSummary {
  make: string;
  model: string;
  registrationNumber: string;
}

export interface DriverVerificationStatus {
  identityComplete: boolean;
  dl: { status: VerificationTaskStatus };
  liveness: { status: VerificationTaskStatus };
  rc: { status: VerificationTaskStatus };
  aadhaar: { status: VerificationTaskStatus };
  // dl/rc/liveness only — aadhaar is optional and never appears here.
  nextStep: Exclude<VerificationTaskType, 'aadhaar'> | null;
  vehicle: VehicleSummary | null;
}
