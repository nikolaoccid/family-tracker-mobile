// store/resetStores.ts
import { useFamilyStore } from '@/store/familyStore';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

export const resetStores = () => {
  // Reset family store
  useFamilyStore.setState({
    family: null,
    safeZones: [],
    alerts: [],
    isLoading: false,
    error: null,
  });

  // Reset auth store
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
  });

  // Reset location store
  useLocationStore.setState({
    myLocation: null,
  });

  console.log('All stores have been reset');
};
