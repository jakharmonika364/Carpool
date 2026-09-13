import React from 'react';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';

// Placeholder screen. Ride history ships alongside ride creation and matching.
export function MyRidesScreen() {
  return (
    <Screen>
      <EmptyState
        title="Your rides will show up here"
        description="Once ride creation ships, rides you're driving or riding will appear on this screen."
      />
    </Screen>
  );
}
