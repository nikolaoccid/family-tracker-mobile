import { useAuthStore } from '@/store/authStore';

// Helper function to get headers with auth token
export const getAuthHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}; 