import { create } from 'zustand';
import { tokenStorage } from '../utils/tokenStorage';
import { authService, LoginPayload, RegisterPayload, UpdateProfilePayload } from '../services/authService';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  isHydrating: boolean;
  isSubmitting: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrating: true,
  isSubmitting: false,
  error: null,

  hydrate: async () => {
    const token = await tokenStorage.getToken();
    if (!token) {
      set({ isHydrating: false });
      return;
    }
    try {
      const user = await authService.getCurrentUser();
      set({ user, isHydrating: false });
    } catch {
      await tokenStorage.clearToken();
      set({ user: null, isHydrating: false });
    }
  },

  register: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { accessToken, user } = await authService.register(payload);
      await tokenStorage.setToken(accessToken);
      set({ user, isSubmitting: false });
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  login: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const { accessToken, user } = await authService.login(payload);
      await tokenStorage.setToken(accessToken);
      set({ user, isSubmitting: false });
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      await tokenStorage.clearToken();
      set({ user: null });
    }
  },

  updateProfile: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const user = await authService.updateProfile(payload);
      set({ user, isSubmitting: false });
    } catch (error) {
      set({ isSubmitting: false });
      throw error;
    }
  },
}));
