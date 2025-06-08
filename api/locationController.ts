import {Location, LocationHistory} from '@/types';
import { handleApiError, retryWithBackoff } from './utils';
import { useAuthStore } from '@/store/authStore';
import { getAuthHeaders } from './authUtils';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

let lastLocation: Location | null = null
function getDateDifferenceInSeconds(date1: Date, date2: Date): number {
  return Math.abs(date1.getTime() - date2.getTime()) / 1000;
}
function checkRepeatingLocation(location: Location): boolean {
  if (!lastLocation) {
    return false;
  }

  if (lastLocation?.latitude === location.latitude &&
      lastLocation.longitude === location.longitude) {
    console.log('Location is repeating, not sending:', location);
    return true;
  }

  return false;
}

export const locationController = {
  // Send user location
  sendLocation: async (location: Location) => {
    try {
      if (checkRepeatingLocation(location)){
        return
      }
      lastLocation = location;
      console.log('Sending location:', location);
      return await retryWithBackoff(async () => {
        const response = await fetch(`${API_URL}/location`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(location),
        });

        if (!response.ok) {
          throw await handleApiError(response);
        }

        return await response.json();
      }, 0);
    } catch (error) {
      console.warn('Send location error:', error);
      throw error;
    }
  },

  // Get family member locations
  getFamilyLocations: async (familyId: string) => {
    try {
      return await retryWithBackoff(async () => {
        const response = await fetch(`${API_URL}/family/${familyId}/locations`, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw await handleApiError(response);
        }

        return await response.json();
      }, 2); // Retry up to 2 times
    } catch (error) {
      console.warn('Get family locations error:', error);
      throw error;
    }
  },

  // Get location history for a user
  getUserLocationHistory: async (userId: string, params: {
    startDate?: string,
    endDate?: string,
    limit?: number
  } = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const url = `${API_URL}/user/${userId}/location-history?${queryParams.toString()}`;

      return await retryWithBackoff(async () => {
        const response = await fetch(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw await handleApiError(response);
        }

        return await response.json();
      }, 2); // Retry up to 2 times
    } catch (error) {
      console.warn('Get location history error:', error);
      throw error;
    }
  },

  // Update battery level
  updateBatteryLevel: async (level: number) => {
    try {
      return await retryWithBackoff(async () => {
        const response = await fetch(`${API_URL}/user/battery`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ level }),
        });

        if (!response.ok) {
          throw await handleApiError(response);
        }

        return await response.json();
      }, 2); // Retry up to 2 times
    } catch (error) {
      console.warn('Update battery level error:', error);
      throw error;
    }
  },
 async getDetailedLocationHistory(
    userId: string,
    param2: { includePrivacyInfo: boolean; endDate: any; startDate: any }
  ): Promise<LocationHistory[]> {
    // Mock data
    return Promise.resolve([
      {
        id: '1',
        userId,
        latitude: 40.7128,
        longitude: -74.0060,
        speed: 10,
        accuracy: 5,
        heading: 90,
        timestamp: new Date().toISOString(),
        whoCanSeeLocation: param2.includePrivacyInfo ? ['userA', 'userB'] : [],
      },
      {
        id: '2',
        userId,
        latitude: 40.7138,
        longitude: -74.0050,
        speed: 12,
        accuracy: 4,
        heading: 100,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        whoCanSeeLocation: param2.includePrivacyInfo ? ['userA'] : [],
      },
    ]);
  }
};
