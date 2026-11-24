import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Bell, MapPin, Settings, Users } from 'lucide-react-native';
import { UpgradeButton } from '@/features/subscription';
import { OfflineNotice, Colors, RouterErrorBoundary } from '@/shared/ui';

export { RouterErrorBoundary as ErrorBoundary };

const tabBarStyle = {
  backgroundColor: Colors.light.background,
  borderTopColor: Colors.light.border,
  height: Platform.OS === 'ios' ? 88 : 60,
  paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  paddingTop: 8,
};

export default function TabLayout() {
  return (
    <>
      <OfflineNotice />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.light.icon,
          tabBarStyle,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
          headerStyle: { backgroundColor: Colors.light.background },
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
          headerTintColor: Colors.light.text,
          headerRight: () => <UpgradeButton />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Map', tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="family"
          options={{ title: 'Family', tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="alerts"
          options={{ title: 'Alerts', tabBarIcon: ({ color, size }) => <Bell size={size} color={color} /> }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings size={size} color={color} /> }}
        />
      </Tabs>
    </>
  );
}
