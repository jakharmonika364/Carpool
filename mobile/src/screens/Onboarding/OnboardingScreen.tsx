import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { RouteIllustration } from './RouteIllustration';
import { VerifiedIllustration } from './VerifiedIllustration';
import { ScheduleIllustration } from './ScheduleIllustration';

interface OnboardingStep {
  Illustration: React.ComponentType;
  title: string;
  subtitle: string;
  badge?: string;
}

const STEPS: OnboardingStep[] = [
  {
    Illustration: RouteIllustration,
    title: 'Ride together, your way',
    subtitle: 'Match with people already driving your route to work.',
  },
  {
    Illustration: VerifiedIllustration,
    title: 'Every driver, verified',
    subtitle: 'Live photo checks and ID verification, so you always know who’s picking you up.',
    badge: 'Photo verified',
  },
  {
    Illustration: ScheduleIllustration,
    title: 'Drive on your own schedule',
    subtitle: 'Mark the days you’re free. Skip the rest, no obligations.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const { Illustration } = current;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep((value) => value + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.topRow}>
        {!isLast && (
          <Pressable onPress={onComplete} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.illustrationWrap}>
        <Illustration />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>
        {current.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeCheck}>{'✓'}</Text>
            <Text style={styles.badgeText}>{current.badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.dotsRow}>
        {STEPS.map((_, index) => (
          <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleNext}
          style={[styles.button, isLast && styles.buttonFull]}
        >
          <Text style={styles.buttonLabel}>{isLast ? 'Get started' : 'Next'}</Text>
          {!isLast && <Text style={styles.buttonChevron}>{'›'}</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  topRow: {
    height: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  skip: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badge: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.badgeBackground,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeCheck: {
    color: colors.badgeText,
    fontSize: 13,
    fontWeight: '700',
  },
  badgeText: {
    color: colors.badgeText,
    fontSize: 13,
    fontWeight: '600',
  },
  dotsRow: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.chipOff,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.orange,
  },
  buttonRow: {
    marginTop: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonFull: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonChevron: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});
