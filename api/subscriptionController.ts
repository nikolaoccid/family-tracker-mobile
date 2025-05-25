import { getAuthHeaders } from './authUtils';
import { handleApiError } from './utils';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export const subscriptionController = {
  // Get available subscription plans
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
      console.error('Get subscription plans error:', error);
      throw error;
    }
  },
  
  // Get current subscription
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
      console.error('Get current subscription error:', error);
      throw error;
    }
  },
  
  // Subscribe to a plan
  subscribeToPlan: async (planId: string, paymentDetails: any) => {
    try {
      const response = await fetch(`${API_URL}/subscription`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ planId, paymentDetails }),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Subscribe to plan error:', error);
      throw error;
    }
  },
  
  // Cancel subscription
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
      console.error('Cancel subscription error:', error);
      throw error;
    }
  },
};