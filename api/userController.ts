import { User } from '@/types';
import { handleApiError } from './utils';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

// Helper function to get headers with auth token
const getHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const userController = {
  // User authentication
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  loginWithGoogle: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // User profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateUser: async (userData: Partial<User>) => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Push notifications
  registerPushToken: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/user/push-token`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Register push token error:', error);
      throw error;
    }
  },

  updateNotificationSettings: async (settings: { enabled: boolean }) => {
    try {
      const response = await fetch(`${API_URL}/user/notification-settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  },

  // Subscription
  updateSubscription: async (planId: string) => {
    try {
      const response = await fetch(`${API_URL}/user/subscription`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  },

  cancelSubscription: async () => {
    try {
      const response = await fetch(`${API_URL}/user/subscription`, {
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
