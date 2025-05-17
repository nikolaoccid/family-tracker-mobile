import { locationController } from './locationController';
import { userController } from './userController';
import { familyController } from './familyController';
import { safeZoneController } from './safeZoneController';
import { alertController } from './alertController';
import { subscriptionController } from './subscriptionController';
import { isApiAvailable, handleNetworkError, fetchWithTimeout, handleApiError } from './utils';

// Export all controllers
export {
  locationController,
  userController,
  familyController,
  safeZoneController,
  alertController,
  subscriptionController,
  isApiAvailable,
  handleNetworkError,
  fetchWithTimeout,
  handleApiError,
};

// Export a single API object for convenience
export const api = {
  location: locationController,
  user: userController,
  family: familyController,
  safeZone: safeZoneController,
  alert: alertController,
  subscription: subscriptionController,
  utils: {
    isApiAvailable,
    handleNetworkError,
    fetchWithTimeout,
    handleApiError,
  },
};