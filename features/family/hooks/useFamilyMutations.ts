import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newIdempotencyKey } from '@/shared/api';
import { familyApi } from '../api/familyApi';
import type { Family, MemberRole } from '../model/family';
import { familyKeys } from '../model/keys';

const need = (familyId: string | undefined): string => {
  if (!familyId) throw new Error('Family not loaded yet');
  return familyId;
};

/** Every mutation that returns the updated family writes it straight into the cache. */
function useFamilyMutation<V>(call: (variables: V) => Promise<Family>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: call,
    onSuccess: (family) => queryClient.setQueryData(familyKeys.current(), family),
  });
}

export const useCreateFamily = () => useFamilyMutation((name: string) => familyApi.create(name, newIdempotencyKey()));

export const useRenameFamily = (familyId: string | undefined) =>
  useFamilyMutation((name: string) => familyApi.rename(need(familyId), name));

export const useAddMember = (familyId: string | undefined) =>
  useFamilyMutation((email: string) => familyApi.addMember(need(familyId), email));

export const useRemoveMember = (familyId: string | undefined) =>
  useFamilyMutation((memberId: string) => familyApi.removeMember(need(familyId), memberId));

export const useSetMemberRole = (familyId: string | undefined) =>
  useFamilyMutation((v: { memberId: string; role: MemberRole }) => familyApi.setRole(need(familyId), v.memberId, v.role));

export const useSetSharing = (familyId: string | undefined) =>
  useFamilyMutation((isSharing: boolean) => familyApi.setSharing(need(familyId), isSharing));

export function useDeleteFamily(familyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => familyApi.remove(need(familyId)),
    onSuccess: () => queryClient.setQueryData(familyKeys.current(), null),
  });
}
