import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import type { AppStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Field label="Full Name" value={user.fullName} />
        <Field label="Email" value={user.email} />
        <Field label="Phone Number" value={user.phoneNumber} />
        <Field label="Role" value={user.role} />
        <Field label="Verification Status" value={user.verificationStatus} />

        <View style={styles.actions}>
          <Button label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <View style={styles.spacer} />
          <Button label="Log Out" variant="secondary" onPress={() => logout()} />
        </View>
      </View>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 24,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
  },
  actions: {
    marginTop: 24,
  },
  spacer: {
    height: 12,
  },
});
