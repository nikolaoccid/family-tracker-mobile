import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.subtext,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionCard: {
    width: '100%',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginBottom: 12,
  },
  bulletPoints: {
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  privacyNote: {
    fontSize: 12,
    color: Colors.light.subtext,
    fontStyle: 'italic',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  errorContainer: {
    backgroundColor: `${Colors.danger}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    textAlign: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.light.subtext,
    marginRight: 8,
  },
});
