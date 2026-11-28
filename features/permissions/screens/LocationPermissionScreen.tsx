import React from 'react';
import { View, Text, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Colors } from '@/shared/ui/theme';
import { Button } from '@/shared/ui/Button';
import { useUpdateProfile } from '@/features/auth';
import { startLocationTracking, useLocationStore } from '@/features/location';
import { logger } from '@/shared/logger';
import { requestLocationGrant } from '../model/locationGrant';
import { usePermissionRequest } from '../hooks/usePermissionRequest';
import { LocationRationale } from '../components/LocationRationale';
import { SkipButton } from '../components/SkipButton';
import { styles } from './LocationPermissionScreen.styles';

const CONTINUE_DELAY_MS = 1000;

export function LocationPermissionScreen() {
  const router = useRouter();
  const { mutate: updateUser } = useUpdateProfile();
  const setBackgroundTrackingEnabled = useLocationStore((s) => s.setBackgroundTrackingEnabled);

  const { status: permissionStatus, isLoading, request: handleRequestPermission } = usePermissionRequest(async () => {
    const grant = await requestLocationGrant(
      { requestForeground: Location.requestForegroundPermissionsAsync, requestBackground: Location.requestBackgroundPermissionsAsync },
      Platform.OS === 'web',
    );
    if (grant === 'denied') return 'denied';
    updateUser({ hasLocationEnabled: true });
    if (grant === 'background') setBackgroundTrackingEnabled(await startLocationTracking());
    setTimeout(() => router.replace('/(tabs)'), CONTINUE_DELAY_MS);
    return 'granted';
  }, (error) => logger.warn('location permission request failed', error));

  const handleSkip = () => {
    updateUser({ hasLocationEnabled: false });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MapPin size={64} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Location Sharing</Text>

        <Text style={styles.description}>
          Enable location services to share your location with family members and
          receive updates about their whereabouts. This is essential for the core
          functionality of Family Tracker.
        </Text>

        <LocationRationale />

        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?q=80&w=1470&auto=format&fit=crop' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.footer}>
        {permissionStatus === 'denied' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Location permission was denied. Many features will be limited without location access.
            </Text>
          </View>
        )}

        {permissionStatus === 'granted' ? (
          <Button
            title="Continue to App"
            onPress={() => router.replace('/(tabs)')}
            fullWidth
          />
        ) : (
          <>
            <Button
              title="Enable Location Services"
              onPress={handleRequestPermission}
              fullWidth
              loading={isLoading}
            />

            <SkipButton onPress={handleSkip} />
          </>
        )}
      </View>
    </View>
  );
}

