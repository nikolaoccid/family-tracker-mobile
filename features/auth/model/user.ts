import { z } from 'zod';
import { opt } from '@/shared/api';

export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullish().transform((v) => v ?? ''),
  email: z.string(),
  avatar: opt(z.string()),
  phone: opt(z.string()),
  isPremium: z.boolean().nullish().transform((v) => v ?? false),
  createdAt: z.string().nullish().transform((v) => v ?? ''),
  expoPushToken: opt(z.string()),
  hasNotificationsEnabled: opt(z.boolean()),
  hasLocationEnabled: opt(z.boolean()),
});

export type User = z.infer<typeof userSchema>;

export const sessionSchema = z.object({
  user: userSchema,
  token: z.string().min(1),
});

export type Session = z.infer<typeof sessionSchema>;

/** `POST /auth/refresh`: a fresh token and the moment it stops working. */
export const refreshedTokenSchema = z.object({ token: z.string().min(1), expiresAt: z.string().nullish() });
