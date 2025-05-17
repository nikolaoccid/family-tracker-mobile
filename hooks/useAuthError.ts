import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';

export const useAuthError = () => {
  const navigation = useNavigation();
  const { error, clearError } = useAuthStore();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      clearError();
    });

    return unsubscribe;
  }, [navigation, clearError]);

  return { error, clearError };
}; 