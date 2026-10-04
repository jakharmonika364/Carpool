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

type Props = NativeStackScreenProps<AuthStackParamList, 'DriverLicense'>;

// Same normalization + pattern the backend re-checks (see
// SubmitDlVerificationDto) — this is client-side UX only, the server never
// trusts it.
const DL_PATTERN = /^[A-Z]{2}[0-9A-Z]{8,15}$/;
const MINIMUM_DRIVER_AGE = 18;

function normalizeDl(value: string) {
  return value.replace(/[\s-]/g, '').toUpperCase();
}

function formatDobDigits(digits: string) {
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join(' / ');
}

// Returns an ISO yyyy-mm-dd string if `dd / mm / yyyy` is a real calendar
// date, the person is at least MINIMUM_DRIVER_AGE, and the date isn't in
// the future — otherwise null.
function parseDob(formatted: string): string | null {
  const digits = formatted.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  if (!isRealDate || date.getTime() > Date.now()) return null;

  const now = new Date();
  let age = now.getFullYear() - year;
  const monthDiff = now.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < day)) {
    age -= 1;
  }
  if (age < MINIMUM_DRIVER_AGE) return null;

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function PlusIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path d="M12,5 L12,19 M5,12 L19,12" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function CameraIcon({ color = colors.textSecondary }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Rect x={3} y={7} width={18} height={13} rx={2} fill="none" stroke={color} strokeWidth={1.8} />
      <Path d="M8,7 L9.5,4.5 L14.5,4.5 L16,7" fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={12} cy={13.5} r={3.5} fill="none" stroke={color} strokeWidth={1.8} />
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

function CalendarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Rect x={3} y={5} width={18} height={16} rx={2} fill="none" stroke={colors.textSecondary} strokeWidth={1.8} />
      <Path d="M3,10 L21,10 M8,3 L8,7 M16,3 L16,7" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function DriverLicenseScreen({ navigation }: Props) {
  const [dlNumber, setDlNumber] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dlValid = useMemo(() => DL_PATTERN.test(normalizeDl(dlNumber)), [dlNumber]);
  const isoDob = useMemo(() => parseDob(dob), [dob]);
  const isValid = dlValid && isoDob !== null;

  const handleDobChange = (text: string) => {
    setDob(formatDobDigits(text.replace(/\D/g, '').slice(0, 8)));
  };

  const handleUploadPhoto = () => {
    setError(null);
    // No camera/gallery capture is wired up yet.
    setError('Document photo upload isn’t built yet — enter the details manually below.');
  };

  const handleSubmit = async () => {
    if (!isValid || !isoDob || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await authService.submitDlVerification({
        dlNumber: normalizeDl(dlNumber),
        dateOfBirth: isoDob,
      });
      navigation.navigate('VerificationHub');
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
        <View style={styles.avatarCircle}>
          <PersonSilhouetteIcon />
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressDot} />
        <View style={styles.progressBar} />
      </View>

      <Text style={styles.title}>Enter your license details</Text>
      <Text style={styles.subtitle}>
        We&apos;ll verify this directly against government records in seconds.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.plusCircle}>
            <PlusIcon />
          </View>
          <View style={styles.topBar} />
          <View style={styles.cameraBox}>
            <CameraIcon />
          </View>
        </View>

        <View style={styles.idCard}>
          <View style={styles.photoBox}>
            <PersonSilhouetteIcon />
          </View>
          <View style={styles.fieldsCol}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldTextCol}>
                <Text style={styles.fieldLabel}>DL NO.</Text>
                <View style={styles.dashedBox}>
                  <Text style={styles.fieldValue}>D601 20180012345</Text>
                </View>
              </View>
              <View style={styles.calloutPill}>
                <Text style={styles.calloutText}>License number</Text>
              </View>
            </View>
            <View style={styles.fieldRow}>
              <View style={styles.fieldTextCol}>
                <Text style={styles.fieldLabel}>DOB</Text>
                <View style={styles.dashedBox}>
                  <Text style={styles.fieldValue}>14-08-1994</Text>
                </View>
              </View>
              <View style={styles.calloutPill}>
                <Text style={styles.calloutText}>Date of birth</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <InfoIcon />
          <Text style={styles.infoText}>Locate details printed on front of smart card</Text>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.hintRight}>e.g. DL-0420110012345</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={dlNumber}
            onChangeText={setDlNumber}
            placeholder="DL14 20180049281"
            placeholderTextColor={colors.chipOffLabel}
            autoCapitalize="characters"
          />
          <CheckCircleIcon active={dlValid} />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.hintRight}>dd / mm / yyyy</Text>
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={dob}
            onChangeText={handleDobChange}
            placeholder="14 / 08 / 1994"
            placeholderTextColor={colors.chipOffLabel}
            keyboardType="number-pad"
            maxLength={14}
          />
          <CalendarIcon />
        </View>
      </View>

      <Pressable style={styles.uploadLink} onPress={handleUploadPhoto}>
        <CameraIcon color={colors.orange} />
        <Text style={styles.uploadLinkText}>Upload document photo instead</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.submitButton, (!isValid || isSubmitting) && styles.submitButtonDisabled]}
        disabled={!isValid || isSubmitting}
        onPress={handleSubmit}
      >
        <Text style={styles.submitLabel}>{isSubmitting ? 'Verifying…' : 'Verify & continue →'}</Text>
      </Pressable>

      <View style={styles.pageDot} />
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
    fontSize: 22,
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
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
  },
  progressBar: {
    flex: 1,
    maxWidth: 140,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.chipOff,
  },
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  card: {
    marginTop: 20,
    backgroundColor: colors.chipOff,
    borderRadius: 18,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  plusCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.radarLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.radarLine,
  },
  cameraBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.radarLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idCard: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#2A1D18',
    borderRadius: 12,
    padding: 12,
  },
  photoBox: {
    width: 44,
    height: 56,
    borderRadius: 6,
    backgroundColor: '#1C1310',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldsCol: {
    flex: 1,
    gap: 10,
  },
  fieldRow: {
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
  fieldValue: {
    fontSize: 11,
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
  field: {
    marginTop: 18,
  },
  hintRight: {
    textAlign: 'right',
    fontSize: 11,
    color: colors.chipOffLabel,
    marginBottom: 6,
  },
  input: {
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
    color: colors.textPrimary,
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
  pageDot: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.chipOffLabel,
  },
});
