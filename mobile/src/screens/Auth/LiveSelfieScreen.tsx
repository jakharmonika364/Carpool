import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../services/apiClient';

type Props = NativeStackScreenProps<AuthStackParamList, 'LiveSelfie'>;

const FRAME_SIZE = 280;
const GUIDE_COLOR = 'rgba(255,255,255,0.18)';
const DIM_GUIDE_COLOR = 'rgba(255,255,255,0.08)';

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

function LockIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24">
      <Rect x={5} y={11} width={14} height={9} rx={2} fill="none" stroke={colors.chipOffLabel} strokeWidth={1.8} />
      <Path
        d="M8,11 L8,7.5 C8,4.5 10,3 12,3 C14,3 16,4.5 16,7.5 L16,11"
        fill="none"
        stroke={colors.chipOffLabel}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function WarningIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="none" stroke="#F87171" strokeWidth={1.8} />
      <Line x1={12} y1={7} x2={12} y2={13} stroke="#F87171" strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={16.5} r={1} fill="#F87171" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Line x1={6} y1={6} x2={18} y2={18} stroke={colors.textPrimary} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={18} y1={6} x2={6} y2={18} stroke={colors.textPrimary} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

function RefreshIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M4,12 a8,8 0 1 1 2.5,5.8 M4,12 L4,18 M4,12 L10,12"
        fill="none"
        stroke={colors.background}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckBadgeIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill={colors.success} />
      <Path
        d="M7.5,12.5 L10.5,15.5 L16.5,9"
        fill="none"
        stroke={colors.background}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Reused for both the live viewfinder and the two "captured photo" /
// "reference" thumbnails — `dim` renders the muted variant used once a
// photo exists, `showRing` toggles the orange dashed viewfinder ring.
function FaceGuide({ size, dim = false, showRing = true }: { size: number; dim?: boolean; showRing?: boolean }) {
  const r = size / 2;
  const tick = size * 0.035;
  const guideColor = dim ? DIM_GUIDE_COLOR : GUIDE_COLOR;
  const headR = size * 0.2;
  const headCy = r - size * 0.11;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {showRing && (
        <>
          <Circle cx={r} cy={r} r={r - 4} fill="none" stroke={colors.orange} strokeWidth={2.5} strokeDasharray="10 8" />
          <Line x1={r} y1={0} x2={r} y2={tick} stroke={colors.orange} strokeWidth={2.5} />
          <Line x1={r} y1={size - tick} x2={r} y2={size} stroke={colors.orange} strokeWidth={2.5} />
          <Line x1={0} y1={r} x2={tick} y2={r} stroke={colors.orange} strokeWidth={2.5} />
          <Line x1={size - tick} y1={r} x2={size} y2={r} stroke={colors.orange} strokeWidth={2.5} />
        </>
      )}
      <Ellipse cx={r} cy={headCy} rx={headR} ry={headR * 1.25} fill="none" stroke={guideColor} strokeWidth={1.5} strokeDasharray="4 5" />
      {!dim && (
        <>
          <Circle cx={r - headR * 0.4} cy={headCy - headR * 0.05} r={2.5} fill={guideColor} />
          <Circle cx={r + headR * 0.4} cy={headCy - headR * 0.05} r={2.5} fill={guideColor} />
          <Line x1={r} y1={headCy - headR * 0.05} x2={r} y2={headCy + headR * 0.4} stroke={guideColor} strokeWidth={1.5} />
          <Line x1={r - headR * 0.3} y1={headCy + headR * 0.4} x2={r + headR * 0.3} y2={headCy + headR * 0.4} stroke={guideColor} strokeWidth={1.5} />
        </>
      )}
      <Path
        d={`M${r - headR * 1.35},${headCy + headR * 3.15} C${r - headR * 1.35},${headCy + headR * 1.55} ${r - headR * 0.75},${headCy + headR * 1.15} ${r},${headCy + headR * 1.15} C${r + headR * 0.75},${headCy + headR * 1.15} ${r + headR * 1.35},${headCy + headR * 1.55} ${r + headR * 1.35},${headCy + headR * 3.15}`}
        fill="none"
        stroke={guideColor}
        strokeWidth={1.5}
        strokeDasharray="4 5"
      />
    </Svg>
  );
}

function ShutterButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.shutterOuter, disabled && styles.shutterDisabled]}>
      <View style={styles.shutterGap}>
        <View style={styles.shutterInner} />
      </View>
    </Pressable>
  );
}

export function LiveSelfieScreen({ navigation }: Props) {
  const [failed, setFailed] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const handleCapture = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Dev-mode simulation: there's no real camera or image-quality check,
      // so the first attempt is deliberately simulated to fail — this is
      // what actually demonstrates the retry screen below. Every attempt
      // after that succeeds. A real provider integration replaces this
      // entirely with its own pass/fail verdict.
      const outcome = hasAttempted ? 'pass' : 'fail';
      setHasAttempted(true);
      const status = await authService.submitLivenessVerification(outcome);
      if (status.liveness.status === 'verified') {
        navigation.navigate('VerificationHub');
      } else {
        setFailed(true);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (failed) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.failedHeaderTitle}>Identity Verification</Text>
          <View style={styles.avatarCircle}>
            <ProfileAvatarIcon />
          </View>
        </View>

        <Text style={styles.failedTitle}>Your face isn&apos;t clearly visible</Text>
        <Text style={styles.subtitle}>Biometric identity match requires even ambient lighting</Text>

        <View style={styles.warningBanner}>
          <WarningIcon />
          <Text style={styles.warningText}>
            Please make sure you&apos;re visible and well-lit, then try again.
          </Text>
        </View>

        <View style={styles.capturedBox}>
          <FaceGuide size={FRAME_SIZE} dim showRing={false} />
          <Pressable
            style={styles.capturedCloseButton}
            onPress={() => {
              setFailed(false);
              setHasAttempted(false);
            }}
          >
            <CloseIcon />
          </Pressable>
        </View>
        <Text style={styles.capturedCaption}>Captured photo</Text>

        <View style={styles.referenceRow}>
          <View style={styles.referenceThumb}>
            <FaceGuide size={64} showRing={false} />
            <View style={styles.referenceBadge}>
              <CheckBadgeIcon />
            </View>
          </View>
          <View style={styles.referenceTextCol}>
            <View style={styles.referenceLabelRow}>
              <View style={styles.referenceDot} />
              <Text style={styles.referenceLabel}>REFERENCE</Text>
            </View>
            <Text style={styles.referenceTitle}>Centered and front-lit</Text>
            <Text style={styles.referenceSubtitle}>Like this</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.tryAgainButton, isSubmitting && styles.shutterDisabled]}
          disabled={isSubmitting}
          onPress={handleCapture}
        >
          <RefreshIcon />
          <Text style={styles.tryAgainLabel}>{isSubmitting ? 'Verifying…' : 'Try again'}</Text>
        </Pressable>

        <Pressable onPress={() => setShowTips((v) => !v)}>
          <Text style={styles.tipsLink}>Need lighting tips?</Text>
        </Pressable>
        {showTips ? (
          <Text style={styles.tipsText}>
            Face a window or lamp, avoid strong light behind you, and hold the phone at eye level.
          </Text>
        ) : null}
      </SafeAreaView>
    );
  }

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

      <View style={styles.stepRow}>
        <View style={styles.stepDot} />
        <Text style={styles.stepLabel}>Step 4 of 5 · Live selfie</Text>
      </View>

      <Text style={styles.title}>Let&apos;s confirm it&apos;s you</Text>
      <Text style={styles.subtitle}>We&apos;ll compare this with your license photo.</Text>

      <View style={styles.frameWrap}>
        <FaceGuide size={FRAME_SIZE} />
      </View>

      <Text style={styles.instruction}>Center your face in the frame, in a well-lit area.</Text>

      <View style={styles.lockRow}>
        <LockIcon />
        <Text style={styles.lockText}>Used only to verify your identity.</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.shutterWrap}>
        <ShutterButton onPress={handleCapture} disabled={isSubmitting} />
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
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  failedHeaderTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244,105,61,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
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
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  failedTitle: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: colors.textSecondary,
  },
  frameWrap: {
    alignSelf: 'center',
    marginTop: 24,
  },
  instruction: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  lockRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockText: {
    fontSize: 12,
    color: colors.chipOffLabel,
  },
  errorText: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    color: '#F87171',
  },
  shutterWrap: {
    alignItems: 'center',
    marginTop: 32,
  },
  shutterOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterGap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E5E5E5',
  },
  warningBanner: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    borderRadius: 14,
    padding: 14,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#F87171',
  },
  capturedBox: {
    marginTop: 20,
    alignSelf: 'center',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F87171',
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  capturedCloseButton: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F87171',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedCaption: {
    marginTop: 10,
    fontSize: 13,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  referenceRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.chipOff,
    borderRadius: 16,
    padding: 14,
  },
  referenceThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  referenceBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
  },
  referenceTextCol: {
    flex: 1,
  },
  referenceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  referenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  referenceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.success,
  },
  referenceTitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  referenceSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tryAgainButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingVertical: 16,
  },
  tryAgainLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  tipsLink: {
    marginTop: 16,
    fontSize: 13,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  tipsText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    color: colors.chipOffLabel,
    paddingHorizontal: 12,
  },
});
