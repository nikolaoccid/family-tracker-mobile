import { handleApiError } from './utils';
import { useAuthStore } from '@/store/authStore';

const API_URL = 'https://api.familytracker.example.com'; // Replace with your actual API URL

// Helper function to get headers with auth token
const getHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const subscriptionController = {
  // Get available subscription plans
  getSubscriptionPlans: async () => {
    try {
      const response = await fetch(`${API_URL}/subscription/plans`, {
        method: 'GET',
        headers: getHeaders(),
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
        headers: getHeaders(),
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
        headers: getHeaders(),
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
        headers: getHeaders(),
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