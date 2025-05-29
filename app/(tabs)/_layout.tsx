import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Users, Bell, Settings, Crown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import OfflineNotice from '@/components/OfflineNotice';

export default function TabLayout() {
  const router = useRouter();
  const { fetchFamily, fetchSafeZones, fetchAlerts } = useFamilyStore();
  const { user } = useAuthStore();
  const isMountedRef = useRef(true);
  const isLoadingDataRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Use React.useEffect to prevent infinite loops
  useEffect(() => {
    isMountedRef.current = true;

    // Fetch initial data
    const loadData = async () => {
      if (isLoadingDataRef.current) return;

      isLoadingDataRef.current = true;
      try {
        await fetchFamily();
        await fetchSafeZones();
        await fetchAlerts();
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        if (isMountedRef.current) {
          isLoadingDataRef.current = false;
        }
      }
    };

    loadData();

    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        console.log('about to refetch all data')
        loadData();
      }
    }, 5000);



    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  return (
    <>
      <OfflineNotice />
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.light.icon,
          tabBarStyle: {
            backgroundColor: Colors.light.background,
            borderTopColor: Colors.light.border,
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerTintColor: Colors.light.text,
          headerRight: () => {
            // Only show upgrade button for free users
            if (user && !user.isPremium) {
              return (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: Colors.secondary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 16
                  }}
                  onPress={handleUpgrade}
                >
                  <Crown size={16} color={Colors.light.text} />
                  <Text style={{
                    color: Colors.light.text,
                    fontWeight: '600',
                    marginLeft: 4,
                    fontSize: 12
                  }}>
                    Upgrade
                  </Text>
                </TouchableOpacity>
              );
            }
            return null;
          }
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="family"
          options={{
            title: 'Family',
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
