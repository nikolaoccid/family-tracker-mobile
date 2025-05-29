import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { locationController } from '@/api/locationController';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { useLocationStore } from '@/store/locationStore';
import { Platform } from 'react-native';
import { isLocationTrackingActive } from '@/background/locationTask';

export const useLocation = () => {
  const { user } = useAuthStore();
  const { family } = useFamilyStore();
  const { updateMyLocation } = useLocationStore();
  const queryClient = useQueryClient();

  // State for location permissions
  const [permissionsStatus, setPermissionsStatus] = useState<Location.PermissionStatus | null>(null);
  const [isBackgroundActive, setIsBackgroundActive] = useState(false);

  // Refs for cleanup
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backgroundCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const isProcessingLocationRef = useRef(false);

  // Check if background tracking is active
  useEffect(() => {
    isMountedRef.current = true;

    const checkBackgroundTracking = async () => {
      if (Platform.OS === 'web') return;

      try {
        const isActive = await isLocationTrackingActive();
        if (isMountedRef.current) {
          setIsBackgroundActive(isActive);
        }
      } catch (error) {
        console.error('Error checking background tracking:', error);
      }
    };

    // Initial check
    checkBackgroundTracking();

    // Set up periodic check
    backgroundCheckIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        checkBackgroundTracking();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      isMountedRef.current = false;
      if (backgroundCheckIntervalRef.current) {
        clearInterval(backgroundCheckIntervalRef.current);
        backgroundCheckIntervalRef.current = null;
      }
    };
  }, []);

  // Request location permissions
  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (isMountedRef.current) {
        setPermissionsStatus(status);
      }
      return status;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return 'error';
    }
  };

  // Mutation for sending location updates
  const locationMutation = useMutation(
    (location: Location.LocationObject) =>
      locationController.sendLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
        accuracy: location.coords.accuracy ?? undefined,
        speed: location.coords.speed ?? undefined,
        heading: location.coords.heading ?? undefined,
      }),
    {
      onSuccess: () => {
        // Invalidate family locations query to get fresh data
        if (family?.id) {
          queryClient.invalidateQueries(['familyLocations', family.id]);
        }
      },
      onError: (error) => {
        console.error('Error sending location:', error);
      }
    }
  );

  // Get current location once
  const getCurrentLocation = async () => {
    // Prevent multiple simultaneous location requests
    if (isProcessingLocationRef.current) return null;
    isProcessingLocationRef.current = true;

    try {
      if (Platform.OS === 'web') {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000
            });
          });

          const location = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            },
            timestamp: position.timestamp
          };

          // Update local state
          if (isMountedRef.current) {
            updateMyLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: location.coords.accuracy,
              speed: location.coords.speed ?? undefined,
              heading: location.coords.heading ?? undefined,
            });
          }

          // Send to server
          locationMutation.mutate(location as any);

          return location;
        } catch (error) {
          console.error('Error getting web location:', error);
          return null;
        }
      } else {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest
          });

          // Update local state
          if (isMountedRef.current) {
            updateMyLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: location.coords.accuracy ?? undefined,
              speed: location.coords.speed ?? undefined,
              heading: location.coords.heading ?? undefined,
            });
          }

          // Send to server
          locationMutation.mutate(location);

          return location;
        } catch (error) {
          console.error('Error getting location:', error);
          return null;
        }
      }
    } finally {
      isProcessingLocationRef.current = false;
    }
  };

  // Query for getting family locations
  const familyLocationsQuery = useQuery(
    ['familyLocations', family?.id],
    () => family?.id ? locationController.getFamilyLocations(family.id) : null,
    {
      enabled: !!family?.id && !!user?.id,
      refetchInterval: 8000, // Refetch every 8 seconds
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Error fetching family locations:', error);
      }
    }
  );

  // Request permissions on mount
  useEffect(() => {
    if (!permissionsStatus) {
      requestPermissions();
    }
  }, [permissionsStatus]);

  // Get current location periodically when in foreground
  useEffect(() => {
    if (permissionsStatus === 'granted' && user?.id) {
      // Get location immediately with a slight delay to prevent render issues
      const initialLocationTimeout = setTimeout(() => {
        getCurrentLocation();
      }, 1000);

      // Then set up interval to get location periodically
      locationIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          getCurrentLocation();
        }
      }, 15000); // Update every 15 seconds when app is in foreground

      return () => {
        clearTimeout(initialLocationTimeout);
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
          locationIntervalRef.current = null;
        }
      };
    }
  }, [permissionsStatus, user?.id]);

  // Clean up all intervals on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      if (backgroundCheckIntervalRef.current) {
        clearInterval(backgroundCheckIntervalRef.current);
        backgroundCheckIntervalRef.current = null;
      }
    };
  }, []);

  return {
    permissionsStatus,
    requestPermissions,
    getCurrentLocation,
    familyLocations: familyLocationsQuery.data || [],
    isLoadingFamilyLocations: familyLocationsQuery.isLoading,
    isErrorFamilyLocations: familyLocationsQuery.isError,
    isSendingLocation: locationMutation.isLoading,
    isBackgroundActive,
  };
};
