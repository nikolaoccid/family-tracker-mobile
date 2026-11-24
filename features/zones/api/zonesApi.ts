import { z } from 'zod';
import { http } from '@/shared/api';
import { analyticsSchema, zoneSchema, type NewSafeZone, type SafeZone } from '../model/zone';

export interface AnalyticsRange {
  userId: string;
  startDate?: string;
  endDate?: string;
}

export const zonesApi = {
  list: (familyId: string, signal?: AbortSignal) =>
    http.get(`/family/${familyId}/safe-zones`, { schema: z.array(zoneSchema), signal }),

  create: (zone: NewSafeZone, familyId: string, idempotencyKey?: string) =>
    http.post('/safe-zone', { ...zone, familyId }, { schema: zoneSchema, idempotencyKey }),

  update: (zoneId: string, zone: Partial<SafeZone>, familyId: string) =>
    http.put(`/safe-zone/${zoneId}`, { ...zone, familyId }, { schema: zoneSchema }),

  remove: (zoneId: string) => http.delete(`/safe-zone/${zoneId}`),

  setActive: (zoneId: string, isActive: boolean) => http.put(`/safe-zone/${zoneId}/status`, { isActive }),

  analytics: (zoneId: string, { userId, startDate, endDate }: AnalyticsRange, signal?: AbortSignal) =>
    http.get(`/zone-analytics/${zoneId}/${userId}`, {
      query: { startDate, endDate },
      schema: analyticsSchema,
      signal,
    }),

  analyticsSummary: ({ userId, startDate, endDate }: AnalyticsRange, signal?: AbortSignal) =>
    http.get(`/zone-analytics/user/${userId}/summary`, {
      query: { startDate, endDate },
      schema: z.array(analyticsSchema),
      signal,
    }),
};
