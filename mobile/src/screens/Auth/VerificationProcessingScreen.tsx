import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiClient';
import type { DriverVerificationStatus, VerificationTaskStatus } from '../../types/user';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerificationProcessing'>;

type RowKey = 'liveness' | 'dl' | 'rc' | 'aadhaar';

const ROWS: { key: RowKey; label: string }[] = [
  { key: 'liveness', label: 'Matching selfie with license photo' },
  { key: 'dl', label: 'Verifying driving license' },
  { key: 'rc', label: 'Verifying vehicle registration' },
  { key: 'aadhaar', label: 'Confirming Aadhaar (optional)' },
];

// Every task here was already checked on its own screen (dev-mode stub,
// resolved synchronously) — this screen fetches the real, already-final
// result once, then reveals each row on a short stagger purely for pacing.
// It never shows a row as "checking" for a result it doesn't already have.
function SpinnerArc({ size }: { size: number }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle
          cx={12}
          cy={12}
          r={10}
          fill="none"
          stroke={colors.orange}
          strokeWidth={2.2}
          strokeDasharray="16 47"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

function CheckCircleIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill={colors.successBackground} />
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

function EmptyCircleIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="none" stroke={colors.chipOff} strokeWidth={2} />
    </Svg>
  );
}

function isRowDone(status: VerificationTaskStatus) {
  return status === 'verified';
}

export function VerificationProcessingScreen({ navigation }: Props) {
  const [status, setStatus] = useState<DriverVerificationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    authService
      .getVerificationStatus()
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!status || revealedCount >= ROWS.length) return;
    const timer = setTimeout(() => setRevealedCount((n) => n + 1), 650);
    return () => clearTimeout(timer);
  }, [status, revealedCount]);

  const allRevealed = revealedCount >= ROWS.length;
  const requiredDone =
    status?.dl.status === 'verified' &&
    status?.rc.status === 'verified' &&
    status?.liveness.status === 'verified';

  const handleFinish = () => {
    navigation.navigate('DriverVerified');
  };

  const handleBackToHub = () => {
    navigation.navigate('VerificationHub');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.iconWrap}>
        <Svg width={110} height={110} viewBox="0 0 110 110" style={StyleSheet.absoluteFill}>
          <Circle cx={55} cy={55} r={52} fill="none" stroke={colors.radarLine} strokeWidth={1.5} strokeDasharray="3 5" />
        </Svg>
        <View style={styles.badge}>
          <Text style={styles.badgeGlyph}>A</Text>
        </View>
        {!allRevealed || !requiredDone ? (
          <View style={styles.arcWrap}>
            <SpinnerArc size={110} />
          </View>
        ) : null}
      </View>

      <Text style={styles.title}>Verifying your details</Text>
      <Text style={styles.subtitle}>This usually takes under a minute.</Text>

      <View style={styles.list}>
        {ROWS.map((row, index) => {
          const revealed = index < revealedCount;
          const rowStatus = status?.[row.key].status ?? 'not_started';
          const done = revealed && isRowDone(rowStatus);
          const pending = !revealed;
          const skipped = revealed && row.key === 'aadhaar' && !done;

          return (
            <View key={row.key} style={styles.row}>
              {done ? (
                <CheckCircleIcon size={22} />
              ) : pending ? (
                <EmptyCircleIcon size={22} />
              ) : skipped ? (
                <EmptyCircleIcon size={22} />
              ) : (
                <SpinnerArc size={22} />
              )}
              <Text style={[styles.rowLabel, (done || (!pending && !skipped)) && styles.rowLabelActive, skipped && styles.rowLabelSkipped]}>
                {row.label}
              </Text>
            </View>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {allRevealed ? (
        requiredDone ? (
          <Pressable style={styles.continueButton} onPress={handleFinish}>
            <Text style={styles.continueLabel}>You&apos;re all set — Continue</Text>
          </Pressable>
        ) : (
          <View style={styles.incompleteWrap}>
            <Text style={styles.incompleteText}>
              A required step isn&apos;t verified yet. Go back and finish it to continue.
            </Text>
            <Pressable style={styles.continueButton} onPress={handleBackToHub}>
              <Text style={styles.continueLabel}>Back to verification hub</Text>
            </Pressable>
          </View>
        )
      ) : (
        <Text style={styles.footerText}>Feel free to close the app, we&apos;ll notify you once it&apos;s done.</Text>
      )}
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
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.chipOff,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.orange,
  },
  arcWrap: {
    position: 'absolute',
    width: 110,
    height: 110,
  },
  title: {
    marginTop: 32,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  list: {
    marginTop: 32,
    alignSelf: 'stretch',
    gap: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.chipOffLabel,
  },
  rowLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  rowLabelSkipped: {
    color: colors.chipOffLabel,
  },
  errorText: {
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
    color: '#F87171',
  },
  footerText: {
    marginTop: 'auto',
    marginBottom: 32,
    fontSize: 12,
    textAlign: 'center',
    color: colors.chipOffLabel,
  },
  continueButton: {
    marginTop: 'auto',
    marginBottom: 32,
    alignSelf: 'stretch',
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  incompleteWrap: {
    marginTop: 'auto',
    marginBottom: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  incompleteText: {
    fontSize: 13,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
