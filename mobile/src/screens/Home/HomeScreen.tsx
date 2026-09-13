import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import type { AppStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.greeting}>Welcome back{user ? `, ${user.fullName}` : ''}.</Text>
        <Text style={styles.subtitle}>
          Ride search and creation are coming in a future update. Explore the placeholder
          screens below.
        </Text>

        <View style={styles.actions}>
          <Button label="Find a Ride" onPress={() => navigation.navigate('RideSearch')} />
          <View style={styles.spacer} />
          <Button
            label="Offer a Ride"
            variant="secondary"
            onPress={() => navigation.navigate('CreateRide')}
          />
          <View style={styles.spacer} />
          <Button
            label="My Rides"
            variant="secondary"
            onPress={() => navigation.navigate('MyRides')}
          />
          <View style={styles.spacer} />
          <Button
            label="My Profile"
            variant="secondary"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 32,
  },
  actions: {
    marginTop: 8,
  },
  spacer: {
    height: 12,
  },
});
