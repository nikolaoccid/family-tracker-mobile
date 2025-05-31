import { Platform } from 'react-native';
import * as Location from 'expo-location';
import {assertEnvVars} from "@/utils/assertEnvVars";
import {getAuthHeaders} from "@/api/authUtils";

const {EXPO_PUBLIC_API_BASE_URL: API_URL} = assertEnvVars({EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL});

// Handle API errors
export const handleApiError = async (response: Response) => {
  try {
    const errorData = await response.json();
    return new Error(errorData.message || 'An error occurred');
  } catch (error) {
    return new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }
};

// Check if API is available
export const isApiAvailable = async () => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });


    if (!response.ok) {
      console.log(`API responded with status: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    // Handle network errors or no response
    console.log('API availability check failed:', (error as any).message, error);
    return false;
  }
};

// Get device info for debugging
export const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    isEmulator: Platform.OS === 'ios' ? false : false,
  };
};

// Format API errors for display
export const formatApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
};

// Retry a function with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> => {
  let retries = 0;

  const execute = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, retries);
      retries++;

      await new Promise(resolve => setTimeout(resolve, delay));
      return execute();
    }
  };

  return execute();
};

// Create a timeout signal that works in all environments
export const createTimeoutSignal = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Clean up the timeout when the signal is aborted
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });

  return controller.signal;
};

// Request location permissions
const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.error('Location permission not granted');
    return false;
  }
  return true;
};

export const registerPushToken = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/notifications/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering push token:', error);
    throw error;
  }
};
