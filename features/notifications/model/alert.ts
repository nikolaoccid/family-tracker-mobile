import { z } from 'zod';
import { openEnum, opt } from '@/shared/api';

export const KNOWN_ALERT_TYPES = ['emergency', 'zone_exit', 'zone_entry', 'low_battery', 'heading_home'] as const;
export type KnownAlertType = (typeof KNOWN_ALERT_TYPES)[number];

const num = z.number().nullish().transform((v) => v ?? undefined);

/** Wire shape of `GET /family/:id/alerts` rows, mapped to the app's `Alert`. */
export const alertSchema = z
  .object({
    id: z.string(),
    type: openEnum(KNOWN_ALERT_TYPES, 'unknown'),
    userId: z.string().nullish().transform((v) => v ?? ''),
    familyId: z.string().nullish().transform((v) => v ?? ''),
    message: z.string().nullish().transform((v) => v ?? ''),
    latitude: num,
    longitude: num,
    accuracy: num,
    speed: num,
    heading: num,
    timestamp: z.string().nullish().transform((v) => v ?? ''),
    read: opt(z.boolean()),
  })
  .transform(({ latitude, longitude, accuracy, speed, heading, read, ...rest }) => ({
    ...rest,
    read: read ?? false,
    location:
      latitude !== undefined && longitude !== undefined
        ? { latitude, longitude, accuracy, speed, heading, timestamp: rest.timestamp }
        : undefined,
  }));

export type Alert = z.infer<typeof alertSchema>;
export type AlertType = Alert['type'];
