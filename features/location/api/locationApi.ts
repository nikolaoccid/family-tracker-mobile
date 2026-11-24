import { z } from 'zod';
import { http } from '@/shared/api';
import { familyLocationSchema, historyPointSchema, type Location } from '../model/location';

export interface HistoryRange {
  startDate?: string;
  endDate?: string;
}

export const locationApi = {
  // Not auto-retried: a replayed point is stale by the time it lands, the next fix replaces it.
  send: (location: Location) => http.post('/location', location),

  familyLocations: (familyId: string, signal?: AbortSignal) =>
    http.get(`/family/${familyId}/locations`, { schema: z.array(familyLocationSchema), signal }),

  history: (userId: string, range: HistoryRange, signal?: AbortSignal) =>
    http.get(`/location/history/${userId}`, {
      query: { ...range, limit: 1000 },
      schema: z.array(historyPointSchema),
      signal,
    }),

  updateBattery: (level: number) => http.post('/user/battery', { level }, { retry: true }),
};
