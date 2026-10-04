import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { PhoneEntryScreen } from '../screens/Auth/PhoneEntryScreen';
import { OtpVerificationScreen } from '../screens/Auth/OtpVerificationScreen';
import { RoleSelectionScreen } from '../screens/Auth/RoleSelectionScreen';
import { DriverIdentityScreen } from '../screens/Auth/DriverIdentityScreen';
import { VerificationHubScreen } from '../screens/Auth/VerificationHubScreen';
import { DriverLicenseScreen } from '../screens/Auth/DriverLicenseScreen';
import { VehicleRegistrationScreen } from '../screens/Auth/VehicleRegistrationScreen';
import { LiveSelfieScreen } from '../screens/Auth/LiveSelfieScreen';
import { AadhaarScreen } from '../screens/Auth/AadhaarScreen';
import { VerificationProcessingScreen } from '../screens/Auth/VerificationProcessingScreen';
import { DriverVerifiedScreen } from '../screens/Auth/DriverVerifiedScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  PhoneEntry: undefined;
  OtpVerification: { countryCode: string; phone: string; deliveryMethod: 'sms' | 'whatsapp' };
  RoleSelection: { countryCode: string; phone: string };
  DriverIdentity: { countryCode: string; phone: string };
  VerificationHub: undefined;
  DriverLicense: undefined;
  VehicleRegistration: undefined;
  LiveSelfie: undefined;
  Aadhaar: undefined;
  VerificationProcessing: undefined;
  DriverVerified: undefined;
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
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="DriverIdentity" component={DriverIdentityScreen} />
      <Stack.Screen name="VerificationHub" component={VerificationHubScreen} />
      <Stack.Screen name="DriverLicense" component={DriverLicenseScreen} />
      <Stack.Screen name="VehicleRegistration" component={VehicleRegistrationScreen} />
      <Stack.Screen name="LiveSelfie" component={LiveSelfieScreen} />
      <Stack.Screen name="Aadhaar" component={AadhaarScreen} />
      <Stack.Screen name="VerificationProcessing" component={VerificationProcessingScreen} />
      <Stack.Screen name="DriverVerified" component={DriverVerifiedScreen} />
    </Stack.Navigator>
  );
}
