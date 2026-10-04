import { create } from 'zustand';
import type { Gender } from '../types/user';

// Holds the driver-onboarding wizard's answers across its steps (Identity,
// Driver's Licence, Vehicle/RC, Liveness selfie, Review) purely in memory.
// Nothing here is persisted yet: there is no signup/OTP backend to save it
// to. Once that exists, the final review step submits this object in one
// call and the store is cleared.
interface DriverOnboardingState {
  countryCode: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender | null;
  currentStep: number;
  totalSteps: number;
  setPhone: (countryCode: string, phone: string) => void;
  setIdentity: (fields: {
    firstName: string;
    lastName: string;
    email: string;
    gender: Gender;
  }) => void;
  reset: () => void;
}

const initialState = {
  countryCode: '',
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
  gender: null as Gender | null,
  currentStep: 1,
  totalSteps: 5,
};

export const useDriverOnboardingStore = create<DriverOnboardingState>((set) => ({
  ...initialState,

  setPhone: (countryCode, phone) => set({ countryCode, phone }),

  setIdentity: (fields) =>
    set({
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
      gender: fields.gender,
      currentStep: 2,
    }),

  reset: () => set({ ...initialState }),
}));
