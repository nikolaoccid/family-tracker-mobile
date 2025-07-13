import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { locationController } from '@/api/locationController';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

export const LOCATION_TRACKING = 'location-tracking';

// Define the background task
TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error('Location tracking task error:', error);
    return;
  }

  if (data) {
    // Extract location data
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      try {
        // Get user ID from auth store
        const userId = useAuthStore.getState().user?.id;

        if (!userId) {
          console.error('User ID not available for location tracking');
          return;
        }

        // Send location to the server
        try {
          await locationController.sendLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: location.coords.accuracy ?? undefined,
            speed: location.coords.speed ?? undefined,
            heading: location.coords.heading ?? undefined,
          });
        } catch (apiError) {
          console.error('API error sending location, falling back to direct fetch:', apiError);

          // Fallback to direct fetch if the API controller fails
          const token = useAuthStore.getState().accessToken;
          if (!token) {
            console.error('No access token available for location tracking');
            return;
          }
          const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';
          const response = await fetch(`${API_URL}/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: location.coords.accuracy,
              speed: location.coords.speed,
              heading: location.coords.heading,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to send location: ${response.status} ${response.statusText}`);
          }
        }

        // Update local store with the latest location
        useLocationStore.getState().updateMyLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString(),
          accuracy: location.coords.accuracy ?? undefined,
          speed: location.coords.speed ?? undefined,
          heading: location.coords.heading ?? undefined,
        });

        // console.log('Location sent in background:', location.coords);
      } catch (error) {
        console.error('Error sending location in background:', error);
      }
    }
  }
});

// Start location tracking
export const startLocationTracking = async () => {
  // Check foreground permission first
  // const foreground = await Location.getForegroundPermissionsAsync();
  //
  // if (foreground.status !== 'granted') {
    const { status: requestedForeground } = await Location.requestForegroundPermissionsAsync();
    if (requestedForeground !== 'granted') {
      console.error('Location permission not granted');
      return false;
    }
  // }

  // Check background permission next
  // const background = await Location.getBackgroundPermissionsAsync();

  // if (background.status !== 'granted') {
    const { status: requestedBackground } = await Location.requestBackgroundPermissionsAsync();
    if (requestedBackground !== 'granted') {
      console.error('Background location permission not granted');
      return false;
    }
  // }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING);
    if (isRegistered) {
      return true;
    }

    // Uncomment when ready to enable background tracking
    // await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
    //   accuracy: Location.Accuracy.Balanced,
    //   timeInterval: 60000,
    //   distanceInterval: 10,
    //   foregroundService: {
    //     notificationTitle: 'Family Tracker',
    //     notificationBody: 'Tracking your location for your family',
    //   },
    //   activityType: Location.ActivityType.Other,
    //   showsBackgroundLocationIndicator: true,
    // });

    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};


// Stop location tracking
export const stopLocationTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING);

    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      console.log('Location tracking stopped');
    }

    return true;
  } catch (error) {
    console.error('Error stopping location tracking:', error);
    return false;
  }
};

// Check if location tracking is active
export const isLocationTrackingActive = async () => {
  try {
    return await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING);
  } catch (error) {
    console.error('Error checking location tracking status:', error);
    return false;
  }
};
