import { getAuthHeaders } from './authUtils';
import { handleApiError } from './utils';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const subscriptionController = {
  getSubscriptionPlans: async () => {
    try {
      const response = await fetch(`${API_URL}/subscription/plans`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Get subscription plans error:', error);
      throw error;
    }
  },

  getCurrentSubscription: async () => {
    try {
      const response = await fetch(`${API_URL}/subscription`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Get current subscription error:', error);
      throw error;
    }
  },

  subscribeToPlan: async (planId: string) => {
    try {
      const response = await fetch(`${API_URL}/subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Subscribe to plan error:', error);
      throw error;
    }
  },

  cancelSubscription: async () => {
    try {
      const response = await fetch(`${API_URL}/subscription`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Cancel subscription error:', error);
      throw error;
    }
  },
};
