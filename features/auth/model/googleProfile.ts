import { z } from 'zod';

/** The part of Google's userinfo response the app uses. */
export const googleProfileSchema = z.object({ name: z.string().nullish().transform((v) => v ?? ''), email: z.string() });
