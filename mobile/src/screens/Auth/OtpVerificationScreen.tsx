import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export function OtpVerificationScreen({ navigation, route }: Props) {
  const { countryCode, phone } = route.params;

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = useMemo(() => digits.join(''), [digits]);
  const isValid = code.length === CODE_LENGTH;

  const handleChangeDigit = (text: string, index: number) => {
    const char = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{' '}
          <Text style={styles.phoneHighlight}>
            {countryCode} {phone}
          </Text>
        </Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>

        <View style={styles.codeRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={[styles.codeBox, focusedIndex === index && styles.codeBoxFocused]}
              value={digit}
              onChangeText={(text) => handleChangeDigit(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        {secondsLeft > 0 ? (
          <Text style={styles.resendText}>
            Resend code in <Text style={styles.resendTimer}>0:{String(secondsLeft).padStart(2, '0')}</Text>
          </Text>
        ) : (
          <Pressable onPress={handleResend}>
            <Text style={styles.resendLink}>Resend code</Text>
          </Pressable>
        )}

        <Pressable style={[styles.verifyButton, !isValid && styles.verifyButtonDisabled]} disabled={!isValid}>
          <Text style={styles.verifyLabel}>Verify</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  title: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: colors.textSecondary,
  },
  phoneHighlight: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  editLink: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: colors.orange,
  },
  codeRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.chipOff,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.chipOff,
  },
  codeBoxFocused: {
    borderColor: colors.orange,
  },
  resendText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  resendTimer: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  resendLink: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.orange,
  },
  verifyButton: {
    marginTop: 24,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
