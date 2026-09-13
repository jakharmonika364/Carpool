import React from 'react';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';

// Placeholder screen. Ride search and matching ship in a later month.
export function RideSearchScreen() {
  return (
    <Screen>
      <EmptyState
        title="Ride search is coming soon"
        description="You'll be able to search for rides near you once ride matching ships."
      />
    </Screen>
  );
}
