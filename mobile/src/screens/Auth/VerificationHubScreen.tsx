import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useDriverOnboardingStore } from '../../store/driverOnboardingStore';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiClient';
import type { DriverVerificationStatus, VerificationTaskType } from '../../types/user';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerificationHub'>;

// Static copy for each backend task type. dl/liveness/aadhaar are verbatim
// strings from the design; rc's row wasn't shown in the Hub mock (only the
// dedicated RC screen was), so its copy here is mine, written to match the
// others' tone. What changes at runtime is which row is bold/checked/tappable.
const TASK_COPY: Record<VerificationTaskType, string> = {
  dl: 'Required to start driving',
  rc: 'Required before your first ride',
  liveness: 'Matched against your license photo',
  aadhaar: 'Adds a verified badge to your profile',
};

function CheckCircleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill={colors.successBackground} />
      <Path
        d="M7.5,12.5 L10.5,15.5 L16.5,9"
        fill="none"
        stroke={colors.success}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={10} height={16} viewBox="0 0 10 16">
      <Path
        d="M1.5,1.5 L8,8 L1.5,14.5"
        fill="none"
        stroke={colors.chipOffLabel}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Rect x={5} y={11} width={14} height={9} rx={2} fill="none" stroke={colors.textSecondary} strokeWidth={1.8} />
      <Path
        d="M8,11 L8,7.5 C8,4.5 10,3 12,3 C14,3 16,4.5 16,7.5 L16,11"
        fill="none"
        stroke={colors.textSecondary}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function VerificationHubScreen({ navigation }: Props) {
  const firstName = useDriverOnboardingStore((state) => state.firstName);
  const [status, setStatus] = useState<DriverVerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // useFocusEffect (not useEffect) so returning from the DL/liveness/RC
  // screens re-fetches status — those screens are pushed on top of this one
  // and popped back to, which doesn't remount it.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setIsLoading(true);
      authService
        .getVerificationStatus()
        .then((data) => {
          if (!cancelled) setStatus(data);
        })
        .catch((err) => {
          if (!cancelled) setError(getApiErrorMessage(err));
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleTaskPress = (type: VerificationTaskType) => {
    if (type === 'dl') {
      navigation.navigate('DriverLicense');
      return;
    }
    if (type === 'rc') {
      navigation.navigate('VehicleRegistration');
      return;
    }
    if (type === 'aadhaar') {
      navigation.navigate('Aadhaar');
      return;
    }
    navigation.navigate('LiveSelfie');
  };

  const handleRecommendedPress = () => {
    if (status?.nextStep) {
      handleTaskPress(status.nextStep);
      return;
    }
    setNotice('All verification tasks are complete.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Verification hub</Text>
        <View style={styles.headerButton} />
      </View>

      <Text style={styles.welcome}>Welcome, {firstName || 'there'}</Text>

      <View style={styles.progressRow}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={index}
            style={[styles.progressSegment, index === 0 && styles.progressSegmentActive]}
          />
        ))}
      </View>

      <View style={styles.list}>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.verifiedLabel}>
            {status?.identityComplete === false ? 'Not verified' : 'Verified'}
          </Text>
          <CheckCircleIcon />
        </View>

        <View style={styles.divider} />
        <Pressable style={styles.row} onPress={handleRecommendedPress} disabled={isLoading}>
          <Text style={styles.recommendedLabel}>Recommended next step</Text>
          <ChevronIcon />
        </Pressable>

        <View style={styles.divider} />
        <Pressable style={styles.row} onPress={() => handleTaskPress('dl')} disabled={isLoading}>
          <Text style={styles.rowLabel}>{TASK_COPY.dl}</Text>
          {status?.dl.status === 'verified' ? <CheckCircleIcon /> : <ChevronIcon />}
        </Pressable>

        <View style={styles.divider} />
        <Pressable style={styles.row} onPress={() => handleTaskPress('liveness')} disabled={isLoading}>
          <Text style={styles.rowLabel}>{TASK_COPY.liveness}</Text>
          {status?.liveness.status === 'verified' ? <CheckCircleIcon /> : <ChevronIcon />}
        </Pressable>

        <View style={styles.divider} />
        <Pressable style={styles.row} onPress={() => handleTaskPress('rc')} disabled={isLoading}>
          <Text style={styles.rowLabel}>{TASK_COPY.rc}</Text>
          {status?.rc.status === 'verified' ? <CheckCircleIcon /> : <ChevronIcon />}
        </Pressable>

        <View style={styles.divider} />
        <Pressable style={styles.row} onPress={() => handleTaskPress('aadhaar')} disabled={isLoading}>
          <View style={styles.rowLabelColumn}>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>Optional</Text>
            </View>
            <Text style={styles.rowLabel}>{TASK_COPY.aadhaar}</Text>
          </View>
          {status?.aadhaar.status === 'verified' ? <CheckCircleIcon /> : <ChevronIcon />}
        </Pressable>
        <View style={styles.divider} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <View style={styles.footer}>
        <LockIcon />
        <Text style={styles.footerText}>Your verification documents are encrypted &amp; private.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  welcome: {
    marginTop: 24,
    paddingHorizontal: 20,
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.chipOff,
  },
  progressSegmentActive: {
    backgroundColor: colors.orange,
  },
  list: {
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.radarLine,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  verifiedLabel: {
    fontSize: 16,
    color: colors.success,
  },
  recommendedLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.orange,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  rowLabelColumn: {
    gap: 8,
  },
  optionalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.badgeBackground,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  optionalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.badgeText,
  },
  errorText: {
    marginTop: 12,
    paddingHorizontal: 20,
    fontSize: 12,
    color: '#F87171',
  },
  notice: {
    marginTop: 12,
    paddingHorizontal: 20,
    fontSize: 12,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
