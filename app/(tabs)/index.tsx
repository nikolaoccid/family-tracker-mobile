import React, { useState, useEffect, useRef } from 'react';
import * as Battery from 'expo-battery';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { AlertTriangle, Navigation, Home, BatteryMedium, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import { useLocation } from '@/hooks/useLocation';
import { useLocationStore } from '@/store/locationStore';
import Button from '@/components/Button';
import MockMap from '@/components/MockMap';

export default function MapScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { family, safeZones, createAlert } = useFamilyStore();
  const { myLocation } = useLocationStore();
  const {
    familyLocations,
    isLoadingFamilyLocations,
    permissionsStatus,
    requestPermissions,
    isBackgroundActive,
    getCurrentLocation
  } = useLocation();

  const [batteryLevel, setBatteryLevel] = useState(85);
  const batteryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchBatteryLevel = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        console.log('Battery level:', level);
        if (isMountedRef.current && typeof level === 'number') {
          setBatteryLevel(Math.round(level * 100)); // Convert from 0–1 to 0–100%
        }
      } catch (error) {
        console.error('Error getting battery level:', error);
      }
    };

    // Initial fetch
    fetchBatteryLevel();

    // Optional: refresh every 30 seconds
    batteryIntervalRef.current = setInterval(() => {
      fetchBatteryLevel();
    }, 30000);

    return () => {
      isMountedRef.current = false;
      if (batteryIntervalRef.current) {
        clearInterval(batteryIntervalRef.current);
        batteryIntervalRef.current = null;
      }
    };
  }, []);


  // Request location permissions if not granted
  useEffect(() => {
    if (permissionsStatus !== 'granted') {
      requestPermissions();
    }
  }, [permissionsStatus]);

  // Get current location when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      getCurrentLocation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEmergencyAlert = () => {
    if (user) {
      createAlert({
        type: 'emergency',
        userId: user.id,
        message: `${user.name} triggered an emergency alert`,
        location: myLocation || {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const handleHeadingHome = () => {
    if (user) {
      createAlert({
        type: 'heading_home',
        userId: user.id,
        message: `${user.name} is heading home`,
        location: myLocation || {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
  const handleCreateFamily = () => {
    router.push('/family/create');
  };
  console.log('family', family)
  if (!family) {
    return (
      <View style={styles.noFamilyContainer}>
        <StatusBar style="dark" />
        <Users size={64} color={Colors.light.icon} />
        <Text style={styles.noFamilyTitle}>No Family Group</Text>
        <Text style={styles.noFamilyText}>
          You need to create or join a family group to start tracking your loved ones.
        </Text>
        <Button
          title="Create Family Group"
          onPress={handleCreateFamily}
          style={styles.createButton}
        />
        <TouchableOpacity onPress={() => router.push('/family')}>
          <Text style={styles.joinText}>
            Or join an existing family
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <MockMap familyLocations={familyLocations} />

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.emergencyButton]}
          onPress={handleEmergencyAlert}
        >
          <AlertTriangle size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Emergency</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.headingHomeButton]}
          onPress={handleHeadingHome}
        >
          <Home size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Heading Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.batteryInfo}>
          <BatteryMedium size={16} color={batteryLevel < 20 ? Colors.danger : Colors.light.subtext} />
          <Text style={styles.batteryText}>
            {batteryLevel}%
          </Text>
        </View>

        <View style={styles.locationInfo}>
          <Navigation size={16} color={Colors.primary} />
          <Text style={styles.locationText}>
            {isBackgroundActive
              ? 'Location sharing is active'
              : 'Waiting for location services...'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="View Safe Zones"
          onPress={() => router.push('/zones')}
          variant="outline"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  noFamilyContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  noFamilyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noFamilyText: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  joinText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  actionsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyButton: {
    backgroundColor: Colors.danger,
  },
  headingHomeButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
