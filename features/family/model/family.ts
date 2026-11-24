import { z } from 'zod';
import { opt, openEnum } from '@/shared/api';
import { userSchema } from '@/features/auth';
import { locationSchema } from '@/features/location';

export const memberSchema = userSchema.extend({
  role: openEnum(['admin', 'member'] as const, 'member'),
  location: opt(locationSchema),
  batteryLevel: opt(z.number()),
  lastSeen: opt(z.string()),
  isSharing: z.boolean().nullish().transform((v) => v ?? false),
  isInvited: opt(z.boolean()),
});

export const familySchema = z.object({
  id: z.string(),
  name: z.string().nullish().transform((v) => v ?? ''),
  members: z.array(memberSchema).nullish().transform((v) => v ?? []),
  createdAt: z.string().nullish().transform((v) => v ?? ''),
  ownerId: z.string().nullish().transform((v) => v ?? ''),
});

export type FamilyMember = z.infer<typeof memberSchema>;
export type Family = z.infer<typeof familySchema>;
export type MemberRole = FamilyMember['role'];

/** The API resolves "the caller's family" for this nil UUID. */
export const CURRENT_FAMILY_ID = '00000000-0000-0000-0000-000000000000';
