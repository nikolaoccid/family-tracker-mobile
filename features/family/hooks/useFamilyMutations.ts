import { useMutation, useQueryClient } from '@tanstack/react-query';
import { familyApi } from '../api/familyApi';
import type { Family, MemberRole } from '../model/family';
import { familyKeys } from '../model/keys';

/** Every mutation that returns the updated family writes it straight into the cache. */
function useFamilyMutation<V>(call: (variables: V) => Promise<Family>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: call,
    onSuccess: (family) => queryClient.setQueryData(familyKeys.current(), family),
  });
}

export const useCreateFamily = () => useFamilyMutation((name: string) => familyApi.create(name));

export const useRenameFamily = (familyId: string) =>
  useFamilyMutation((name: string) => familyApi.rename(familyId, name));

export const useAddMember = (familyId: string) =>
  useFamilyMutation((email: string) => familyApi.addMember(familyId, email));

export const useRemoveMember = (familyId: string) =>
  useFamilyMutation((memberId: string) => familyApi.removeMember(familyId, memberId));

export const useSetMemberRole = (familyId: string) =>
  useFamilyMutation((v: { memberId: string; role: MemberRole }) => familyApi.setRole(familyId, v.memberId, v.role));

export const useSetSharing = (familyId: string) =>
  useFamilyMutation((isSharing: boolean) => familyApi.setSharing(familyId, isSharing));

export function useDeleteFamily(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => familyApi.remove(familyId),
    onSuccess: () => queryClient.setQueryData(familyKeys.current(), null),
  });
}
