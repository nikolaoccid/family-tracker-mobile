import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location } from '@/types';

interface LocationState {
  myLocation: Location | null;
  isBackgroundTrackingEnabled: boolean;
  lastLocationUpdate: string | null;
  
  // Actions
  updateMyLocation: (location: Location) => void;
  setBackgroundTrackingEnabled: (enabled: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      myLocation: null,
      isBackgroundTrackingEnabled: false,
      lastLocationUpdate: null,
      
      updateMyLocation: (location) => {
        set({
          myLocation: location,
          lastLocationUpdate: new Date().toISOString(),
        });
      },
      
      setBackgroundTrackingEnabled: (enabled) => {
        set({ isBackgroundTrackingEnabled: enabled });
      },
    }),
    {
      name: 'family-tracker-location',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isBackgroundTrackingEnabled: state.isBackgroundTrackingEnabled,
      }),
    }
  )
);