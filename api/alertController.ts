import { handleApiError } from './utils';
import { useAuthStore } from '@/store/authStore';
import {Alert, BackendAlert, Location} from '@/types';
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
      console.warn('Get alerts error:', error);
      throw error;
    }
  },

  // Create an emergency alert
  createEmergencyAlert: async (alert: Omit<BackendAlert, 'read' | 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/alert/emergency`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(alert),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Create emergency alert error:', error);
      throw error;
    }
  },

  // Create a heading home alert
  createHeadingHomeAlert: async (alert: Omit<BackendAlert, 'read' | 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/alert/heading-home`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(alert),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Create heading home alert error:', error);
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
      console.warn('Mark alert as read error:', error);
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
      console.warn('Delete alert error:', error);
      throw error;
    }
  },
};
