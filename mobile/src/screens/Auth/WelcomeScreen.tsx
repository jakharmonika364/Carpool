import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>Campus Carpool</Text>
        <Text style={styles.subtitle}>
          Share rides with verified students on your campus.
        </Text>
        <View style={styles.actions}>
          <Button label="Log In" onPress={() => navigation.navigate('Login')} />
          <View style={styles.spacer} />
          <Button
            label="Create Account"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 48,
  },
  actions: {
    marginTop: 24,
  },
  spacer: {
    height: 12,
  },
});
