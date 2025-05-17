import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '@/types';
import { currentUser } from '@/mocks/data';
import { userController } from '@/api/userController';

interface AuthStore extends AuthState {
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  setError: (error: string | null) => void;
}

// Error timeout in milliseconds
const ERROR_TIMEOUT = 5000;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => {
      const setErrorWithTimeout = (error: string | null) => {
        set({ error });
        if (error) {
          // Clear error after timeout
          setTimeout(() => {
            set({ error: null });
          }, ERROR_TIMEOUT);
        }
      };

      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setError: setErrorWithTimeout,

        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            // Try to use the API if available
            try {
              const response = await userController.login(email, password);
              set({
                user: response.user,
                accessToken: response.token,
                isAuthenticated: true,
                isLoading: false
              });
              return;
            } catch (apiError) {
              // If API fails, fall back to mock
              console.log('API login failed, using mock:', apiError);
            }

            // Mock validation
            if (email !== 'john.doe@example.com' || password !== 'password') {
              throw new Error('Invalid email or password');
            }

            // Mock token
            const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);

            set({
              user: currentUser,
              accessToken: token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            set({ isLoading: false });
            setErrorWithTimeout(error instanceof Error ? error.message : 'An error occurred');
          }
        },

        loginWithGoogle: async () => {
          set({ isLoading: true, error: null });
          try {
            // Try to use the API if available
            try {
              const response = await userController.loginWithGoogle();
              set({
                user: response.user,
                accessToken: response.token,
                isAuthenticated: true,
                isLoading: false
              });
              return;
            } catch (apiError) {
              // If API fails, fall back to mock
              console.log('API Google login failed, using mock:', apiError);
            }

            // Mock token
            const token = 'mock-google-jwt-token-' + Math.random().toString(36).substring(2);

            set({
              user: currentUser,
              accessToken: token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            set({ isLoading: false });
            setErrorWithTimeout(error instanceof Error ? error.message : 'An error occurred');
          }
        },

        register: async (name, email, password) => {
          set({ isLoading: true, error: null });
          try {
            // Try to use the API if available
            try {
              const response = await userController.register(name, email, password);
              set({
                user: response.user,
                accessToken: response.token,
                isAuthenticated: true,
                isLoading: false
              });
              return response.ok;
            } catch (apiError) {
              throw new Error('Registration failed, do you have account?');
              console.log('API register failed, using mock:', apiError);
              return false
            }

            // Mock validation
            if (email === 'john.doe@example.com') {
              throw new Error('Email already in use');
            }

            // Mock token
            const token = 'mock-register-jwt-token-' + Math.random().toString(36).substring(2);

            const newUser: User = {
              ...currentUser,
              id: Math.random().toString(36).substring(2, 9),
              name,
              email,
              isPremium: false,
              createdAt: new Date().toISOString(),
              hasNotificationsEnabled: false,
              hasLocationEnabled: false,
            };

            set({
              user: newUser,
              accessToken: token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            set({ isLoading: false });
            setErrorWithTimeout(error instanceof Error ? error.message : 'An error occurred');
          }
        },

        logout: () => {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null
          });
        },

        resetPassword: async (email) => {
          set({ isLoading: true, error: null });
          try {
            // Try to use the API if available
            try {
              await userController.resetPassword(email);
              set({ isLoading: false });
              return;
            } catch (apiError) {
              // If API fails, fall back to mock
              setErrorWithTimeout(apiError instanceof Error ? apiError.message : 'An error occurred');
              console.log('API reset password failed, using mock:', apiError);
            }

            // Mock validation
            if (email !== 'john.doe@example.com') {
              throw new Error('Email not found');
            }

            set({ isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            setErrorWithTimeout(error instanceof Error ? error.message : 'An error occurred');
          }
        },

        updateUser: (userData) => {
          set((state) => {
            const updatedUser = state.user ? { ...state.user, ...userData } : null;

            // Try to update user on the server if we have a token
            if (updatedUser && state.accessToken) {
              userController.updateUser(updatedUser)
                .catch(error => {
                  console.error('Failed to update user on server:', error);
                  setErrorWithTimeout(error instanceof Error ? error.message : 'Failed to update user');
                });
            }

            return { user: updatedUser };
          });
        },

        clearError: () => {
          set({ error: null });
        }
      };
    },
    {
      name: 'family-tracker-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
