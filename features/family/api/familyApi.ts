import { z } from 'zod';
import { http } from '@/shared/api';
import { CURRENT_FAMILY_ID, familySchema, type MemberRole } from '../model/family';

const familyOrNull = familySchema.nullish().transform((v) => v ?? null);

const inviteSchema = z.object({
  familyId: z.string(),
  familyName: z.string(),
  inviteeMail: z.string(),
  expiresAt: z.string().nullish(),
});
export type InviteDetails = z.infer<typeof inviteSchema>;

const body = { schema: familySchema };

export const familyApi = {
  current: (signal?: AbortSignal) => http.get(`/family/${CURRENT_FAMILY_ID}`, { schema: familyOrNull, signal }),
  create: (name: string, idempotencyKey?: string) => http.post('/family', { name }, { ...body, idempotencyKey }),
  rename: (familyId: string, name: string) => http.put(`/family/${familyId}`, { name }, body),
  remove: (familyId: string) => http.delete(`/family/${familyId}`),
  addMember: (familyId: string, email: string) => http.post(`/family/${familyId}/members`, { email }, body),
  removeMember: (familyId: string, memberId: string) => http.delete(`/family/${familyId}/members/${memberId}`, body),
  setRole: (familyId: string, memberId: string, role: MemberRole) =>
    http.put(`/family/${familyId}/members/${memberId}/role`, { role }, body),
  setSharing: (familyId: string, isSharing: boolean) =>
    http.put(`/family/${familyId}/location-sharing`, { isSharing }, body),

  verifyInvite: (inviteToken: string) => http.post('/family/verify/', { inviteToken }, { schema: inviteSchema }),
  acceptInvite: (inviteToken: string) => http.post('/family/accept/', { inviteToken }),
  rejectInvite: (inviteToken: string) => http.post('/family/reject/', { inviteToken }),
};
