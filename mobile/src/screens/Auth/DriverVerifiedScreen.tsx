import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import type { DriverVerificationStatus, User } from '../../types/user';

function BigCheckIcon() {
  return (
    <Svg width={100} height={100} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={50} fill="#7ADB94" />
      <Path
        d="M32,52 L44,64 L70,36"
        fill="none"
        stroke={colors.background}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PersonSilhouetteIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Circle cx={12} cy={9} r={4} fill="none" stroke={colors.chipOffLabel} strokeWidth={1.8} />
      <Path d="M5,20 C5,15.5 8,13 12,13 C16,13 19,15.5 19,20" fill="none" stroke={colors.chipOffLabel} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function VerifiedBadgeIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill="#7C5CFF" />
      <Path d="M7.5,12.5 L10.5,15.5 L16.5,9" fill="none" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SmallCheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path d="M4,12.5 L9,17.5 L20,6.5" fill="none" stroke={colors.success} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CarIcon() {
  return (
    <Svg width={24} height={20} viewBox="0 0 26 22">
      <Path
        d="M4,14 L5.5,7.5 C6,5.8 7.5,4.5 9.5,4.5 L16.5,4.5 C18.5,4.5 20,5.8 20.5,7.5 L22,14"
        fill="none"
        stroke={colors.textPrimary}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M2.5,14 L23.5,14 C24,14 24.5,14.5 24.5,15 L24.5,17 C24.5,17.5 24,18 23.5,18 L2.5,18 C2,18 1.5,17.5 1.5,17 L1.5,15 C1.5,14.5 2,14 2.5,14 Z"
        fill="none"
        stroke={colors.textPrimary}
        strokeWidth={1.8}
      />
      <Circle cx={6.5} cy={18} r={2} fill={colors.chipOff} stroke={colors.textPrimary} strokeWidth={1.8} />
      <Circle cx={19.5} cy={18} r={2} fill={colors.chipOff} stroke={colors.textPrimary} strokeWidth={1.8} />
    </Svg>
  );
}

export function DriverVerifiedScreen() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<DriverVerificationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([authService.getCurrentUser(), authService.getVerificationStatus()])
      .then(([userData, statusData]) => {
        if (!cancelled) {
          setUser(userData);
          setStatus(statusData);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGoToDashboard = async () => {
    setIsFinishing(true);
    // First point in the whole onboarding flow where authStore.user gets
    // set — this is what flips RootNavigator from the onboarding stack over
    // to the real app (HomeScreen). Every screen before this deliberately
    // avoided it.
    await hydrate();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.iconWrap}>
        <BigCheckIcon />
      </View>

      <Text style={styles.title}>You&apos;re verified</Text>
      <Text style={styles.subtitle}>You&apos;re all set to start driving.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <PersonSilhouetteIcon />
          </View>
          <View style={styles.avatarBadge}>
            <VerifiedBadgeIcon />
          </View>
        </View>
        <View style={styles.cardTextCol}>
          <Text style={styles.cardTitle}>{user?.fullName || 'Driver'}</Text>
          <View style={styles.checkRow}>
            <SmallCheckIcon />
            <Text style={styles.checkLabel}>
              {status?.dl.status === 'verified' ? 'Driving license verified' : 'Driving license pending'}
            </Text>
          </View>
        </View>
      </View>

      {status?.vehicle ? (
        <View style={styles.card}>
          <View style={styles.carIconBox}>
            <CarIcon />
          </View>
          <View style={styles.cardTextCol}>
            <Text style={styles.cardTitle}>
              {status.vehicle.make} {status.vehicle.model}
            </Text>
            <Text style={styles.plateText}>{status.vehicle.registrationNumber}</Text>
          </View>
          <View style={styles.rcChip}>
            <SmallCheckIcon />
            <Text style={styles.rcChipText}>RC verified</Text>
          </View>
        </View>
      ) : null}

      <Pressable style={styles.dashboardButton} disabled={isFinishing} onPress={handleGoToDashboard}>
        <Text style={styles.dashboardLabel}>{isFinishing ? 'Opening…' : 'Go to dashboard'}</Text>
      </Pressable>

      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconWrap: {
    marginTop: 90,
  },
  title: {
    marginTop: 28,
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    color: '#F87171',
  },
  card: {
    marginTop: 24,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.chipOff,
    borderRadius: 16,
    padding: 16,
  },
  avatarWrap: {
    width: 48,
    height: 48,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
  },
  carIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1C1C22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkLabel: {
    fontSize: 13,
    color: colors.success,
  },
  plateText: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  rcChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rcChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  dashboardButton: {
    marginTop: 'auto',
    marginBottom: 24,
    alignSelf: 'stretch',
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dashboardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  homeIndicator: {
    marginBottom: 12,
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.radarLine,
  },
});
