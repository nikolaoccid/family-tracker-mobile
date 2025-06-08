import React from 'react';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

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
