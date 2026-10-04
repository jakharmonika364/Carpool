import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiClient';
import { isValidVerhoeff } from '../../utils/verhoeff';

type Props = NativeStackScreenProps<AuthStackParamList, 'Aadhaar'>;

function normalizeAadhaar(value: string) {
  return value.replace(/\D/g, '').slice(0, 12);
}

function formatAadhaarDigits(digits: string) {
  return [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12)].filter(Boolean).join(' ');
}

function ProfileAvatarIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} fill="none" stroke={colors.textPrimary} strokeWidth={2} />
      <Path
        d="M4,21 C4,16.5 7.5,14 12,14 C16.5,14 20,16.5 20,21"
        fill="none"
        stroke={colors.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="none" stroke={colors.textSecondary} strokeWidth={1.8} />
      <Path d="M12,11 L12,17" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={7.5} r={1} fill={colors.textSecondary} />
    </Svg>
  );
}

function CheckCircleIcon({ active }: { active: boolean }) {
  const color = active ? colors.orange : colors.chipOffLabel;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="none" stroke={color} strokeWidth={1.8} />
      <Path
        d="M7.5,12.5 L10.5,15.5 L16.5,9"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UpArrowIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d="M12,19 L12,6 M6,11 L12,5 L18,11"
        fill="none"
        stroke={colors.orange}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Rect x={2} y={2} width={20} height={20} rx={5} fill={colors.orange} />
        <Path d="M7,12.5 L10.5,16 L17,8.5" fill="none" stroke={colors.background} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Rect x={2} y={2} width={20} height={20} rx={5} fill="none" stroke={colors.chipOffLabel} strokeWidth={1.8} />
    </Svg>
  );
}

function TricolorFlagIcon() {
  return (
    <Svg width={20} height={14} viewBox="0 0 20 14">
      <Rect x={0} y={0} width={20} height={4.6} fill="#FF9933" />
      <Rect x={0} y={4.6} width={20} height={4.6} fill="#F5F5F5" />
      <Rect x={0} y={9.2} width={20} height={4.6} fill="#128807" />
      <Circle cx={10} cy={7} r={1.6} fill="none" stroke="#000080" strokeWidth={0.5} />
    </Svg>
  );
}

function PersonSilhouetteIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} fill={colors.chipOffLabel} />
      <Path d="M4,21 C4,16.5 7.5,14 12,14 C16.5,14 20,16.5 20,21 Z" fill={colors.chipOffLabel} />
    </Svg>
  );
}

function QrGridIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Rect x={2} y={2} width={7} height={7} fill="none" stroke={colors.chipOffLabel} strokeWidth={1.3} />
      <Rect x={15} y={2} width={7} height={7} fill="none" stroke={colors.chipOffLabel} strokeWidth={1.3} />
      <Rect x={2} y={15} width={7} height={7} fill="none" stroke={colors.chipOffLabel} strokeWidth={1.3} />
      <Rect x={13} y={13} width={3} height={3} fill={colors.chipOffLabel} />
      <Rect x={18} y={13} width={3} height={3} fill={colors.chipOffLabel} />
      <Rect x={13} y={18} width={3} height={3} fill={colors.chipOffLabel} />
      <Rect x={18} y={18} width={3} height={3} fill={colors.chipOffLabel} />
    </Svg>
  );
}

export function AadhaarScreen({ navigation }: Props) {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [consent, setConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = useMemo(() => normalizeAadhaar(aadhaarNumber), [aadhaarNumber]);
  const isValid = digits.length === 12 && isValidVerhoeff(digits) && consent;

  const handleChange = (text: string) => {
    setAadhaarNumber(formatAadhaarDigits(normalizeAadhaar(text)));
  };

  const handleUploadDocument = () => {
    setError(null);
    setError('Document upload isn’t built yet — enter the number manually below.');
  };

  const handleSkip = () => {
    navigation.navigate('VerificationProcessing');
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await authService.submitAadhaarVerification({ aadhaarNumber: digits, consent: true });
      navigation.navigate('VerificationProcessing');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile setup</Text>
        <View style={styles.avatarCircle}>
          <ProfileAvatarIcon />
        </View>
      </View>

      <View style={styles.stepRow}>
        <View style={styles.stepDot} />
        <Text style={styles.stepLabel}>Step 5 of 5 · Aadhaar card</Text>
        <View style={styles.optionalBadge}>
          <Text style={styles.optionalBadgeText}>Optional</Text>
        </View>
      </View>

      <Text style={styles.title}>Add your Aadhaar for a verified badge</Text>
      <Text style={styles.subtitle}>
        This adds an extra trust badge to your profile. You can skip this and add it later.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <TricolorFlagIcon />
          <View style={styles.topBar} />
          <View style={styles.dottedCircle} />
        </View>

        <View style={styles.aadhaarBody}>
          <View style={styles.photoBox}>
            <PersonSilhouetteIcon />
          </View>
          <View style={styles.nameLines}>
            <View style={styles.redactedBar} />
            <View style={[styles.redactedBar, { width: '60%' }]} />
            <View style={[styles.redactedBar, { width: '75%' }]} />
          </View>
          <QrGridIcon />
        </View>

        <View style={styles.aadhaarNoRow}>
          <View style={styles.fieldTextCol}>
            <Text style={styles.fieldLabel}>AADHAAR NO.</Text>
            <View style={styles.dashedBox}>
              <Text style={styles.maskedValue}>XXXX XXXX 4829</Text>
            </View>
          </View>
          <View style={styles.calloutPill}>
            <Text style={styles.calloutText}>Aadhaar number</Text>
          </View>
        </View>
        <View style={[styles.redactedBar, { marginTop: 10, width: '55%' }]} />
      </View>

      <View style={styles.infoRow}>
        <InfoIcon />
        <Text style={styles.infoText}>Locate 12-digit number printed on front or back of Aadhaar card</Text>
      </View>

      <Text style={styles.fieldTitle}>Aadhaar number</Text>
      <View style={styles.input}>
        <TextInput
          style={styles.inputText}
          value={aadhaarNumber}
          onChangeText={handleChange}
          placeholder="4829 1048 9201"
          placeholderTextColor={colors.chipOffLabel}
          keyboardType="number-pad"
          maxLength={14}
        />
        <CheckCircleIcon active={digits.length === 12 && isValidVerhoeff(digits)} />
      </View>

      <Pressable style={styles.consentRow} onPress={() => setConsent((v) => !v)}>
        <CheckboxIcon checked={consent} />
        <Text style={styles.consentText}>
          I confirm I&apos;m sharing this voluntarily and consent to it being shared with relevant
          government authorities for verification purposes.
        </Text>
      </Pressable>

      <Pressable style={styles.uploadLink} onPress={handleUploadDocument}>
        <UpArrowIcon />
        <Text style={styles.uploadLinkText}>Upload document instead</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.submitButton, (!isValid || isSubmitting) && styles.submitButtonDisabled]}
        disabled={!isValid || isSubmitting}
        onPress={handleSubmit}
      >
        <Text style={styles.submitLabel}>{isSubmitting ? 'Submitting…' : 'Submit'}</Text>
      </Pressable>

      <Pressable onPress={handleSkip}>
        <Text style={styles.skipLink}>Skip for now</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  headerButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.chipOff,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionalBadge: {
    marginLeft: 'auto',
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
  title: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  card: {
    marginTop: 18,
    backgroundColor: colors.chipOff,
    borderRadius: 18,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.radarLine,
  },
  dottedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.orange,
  },
  aadhaarBody: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoBox: {
    width: 44,
    height: 52,
    borderRadius: 6,
    backgroundColor: '#1C1C22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameLines: {
    flex: 1,
    gap: 7,
  },
  redactedBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    width: '90%',
  },
  aadhaarNoRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  fieldTextCol: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.5)',
  },
  dashedBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.orange,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  maskedValue: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  calloutPill: {
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  calloutText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  infoRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  fieldTitle: {
    marginTop: 16,
    fontSize: 13,
    color: colors.textPrimary,
  },
  input: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.chipOff,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  consentRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  uploadLink: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.orange,
  },
  errorText: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    color: '#F87171',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipLink: {
    marginTop: 14,
    marginBottom: 20,
    fontSize: 13,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
