import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { getApiErrorMessage } from '../../services/apiClient';
import type { AppStackParamList } from '../../navigation/AppNavigator';

const editProfileSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name.'),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number, e.g. +919000000000.'),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

type Props = NativeStackScreenProps<AppStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    },
  });

  const onSubmit = async (values: EditProfileFormValues) => {
    setFormError(null);
    try {
      await updateProfile(values);
      navigation.goBack();
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

        <Button label="Save Changes" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
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
