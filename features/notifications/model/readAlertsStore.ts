import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { persistOptions } from '@/shared/storage';
import { onSessionReset } from '@/shared/session';

const MAX_REMEMBERED = 500;

const persistedSchema = z.object({ readIds: z.array(z.string()) });
type Persisted = z.infer<typeof persistedSchema>;

interface ReadAlertsState extends Persisted {
  markRead: (id: string) => void;
}

const defaults: Persisted = { readIds: [] };

/** Alerts the user opened. Bounded so it cannot grow forever. */
export const useReadAlertsStore = create<ReadAlertsState>()(
  persist(
    (set) => ({
      ...defaults,
      markRead: (id) =>
        set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id].slice(-MAX_REMEMBERED) })),
    }),
    persistOptions<ReadAlertsState, Persisted>({
      name: 'read-alerts',
      version: 1,
      schema: persistedSchema,
      defaults,
      migrations: { 0: (state) => migrateLegacy(state) },
      partialize: (s) => ({ readIds: s.readIds }),
    }),
  ),
);

/** v0 lived inside the family store as `readAlertIds`. */
function migrateLegacy(state: unknown): Persisted {
  const legacy = (state as { readAlertIds?: unknown } | null)?.readAlertIds;
  return { readIds: Array.isArray(legacy) ? legacy.filter((x): x is string => typeof x === 'string') : [] };
}

onSessionReset(() => useReadAlertsStore.setState({ readIds: [] }));
