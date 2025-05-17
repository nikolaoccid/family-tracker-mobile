import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription } from '@/types';
import { subscriptions } from '@/mocks/data';

interface SubscriptionStore {
  subscriptions: Subscription[];
  selectedPlan: Subscription | null;
  isLoading: boolean;
  error: string | null;
  
  fetchSubscriptions: () => Promise<void>;
  selectPlan: (planId: string) => void;
  subscribeToPlan: (planId: string, paymentDetails: any) => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      selectedPlan: null,
      isLoading: false,
      error: null,
      
      fetchSubscriptions: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set({ 
            subscriptions, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      selectPlan: (planId) => {
        const plan = get().subscriptions.find(p => p.id === planId) || null;
        set({ selectedPlan: plan });
      },
      
      subscribeToPlan: async (planId, paymentDetails) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const plan = get().subscriptions.find(p => p.id === planId);
          if (!plan) {
            throw new Error('Plan not found');
          }
          
          set({ 
            selectedPlan: plan,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'family-tracker-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedPlan: state.selectedPlan,
      }),
    }
  )
);