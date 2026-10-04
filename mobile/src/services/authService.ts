import { apiClient } from './apiClient';
import { AuthResponse, DriverVerificationStatus, Gender, User } from '../types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RequestOtpPayload {
  phoneNumber: string;
  channel: 'sms' | 'whatsapp';
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  code: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: Gender;
  phoneNumber?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  // Dev-mode: no real SMS/WhatsApp provider is wired up on the backend yet.
  // This logs the request server-side; any 6-digit code passes verifyOtp.
  async requestOtp(payload: RequestOtpPayload): Promise<void> {
    await apiClient.post('/auth/otp/request', payload);
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/otp/verify', payload);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await apiClient.patch<User>('/users/me', payload);
    return data;
  },

  async getVerificationStatus(): Promise<DriverVerificationStatus> {
    const { data } = await apiClient.get<DriverVerificationStatus>('/users/me/verification');
    return data;
  },

  async submitDlVerification(payload: {
    dlNumber: string;
    dateOfBirth: string;
  }): Promise<DriverVerificationStatus> {
    const { data } = await apiClient.post<DriverVerificationStatus>(
      '/users/me/verification/dl',
      payload,
    );
    return data;
  },

  async submitRcVerification(payload: {
    registrationNumber: string;
    make: string;
    model: string;
  }): Promise<DriverVerificationStatus> {
    const { data } = await apiClient.post<DriverVerificationStatus>(
      '/users/me/verification/rc',
      payload,
    );
    return data;
  },

  async submitLivenessVerification(
    outcome: 'pass' | 'fail' = 'pass',
  ): Promise<DriverVerificationStatus> {
    const { data } = await apiClient.post<DriverVerificationStatus>(
      '/users/me/verification/liveness',
      { outcome },
    );
    return data;
  },

  async submitAadhaarVerification(payload: {
    aadhaarNumber: string;
    consent: true;
  }): Promise<DriverVerificationStatus> {
    const { data } = await apiClient.post<DriverVerificationStatus>(
      '/users/me/verification/aadhaar',
      payload,
    );
    return data;
  },
};
