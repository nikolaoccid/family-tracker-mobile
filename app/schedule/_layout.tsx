import React from 'react';
export { RouterErrorBoundary as ErrorBoundary } from '@/shared/ui';
import { Stack } from 'expo-router';
import { Colors } from '@/shared/ui/theme';

export default function ScheduleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.light.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
