import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { PhoneEntryScreen } from '../screens/Auth/PhoneEntryScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  PhoneEntry: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: true, title: 'Log In' }}
      />
      <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
    </Stack.Navigator>
  );
}
