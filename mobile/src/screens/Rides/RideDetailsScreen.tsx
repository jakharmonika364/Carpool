import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';
import type { AppStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, 'RideDetails'>;

// Placeholder screen. Ride details ship alongside ride creation and matching.
export function RideDetailsScreen({ route }: Props) {
  return (
    <Screen>
      <EmptyState
        title="Ride details are coming soon"
        description={`Details for ride ${route.params.rideId} will appear here.`}
      />
    </Screen>
  );
}
