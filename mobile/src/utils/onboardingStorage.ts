import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ONBOARDING_COMPLETE_KEY = 'campus_carpool_onboarding_complete';

// expo-secure-store has no web implementation, so the browser build falls back to localStorage.
export const onboardingStorage =
  Platform.OS === 'web'
    ? {
        async hasCompletedOnboarding(): Promise<boolean> {
          return window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
        },
        async setOnboardingComplete(): Promise<void> {
          window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        },
      }
    : {
        async hasCompletedOnboarding(): Promise<boolean> {
          return (await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY)) === 'true';
        },
        async setOnboardingComplete(): Promise<void> {
          await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, 'true');
        },
      };
