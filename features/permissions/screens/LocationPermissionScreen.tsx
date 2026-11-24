import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MapPin, ArrowRight } from 'lucide-react-native';
import * as Location from 'expo-location';
import Colors from '@/shared/ui/colors';
import Button from '@/shared/ui/Button';
import { useUpdateProfile } from '@/features/auth';
import { startLocationTracking, useLocationStore } from '@/features/location';
import { logger } from '@/shared/logger';
import { requestLocationGrant } from '../model/locationGrant';
import { styles } from './LocationPermissionScreen.styles';

export function LocationPermissionScreen() {
  const router = useRouter();
  const { mutate: updateUser } = useUpdateProfile();
  const setBackgroundTrackingEnabled = useLocationStore((s) => s.setBackgroundTrackingEnabled);

  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPermission = async () => {
    setIsLoading(true);

    try {
      const grant = await requestLocationGrant(
        { requestForeground: Location.requestForegroundPermissionsAsync, requestBackground: Location.requestBackgroundPermissionsAsync },
        Platform.OS === 'web',
      );
      if (grant === 'denied') {
        setPermissionStatus('denied');
        return;
      }
      setPermissionStatus('granted');
      updateUser({ hasLocationEnabled: true });
      if (grant === 'background') setBackgroundTrackingEnabled(await startLocationTracking());
      setTimeout(() => router.replace('/(tabs)'), 1000);
    } catch (error) {
      logger.warn('location permission request failed', error);
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
    }
  };

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

        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Why we need your location</Text>
          <Text style={styles.permissionDescription}>
            Family Tracker uses your location to:
          </Text>
          <View style={styles.bulletPoints}>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Share your real-time location with family members</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Alert you when family members enter or leave safe zones</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Send emergency alerts with your precise location</Text>
            </View>
          </View>
          <Text style={styles.privacyNote}>
            Your location data is only shared with your family members and is never sold to third parties.
          </Text>
        </View>

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

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Skip for now</Text>
              <ArrowRight size={16} color={Colors.light.subtext} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

