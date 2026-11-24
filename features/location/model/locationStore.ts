import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { persistOptions } from '@/shared/storage';
import { onSessionReset } from '@/shared/session';
import type { Location } from './location';

const persistedSchema = z.object({ isBackgroundTrackingEnabled: z.boolean() });
type Persisted = z.infer<typeof persistedSchema>;

interface LocationState extends Persisted {
  myLocation: Location | null;
  updateMyLocation: (location: Location) => void;
  setBackgroundTrackingEnabled: (enabled: boolean) => void;
}

const defaults: Persisted = { isBackgroundTrackingEnabled: false };

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      ...defaults,
      myLocation: null,
      updateMyLocation: (myLocation) => set({ myLocation }),
      setBackgroundTrackingEnabled: (enabled) => set({ isBackgroundTrackingEnabled: enabled }),
    }),
    persistOptions<LocationState, Persisted>({
      name: 'location',
      version: 1,
      schema: persistedSchema,
      defaults,
      migrations: { 0: (state) => state },
      partialize: (s) => ({ isBackgroundTrackingEnabled: s.isBackgroundTrackingEnabled }),
    }),
  ),
);

onSessionReset(() => useLocationStore.setState({ myLocation: null }));
