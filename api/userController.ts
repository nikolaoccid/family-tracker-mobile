import {PrivacySettings, User} from '@/types';
import { handleApiError } from './utils';
import { getAuthHeaders } from './authUtils';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export const userController = {
  // User authentication
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login/jwt`, {
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
      console.warn('Login error:', error);
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
      console.warn('Registration error:', error);
      throw error;
    }
  },

  loginWithGoogle: async (name: string, email: string, password: string) => {
    return await userController.register(name, email, password)
  },

  resetPassword: async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
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
      console.warn('Reset password error:', error);
      throw error;
    }
  },

  completePasswordReset: async (token: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_URL}/users/complete-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Complete password reset error:', error);
      throw error;
    }
  },

  // User profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Get profile error:', error);
      throw error;
    }
  },

  updateUser: async (userData: Partial<User>) => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: '' +
          'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Update user error:', error);
      throw error;
    }
  },

  // Push notifications
  registerPushToken: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/user/push-token`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Register push token error:', error);
      throw error;
    }
  },

  updateNotificationSettings: async (settings: { enabled: boolean }) => {
    try {
      const response = await fetch(`${API_URL}/user/notification-settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Update notification settings error:', error);
      throw error;
    }
  },

  // Subscription
  updateSubscription: async (planId: string) => {
    try {
      const response = await fetch(`${API_URL}/user/subscription`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Update subscription error:', error);
      throw error;
    }
  },

  cancelSubscription: async () => {
    try {
      const response = await fetch(`${API_URL}/user/subscription`, {
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
  updatePrivacySettings(settings: PrivacySettings) {
    //TODO: Implement this method to update user privacy settings
  },
  getPrivacySettings() {
    //TODO: Implement this method to fetch user privacy settings
  }
};
