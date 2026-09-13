import React from 'react';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';

// Placeholder screen. Ride creation ships alongside ride matching.
export function CreateRideScreen() {
  return (
    <Screen>
      <EmptyState
        title="Offering a ride is coming soon"
        description="Drivers will be able to publish a ride here in a future update."
      />
    </Screen>
  );
}
