export type UserRole = 'student' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'suspended';

export interface User {
  id: string;
  fullName: string;
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
