import { handleApiError } from './utils';
import { useAuthStore } from '@/store/authStore';
import { Alert, Location } from '@/types';
import { getAuthHeaders } from './authUtils';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL


export const alertController = {
  // Get all alerts for a family
  getAlerts: async (familyId: string) => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}/alerts`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get alerts error:', error);
      throw error;
    }
  },
  
  // Create an emergency alert
  createEmergencyAlert: async (location: Location) => {
    try {
      const response = await fetch(`${API_URL}/emergency`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ location }),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create emergency alert error:', error);
      throw error;
    }
  },
  
  // Create a heading home alert
  createHeadingHomeAlert: async (location: Location) => {
    try {
      const response = await fetch(`${API_URL}/alert/heading-home`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ location }),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create heading home alert error:', error);
      throw error;
    }
  },
  
  // Mark an alert as read
  markAlertAsRead: async (alertId: string) => {
    try {
      const response = await fetch(`${API_URL}/alert/${alertId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Mark alert as read error:', error);
      throw error;
    }
  },
  
  // Delete an alert
  deleteAlert: async (alertId: string) => {
    try {
      const response = await fetch(`${API_URL}/alert/${alertId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete alert error:', error);
      throw error;
    }
  },
};