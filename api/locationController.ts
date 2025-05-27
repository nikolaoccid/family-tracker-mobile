import { Location } from '@/types';
import { handleApiError, retryWithBackoff } from './utils';
import { useAuthStore } from '@/store/authStore';
import { getAuthHeaders } from './authUtils';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export const locationController = {
  // Send user location
  sendLocation: async (location: Location) => {
    console.log('Sending location:', location);
    try {
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
      }, 2); // Retry up to 2 times
    } catch (error) {
      console.error('Send location error:', error);
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
      console.error('Get family locations error:', error);
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
      console.error('Get location history error:', error);
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
      console.error('Update battery level error:', error);
      throw error;
    }
  },
};
