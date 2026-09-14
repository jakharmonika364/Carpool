import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { Loading } from '../components/Loading';
import { useAuthStore } from '../store/authStore';

const MIN_SPLASH_DURATION_MS = 1200;

export function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hydrate = useAuthStore((state) => state.hydrate);
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);

  useEffect(() => {
    hydrate();
    const timer = setTimeout(() => setMinDurationElapsed(true), MIN_SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [hydrate]);

  if (isHydrating || !minDurationElapsed) {
    return <Loading />;
  }

  return <NavigationContainer>{user ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
