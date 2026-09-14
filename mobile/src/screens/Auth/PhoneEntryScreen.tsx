import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandMark } from '../../components/BrandMark';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneEntry'>;

const PHONE_DIGITS_REGEX = /^\d{10}$/;
const COUNTRY_CODE = '+91';

function formatPhoneDigits(digits: string) {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

export function PhoneEntryScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');

  const digits = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const isValid = PHONE_DIGITS_REGEX.test(digits);

  const handleChange = (text: string) => {
    const nextDigits = text.replace(/\D/g, '').slice(0, 10);
    setPhone(formatPhoneDigits(nextDigits));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <BrandMark size={22} />
          <Text style={styles.brandLabel}>Campus Carpool</Text>
        </View>

        <Text style={styles.title}>Enter your mobile number</Text>
        <Text style={styles.subtitle}>We&apos;ll text you a code to verify it&apos;s you.</Text>

        <View style={styles.phoneRow}>
          <Pressable style={styles.countryCode}>
            <Text style={styles.countryCodeLabel}>{COUNTRY_CODE}</Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
          <View style={styles.divider} />
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={handleChange}
            placeholder="98765 43210"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={11}
          />
        </View>

        <Pressable
          style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
          disabled={!isValid}
          onPress={() =>
            navigation.navigate('OtpVerification', { countryCode: COUNTRY_CODE, phone })
          }
        >
          <Text style={styles.continueLabel}>Continue</Text>
        </Pressable>

        <Text style={styles.terms}>
          By continuing, you agree to our <Text style={styles.termsLink}>Terms</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  title: {
    marginTop: 32,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: colors.textSecondary,
  },
  phoneRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipOff,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countryCodeLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  chevron: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.radarLine,
    marginHorizontal: 14,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  continueButton: {
    marginTop: 24,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  terms: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  termsLink: {
    color: colors.orange,
    fontWeight: '600',
  },
});
