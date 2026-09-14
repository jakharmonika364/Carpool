import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { Loading } from '../components/Loading';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { useAuthStore } from '../store/authStore';
import { onboardingStorage } from '../utils/onboardingStorage';

const MIN_SPLASH_DURATION_MS = 1200;

export function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hydrate = useAuthStore((state) => state.hydrate);
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    hydrate();
    onboardingStorage.hasCompletedOnboarding().then(setHasOnboarded);
    const timer = setTimeout(() => setMinDurationElapsed(true), MIN_SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [hydrate]);

  if (isHydrating || !minDurationElapsed || hasOnboarded === null) {
    return <Loading />;
  }

  if (!hasOnboarded) {
    return (
      <OnboardingScreen
        onComplete={() => {
          onboardingStorage.setOnboardingComplete();
          setHasOnboarded(true);
        }}
      />
    );
  }

  return <NavigationContainer>{user ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
