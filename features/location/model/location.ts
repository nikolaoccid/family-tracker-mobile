import { z } from 'zod';
import { opt } from '@/shared/api';

export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z
    .string()
    .nullish()
    .transform((v) => v ?? ''),
  accuracy: opt(z.number()),
  speed: opt(z.number()),
  heading: opt(z.number()),
});

export type Location = z.infer<typeof locationSchema>;

export const historyPointSchema = locationSchema.extend({
  id: z.string(),
  userId: z
    .string()
    .nullish()
    .transform((v) => v ?? ''),
  whoCanSeeLocation: opt(z.array(z.string())),
});

export type LocationHistory = z.infer<typeof historyPointSchema>;

/** Row returned by `GET /family/:id/locations`: a member entity with its latest position. */
export const familyLocationSchema = z.object({
  id: z.string(),
  latitude: opt(z.number()),
  longitude: opt(z.number()),
  user: opt(z.object({ id: opt(z.string()), name: opt(z.string()) })),
});

export type FamilyLocation = z.infer<typeof familyLocationSchema>;
