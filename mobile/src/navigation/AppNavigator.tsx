import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { EditProfileScreen } from '../screens/Profile/EditProfileScreen';
import { RideSearchScreen } from '../screens/Rides/RideSearchScreen';
import { RideDetailsScreen } from '../screens/Rides/RideDetailsScreen';
import { CreateRideScreen } from '../screens/Rides/CreateRideScreen';
import { MyRidesScreen } from '../screens/Rides/MyRidesScreen';

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  RideSearch: undefined;
  RideDetails: { rideId: string };
  CreateRide: undefined;
  MyRides: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Campus Carpool' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="RideSearch"
        component={RideSearchScreen}
        options={{ title: 'Find a Ride' }}
      />
      <Stack.Screen
        name="RideDetails"
        component={RideDetailsScreen}
        options={{ title: 'Ride Details' }}
      />
      <Stack.Screen
        name="CreateRide"
        component={CreateRideScreen}
        options={{ title: 'Offer a Ride' }}
      />
      <Stack.Screen name="MyRides" component={MyRidesScreen} options={{ title: 'My Rides' }} />
    </Stack.Navigator>
  );
}
