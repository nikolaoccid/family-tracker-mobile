import { z } from 'zod';
import { numeric } from '@/shared/api';

export const zoneSchema = z.object({
  id: z.string(),
  name: z.string().nullish().transform((v) => v ?? ''),
  color: z.string().nullish().transform((v) => v ?? '#4A80F0'),
  radius: numeric,
  centerLatitude: numeric,
  centerLongitude: numeric,
  membersToTrack: z.array(z.string()).nullish().transform((v) => v ?? []),
  isActive: z.boolean().nullish().transform((v) => v ?? true),
  createdAt: z.string().nullish().transform((v) => v ?? ''),
});

export type SafeZone = z.infer<typeof zoneSchema>;
export type NewSafeZone = Omit<SafeZone, 'id' | 'createdAt'>;

const visitSchema = z.object({
  entryTime: z.string(),
  exitTime: z.string().nullish().transform((v) => v ?? ''),
  duration: numeric,
});

export const analyticsSchema = z.object({
  zoneId: z.string(),
  zoneName: z.string().nullish().transform((v) => v ?? ''),
  userId: z.string(),
  userName: z.string().nullish().transform((v) => v ?? ''),
  totalTimeSpent: numeric,
  visits: z.array(visitSchema).nullish().transform((v) => v ?? []),
  timeByDay: z
    .array(z.object({ date: z.string(), minutes: numeric }))
    .nullish()
    .transform((v) => v ?? []),
});

export type ZoneVisit = z.infer<typeof visitSchema>;
export type ZoneAnalytics = z.infer<typeof analyticsSchema>;
