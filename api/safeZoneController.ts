import { handleApiError } from './utils';
import { useAuthStore } from '@/store/authStore';
import { SafeZone } from '@/types';
import { getAuthHeaders } from './authUtils';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export const safeZoneController = {
  // Get all safe zones for a family
  getSafeZones: async (familyId: string) => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}/safe-zones`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Get safe zones error:', error);
      throw error;
    }
  },

  // Get a specific safe zone
  getSafeZone: async (safeZoneId: string) => {
    try {
      const response = await fetch(`${API_URL}/safe-zone/${safeZoneId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Get safe zone error:', error);
      throw error;
    }
  },

  // Create a new safe zone
  createSafeZone: async (safeZone: Omit<SafeZone, 'id' | 'createdAt'>, familyId: string) => {
    try {
      const response = await fetch(`${API_URL}/safe-zone`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({...safeZone, familyId: familyId }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Create safe zone error:', error);
      throw error;
    }
  },

  // Update a safe zone
  updateSafeZone: async (safeZoneId: string, safeZone: Partial<SafeZone>, familyId: string) => {
    try {
      const response = await fetch(`${API_URL}/safe-zone/${safeZoneId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({...safeZone, familyId: familyId }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Update safe zone error:', error);
      throw error;
    }
  },

  // Delete a safe zone
  deleteSafeZone: async (safeZoneId: string) => {
    try {
      const response = await fetch(`${API_URL}/safe-zone/${safeZoneId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete safe zone error:', error);
      throw error;
    }
  },

  // Toggle safe zone active status
  toggleSafeZoneStatus: async (safeZoneId: string, isActive: boolean) => {
    try {
      const response = await fetch(`${API_URL}/safe-zone/${safeZoneId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Toggle safe zone status error:', error);
      throw error;
    }
  },
};
