import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from '@/types';
import { userController } from '@/api/userController';

interface AuthStore extends AuthState {
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (name: string, email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  completePasswordReset: (token: string, newPassword: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  setError: (error: string | null) => void;
}

const ERROR_TIMEOUT = 5000;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => {
      const setErrorWithTimeout = (error: string | null) => {
        set({ error });
        if (error) {
          setTimeout(() => set({ error: null }), ERROR_TIMEOUT);
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
            const response = await userController.login(email, password);
            set({
              user: response.user,
              accessToken: response.token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            set({ isLoading: false });
            setErrorWithTimeout(error instanceof Error ? error.message : 'An error occurred');
          }
        },

        loginWithGoogle: async (name, email, password) => {
          set({ isLoading: true, error: null });
          try {
            const response = await userController.loginWithGoogle(name, email, password);
            set({
              user: response.user,
              accessToken: response.token,
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
            const response = await userController.register(name, email, password);
            set({
              user: response.user,
              accessToken: response.token,
              isAuthenticated: true,
              isLoading: false
            });
            return response.ok;
          } catch (error) {
            set({ isLoading: false });
            setErrorWithTimeout(error instanceof Error ? error.message : 'An error occurred');
            return false;
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
            await userController.resetPassword(email);
            set({ isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            setErrorWithTimeout(error instanceof Error ? error.message : 'An error occurred');
          }
        },

        completePasswordReset: async (token, newPassword) => {
          set({ isLoading: true, error: null });
          try {
            await userController.completePasswordReset(token, newPassword);
            set({ isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'An error occurred',
              isLoading: false
            });
          }
        },

        updateUser: (userData) => {
          set((state) => {
            const updatedUser = state.user ? { ...state.user, ...userData } : null;
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
