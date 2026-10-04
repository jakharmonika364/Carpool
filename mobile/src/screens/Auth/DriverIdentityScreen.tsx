import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useDriverOnboardingStore } from '../../store/driverOnboardingStore';
import type { Gender } from '../../types/user';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiClient';

type Props = NativeStackScreenProps<AuthStackParamList, 'DriverIdentity'>;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProfileAvatarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} fill="none" stroke={colors.orange} strokeWidth={2} />
      <Path
        d="M4,21 C4,16.5 7.5,14 12,14 C16.5,14 20,16.5 20,21"
        fill="none"
        stroke={colors.orange}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CheckBadgeIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="none" stroke={colors.success} strokeWidth={2} />
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

export function DriverIdentityScreen({ navigation, route }: Props) {
  const { countryCode, phone } = route.params;
  const setIdentity = useDriverOnboardingStore((state) => state.setIdentity);
  const storedFirstName = useDriverOnboardingStore((state) => state.firstName);
  const storedLastName = useDriverOnboardingStore((state) => state.lastName);
  const storedEmail = useDriverOnboardingStore((state) => state.email);
  const storedGender = useDriverOnboardingStore((state) => state.gender);
  const setPhone = useDriverOnboardingStore((state) => state.setPhone);

  const [firstName, setFirstName] = useState(storedFirstName);
  const [lastName, setLastName] = useState(storedLastName);
  const [email, setEmail] = useState(storedEmail);
  const [gender, setGender] = useState<Gender | null>(storedGender);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setPhone(countryCode, phone);
  }, [countryCode, phone, setPhone]);

  const isValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    EMAIL_REGEX.test(email.trim()) &&
    gender !== null;

  const handleContinue = async () => {
    if (!isValid || !gender || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      // Persists to the users table right now (PATCH /v1/users/me), using
      // the token stored at OTP-verify time.
      await authService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        gender,
      });
      setIdentity({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        gender,
      });
      navigation.navigate('VerificationHub');
    } catch (err) {
      setSaveError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>PROFILE SETUP</Text>
        <View style={styles.avatarCircle}>
          <ProfileAvatarIcon />
        </View>
      </View>

      <View style={styles.progressRow}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={index}
            style={[styles.progressSegment, index === 0 && styles.progressSegmentActive]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>STEP 1 OF 5 · Identity</Text>

      <View style={styles.content}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>
          This information appears on your driver profile and verified passenger manifests.
        </Text>

        <Text style={styles.fieldLabel}>FIRST NAME</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Alex"
          placeholderTextColor={colors.chipOffLabel}
          autoCapitalize="words"
        />

        <Text style={styles.fieldLabel}>LAST NAME</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Mercer"
          placeholderTextColor={colors.chipOffLabel}
          autoCapitalize="words"
        />

        <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="alex.mercer@executive.io"
          placeholderTextColor={colors.chipOffLabel}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.fieldLabel}>GENDER</Text>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((option) => {
            const selected = gender === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.genderChip, selected && styles.genderChipSelected]}
                onPress={() => setGender(option.value)}
              >
                <Text style={[styles.genderLabel, selected && styles.genderLabelSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.genderNote}>
          ⓘ Used only to enable safety preferences for co-travelers.
        </Text>

        <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.phoneValue}>
            {countryCode} {phone}
          </Text>
          <View style={styles.verifiedBadge}>
            <CheckBadgeIcon />
            <Text style={styles.verifiedLabel}>VERIFIED</Text>
          </View>
        </View>
      </View>

      {saveError ? <Text style={styles.saveErrorText}>{saveError}</Text> : null}
      <Pressable
        style={[styles.continueButton, (!isValid || isSaving) && styles.continueButtonDisabled]}
        disabled={!isValid || isSaving}
        onPress={handleContinue}
      >
        <Text style={styles.continueLabel}>{isSaving ? 'Saving…' : 'CONTINUE →'}</Text>
      </Pressable>
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244,105,61,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    marginTop: 20,
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
  stepLabel: {
    marginTop: 10,
    paddingHorizontal: 20,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  fieldLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.chipOffLabel,
  },
  input: {
    backgroundColor: colors.chipOff,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.chipOff,
    borderWidth: 1.5,
    borderColor: colors.chipOff,
  },
  genderChipSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  genderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  genderLabelSelected: {
    color: colors.textPrimary,
  },
  genderNote: {
    marginTop: 8,
    fontSize: 11,
    color: colors.chipOffLabel,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.chipOff,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  phoneValue: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successBackground,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  verifiedLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.success,
  },
  saveErrorText: {
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 12,
    color: '#F87171',
    textAlign: 'center',
  },
  continueButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
