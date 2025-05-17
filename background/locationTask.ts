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
            accuracy: location.coords.accuracy,
            speed: location.coords.speed,
            heading: location.coords.heading,
          });
        } catch (apiError) {
          console.error('API error sending location, falling back to direct fetch:', apiError);
          
          // Fallback to direct fetch if the API controller fails
          const token = useAuthStore.getState().accessToken;
          if (!token) {
            console.error('No access token available for location tracking');
            return;
          }
          
          const response = await fetch('https://api.familytracker.example.com/location', {
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
          accuracy: location.coords.accuracy,
          speed: location.coords.speed,
          heading: location.coords.heading,
        });
        
        console.log('Location sent in background:', location.coords);
      } catch (error) {
        console.error('Error sending location in background:', error);
      }
    }
  }
});

// Start location tracking
export const startLocationTracking = async () => {
  // Check if we already have permissions
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    console.error('Location permission not granted');
    return false;
  }
  
  // Request background permissions
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  
  if (backgroundStatus !== 'granted') {
    console.error('Background location permission not granted');
    return false;
  }
  
  // Start background location tracking
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING);
    
    if (isRegistered) {
      console.log('Background location tracking already active');
      return true;
    }
    
    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000, // Update every 1 minute
      distanceInterval: 10, // Update every 10 meters
      foregroundService: {
        notificationTitle: 'Family Tracker',
        notificationBody: 'Tracking your location for your family',
      },
      activityType: Location.ActivityType.Other,
      showsBackgroundLocationIndicator: true,
    });
    
    console.log('Background location tracking started');
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