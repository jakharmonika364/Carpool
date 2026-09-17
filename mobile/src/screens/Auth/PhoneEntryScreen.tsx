import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandMark } from '../../components/BrandMark';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneEntry'>;
type DeliveryMethod = 'sms' | 'whatsapp';

const PHONE_DIGITS_REGEX = /^\d{10}$/;
const COUNTRY_CODE = '+91';

function formatPhoneDigits(digits: string) {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

function SmsIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M4,5 L20,5 C21.1,5 22,5.9 22,7 L22,15 C22,16.1 21.1,17 20,17 L9,17 L4,21 L4,17 L4,17 C2.9,17 2,16.1 2,15 L2,7 C2,5.9 2.9,5 4,5 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WhatsAppIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle cx={12} cy={10.5} r={7.5} fill="none" stroke={color} strokeWidth={1.8} />
      <Path d="M9,17 L7.5,21 L11.5,17.3 Z" fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Circle cx={8.5} cy={10.5} r={1.1} fill={color} />
      <Circle cx={12} cy={10.5} r={1.1} fill={color} />
      <Circle cx={15.5} cy={10.5} r={1.1} fill={color} />
    </Svg>
  );
}

export function PhoneEntryScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('sms');

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

        <Text style={styles.methodLabel}>Get your code via</Text>
        <View style={styles.methodRow}>
          <Pressable
            style={[styles.methodChip, deliveryMethod === 'sms' && styles.methodChipSelected]}
            onPress={() => setDeliveryMethod('sms')}
          >
            <SmsIcon color={deliveryMethod === 'sms' ? colors.orange : colors.textPrimary} />
            <Text
              style={[
                styles.methodLabelText,
                deliveryMethod === 'sms' && styles.methodLabelTextSelected,
              ]}
            >
              SMS
            </Text>
          </Pressable>
          <Pressable
            style={[styles.methodChip, deliveryMethod === 'whatsapp' && styles.methodChipSelected]}
            onPress={() => setDeliveryMethod('whatsapp')}
          >
            <WhatsAppIcon color={deliveryMethod === 'whatsapp' ? colors.orange : colors.textPrimary} />
            <Text
              style={[
                styles.methodLabelText,
                deliveryMethod === 'whatsapp' && styles.methodLabelTextSelected,
              ]}
            >
              WhatsApp
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
          disabled={!isValid}
          onPress={() =>
            navigation.navigate('OtpVerification', {
              countryCode: COUNTRY_CODE,
              phone,
              deliveryMethod,
            })
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
  methodLabel: {
    marginTop: 20,
    fontSize: 13,
    color: colors.textSecondary,
  },
  methodRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
  },
  methodChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.chipOff,
    backgroundColor: colors.chipOff,
  },
  methodChipSelected: {
    borderColor: colors.orange,
    backgroundColor: 'rgba(244,105,61,0.08)',
  },
  methodLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  methodLabelTextSelected: {
    color: colors.orange,
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
