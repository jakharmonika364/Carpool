import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen } from '../../components/Screen';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../services/apiClient';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name.'),
  email: z.string().email('Enter a valid email address.'),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number, e.g. +919000000000.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Include an uppercase letter, a lowercase letter, and a number.',
    ),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phoneNumber: '', password: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      await register(values);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Full Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              errorMessage={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              errorMessage={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Phone Number"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
              errorMessage={errors.phoneNumber?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              errorMessage={errors.password?.message}
            />
          )}
        />

        <Button label="Create Account" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 24,
  },
  formError: {
    color: '#dc2626',
    marginBottom: 16,
    fontSize: 14,
  },
});
