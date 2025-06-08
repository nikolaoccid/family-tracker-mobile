import { handleApiError } from './utils';
import { useAuthStore } from '@/store/authStore';
import {SafeZone, ZoneAnalytics} from '@/types';
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
      console.warn('Get safe zones error:', error);
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
      console.warn('Get safe zone error:', error);
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
      console.warn('Create safe zone error:', error);
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
      console.warn('Update safe zone error:', error);
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
      console.warn('Delete safe zone error:', error);
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
      console.warn('Toggle safe zone status error:', error);
      throw error;
    }
  },
  async getZoneAnalytics(
    zoneId: string,
    param2: { endDate: any; userId: any; startDate: any }
  ): Promise<ZoneAnalytics> {
    console.log('about to call', `${API_URL}/zone-analytics/${zoneId}/${param2.userId}?startDate=${param2.startDate ?? ''}&endDate=${param2.endDate ?? ''}`);
    try {
      const response = await fetch(`${API_URL}/zone-analytics/${zoneId}/${param2.userId}?startDate=${param2.startDate ?? ''}&endDate=${param2.endDate ?? ''}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Toggle safe zone status error:', error);
      throw error;
    }
    // // Mock data
    // return Promise.resolve({
    //   zoneId,
    //   zoneName: "Home",
    //   userId: param2.userId,
    //   userName: "John Doe",
    //   totalTimeSpent: 120, // minutes
    //   visits: [
    //     {
    //       visitId: "v1",
    //       entryTime: new Date(param2.startDate).toISOString(),
    //       exitTime: new Date(param2.endDate).toISOString(),
    //       duration: 60,
    //     },
    //     {
    //       visitId: "v2",
    //       entryTime: new Date(Date.now() - 86400000).toISOString(),
    //       exitTime: new Date(Date.now() - 86340000).toISOString(),
    //       duration: 60,
    //     },
    //   ],
    //   timeByDay: [
    //     { date: new Date(param2.startDate).toISOString().split("T")[0], minutes: 60 },
    //     { date: new Date(param2.endDate).toISOString().split("T")[0], minutes: 60 },
    //   ],
    // });
  },
  async getAllZonesAnalytics(
    familyId: any,
    param2: { endDate: any; userId: any; startDate: any }
  ): Promise<ZoneAnalytics[]> {
    try {
      console.log('about to call', `${API_URL}/zone-analytics/user/${param2.userId}/summary?startDate=${param2.startDate ?? ''}&endDate=${param2.endDate ?? ''}`);
      const response = await fetch(`${API_URL}/zone-analytics/user/${param2.userId}/summary?startDate=${param2.startDate ?? ''}&endDate=${param2.endDate ?? ''}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Toggle safe zone status error:', error);
      throw error;
    }


    // Mock data for two zones
  //   return Promise.resolve([
  //     {
  //       zoneId: "zone1",
  //       zoneName: "Home",
  //       userId: param2.userId,
  //       userName: "John Doe",
  //       totalTimeSpent: 120,
  //       visits: [
  //         {
  //           visitId: "v1",
  //           entryTime: new Date(param2.startDate).toISOString(),
  //           exitTime: new Date(param2.endDate).toISOString(),
  //           duration: 60,
  //         },
  //       ],
  //       timeByDay: [
  //         { date: new Date(param2.startDate).toISOString().split("T")[0], minutes: 60 },
  //         { date: new Date(param2.endDate).toISOString().split("T")[0], minutes: 60 },
  //       ],
  //     },
  //     {
  //       zoneId: "zone2",
  //       zoneName: "School",
  //       userId: param2.userId,
  //       userName: "Jane Smith",
  //       totalTimeSpent: 90,
  //       visits: [
  //         {
  //           visitId: "v2",
  //           entryTime: new Date(Date.now() - 172800000).toISOString(),
  //           exitTime: new Date(Date.now() - 172200000).toISOString(),
  //           duration: 90,
  //         },
  //       ],
  //       timeByDay: [
  //         { date: new Date(param2.startDate).toISOString().split("T")[0], minutes: 45 },
  //         { date: new Date(param2.endDate).toISOString().split("T")[0], minutes: 45 },
  //       ],
  //     },
  //   ]);
  }
};
