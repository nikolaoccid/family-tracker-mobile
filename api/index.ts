import { locationController } from './locationController';
import { userController } from './userController';
import { familyController } from './familyController';
import { safeZoneController } from './safeZoneController';
import { alertController } from './alertController';
import { subscriptionController } from './subscriptionController';
import { isApiAvailable, handleApiError } from './utils';

export {
  locationController,
  userController,
  familyController,
  safeZoneController,
  alertController,
  subscriptionController,
  isApiAvailable,
  handleApiError,
};

export const api = {
  location: locationController,
  user: userController,
  family: familyController,
  safeZone: safeZoneController,
  alert: alertController,
  subscription: subscriptionController,
  utils: {
    isApiAvailable,
    handleApiError,
  },
};
