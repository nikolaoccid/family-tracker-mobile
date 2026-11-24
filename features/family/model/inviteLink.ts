import { z } from 'zod';

const MAX_TOKEN_LENGTH = 2048;

const paramsSchema = z.object({
  invitedEmail: z.string().min(3).max(320).regex(/^[^\s@]+@[^\s@]+$/, 'not an email'),
  token: z.string().min(1).max(MAX_TOKEN_LENGTH).regex(/^[\w.~+/=-]+$/, 'not a token'),
});

export type InviteParams = z.infer<typeof paramsSchema>;

/** Deep-link params are external input: anything that is not a well-formed email and token is rejected. */
export function parseInviteParams(query: Record<string, unknown> | null | undefined): InviteParams | null {
  const first = (value: unknown) => (Array.isArray(value) ? value[0] : value);
  const parsed = paramsSchema.safeParse({
    invitedEmail: first(query?.invitedEmail),
    token: first(query?.token),
  });
  return parsed.success ? parsed.data : null;
}

/** True when the URL is a family-invite deep link (`app.familytracker://family-invite?...`). */
export const isInviteLink = (url: string): boolean => url.includes('family-invite');
