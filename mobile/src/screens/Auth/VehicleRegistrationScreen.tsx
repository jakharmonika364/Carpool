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

type Props = NativeStackScreenProps<AuthStackParamList, 'VehicleRegistration'>;

// Same normalization + pattern the backend re-checks (see
// SubmitRcVerificationDto) — client-side UX only, the server never trusts it.
const RC_PATTERN = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

function normalizeRc(value: string) {
  return value.replace(/[\s-]/g, '').toUpperCase();
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

function HologramGridIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Rect x={2} y={2} width={8} height={8} rx={1.5} fill={colors.chipOffLabel} opacity={0.5} />
      <Rect x={14} y={2} width={8} height={8} rx={1.5} fill={colors.chipOffLabel} opacity={0.3} />
      <Rect x={2} y={14} width={8} height={8} rx={1.5} fill={colors.chipOffLabel} opacity={0.3} />
      <Rect x={14} y={14} width={8} height={8} rx={1.5} fill={colors.chipOffLabel} opacity={0.5} />
    </Svg>
  );
}

export function VehicleRegistrationScreen({ navigation }: Props) {
  const [registrationNumber, setRegistrationNumber] = useState('');
  // Make/model weren't on this screen's original design — added because the
  // onboarding-complete screen shows a vehicle summary card ("Maruti Suzuki
  // Swift") that needs them. They're written to the vehicles table, which
  // otherwise had nothing writing to it yet.
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(
    () => RC_PATTERN.test(normalizeRc(registrationNumber)) && make.trim().length > 0 && model.trim().length > 0,
    [registrationNumber, make, model],
  );

  const handleUploadDocument = () => {
    setError(null);
    // No camera/gallery capture is wired up yet.
    setError('Document upload isn’t built yet — enter the number manually below.');
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await authService.submitRcVerification({
        registrationNumber: normalizeRc(registrationNumber),
        make: make.trim(),
        model: model.trim(),
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

      <View style={styles.stepRow}>
        <View style={styles.stepDot} />
        <Text style={styles.stepLabel}>Step 3 of 5 · Vehicle registration</Text>
      </View>

      <Text style={styles.title}>Let&apos;s find your registration certificate</Text>
      <Text style={styles.subtitle}>
        Enter your vehicle&apos;s registration number and we&apos;ll verify it directly against
        government records.
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

        <View style={styles.rcCard}>
          <View style={styles.regnRow}>
            <View style={styles.fieldTextCol}>
              <Text style={styles.fieldLabel}>REGN NO.</Text>
              <View style={styles.dashedBox}>
                <Text style={styles.regnValue}>GJ 01 AB 1234</Text>
              </View>
            </View>
            <View style={styles.calloutPill}>
              <Text style={styles.calloutText}>Registration number</Text>
            </View>
          </View>

          <View style={styles.twoColRow}>
            <View style={styles.colField}>
              <Text style={styles.fieldLabel}>OWNER NAME</Text>
              <View style={styles.redactedBar} />
            </View>
            <View style={styles.colField}>
              <Text style={styles.fieldLabel}>CLASS / MAKER</Text>
              <View style={styles.redactedBar} />
            </View>
          </View>

          <View style={styles.twoColRow}>
            <View style={styles.colField}>
              <Text style={styles.fieldLabel}>CHASSIS NO.</Text>
              <View style={styles.redactedBar} />
            </View>
            <View style={styles.hologramWrap}>
              <HologramGridIcon />
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <InfoIcon />
          <Text style={styles.infoText}>
            Locate registration number printed on front of smart card or RC booklet
          </Text>
        </View>
      </View>

      <View style={[styles.twoColRow, { marginTop: 18 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldTitle}>Make</Text>
          <View style={styles.input}>
            <TextInput
              style={styles.inputText}
              value={make}
              onChangeText={setMake}
              placeholder="Maruti Suzuki"
              placeholderTextColor={colors.chipOffLabel}
            />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldTitle}>Model</Text>
          <View style={styles.input}>
            <TextInput
              style={styles.inputText}
              value={model}
              onChangeText={setModel}
              placeholder="Swift"
              placeholderTextColor={colors.chipOffLabel}
            />
          </View>
        </View>
      </View>

      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldTitle}>Vehicle registration number</Text>
        <Text style={styles.hint}>e.g. GJ01AB1234</Text>
      </View>
      <View style={styles.input}>
        <TextInput
          style={styles.inputText}
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          placeholder="GJ 01 AB 1234"
          placeholderTextColor={colors.chipOffLabel}
          autoCapitalize="characters"
        />
        <CheckCircleIcon active={isValid} />
      </View>

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
        <Text style={styles.submitLabel}>{isSubmitting ? 'Verifying…' : 'Verify and continue'}</Text>
      </Pressable>
      <Text style={styles.footerCaption}>Verification is checked against official transport records.</Text>

      <View style={styles.homeIndicator} />
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
  title: {
    marginTop: 12,
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
  rcCard: {
    marginTop: 12,
    gap: 10,
    backgroundColor: '#2A1D18',
    borderRadius: 12,
    padding: 12,
  },
  regnRow: {
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
  regnValue: {
    fontSize: 11,
    fontWeight: '700',
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
  twoColRow: {
    flexDirection: 'row',
    gap: 16,
  },
  colField: {
    flex: 1,
    gap: 6,
  },
  redactedBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: '80%',
  },
  hologramWrap: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  fieldLabelRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  fieldTitle: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 11,
    color: colors.chipOffLabel,
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
  footerCaption: {
    marginTop: 10,
    fontSize: 11,
    textAlign: 'center',
    color: colors.chipOffLabel,
  },
  homeIndicator: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12,
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.radarLine,
  },
});
