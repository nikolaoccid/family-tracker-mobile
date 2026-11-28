import { Alert } from 'react-native';
import { logger } from '@/shared/logger';
import { confirm } from '@/shared/utils/confirm';
import type { Family, FamilyMember } from '../model/family';
import { useDeleteFamily, useRemoveMember, useSetMemberRole } from './useFamilyMutations';

/** Admin actions on a family, each behind a confirmation and with a uniform result message. */
export function useMemberActions(family: Family, isAdmin: boolean) {
  const setRole = useSetMemberRole(family.id);
  const removeMember = useRemoveMember(family.id);
  const deleteFamily = useDeleteFamily(family.id);

  async function guarded(action: () => Promise<unknown>, success: string, failure: string) {
    try {
      await action();
      Alert.alert('Success', success);
    } catch (error) {
      logger.warn(failure, error);
      Alert.alert('Error', `${failure}. Please try again.`);
    }
  }

  return {
    isBusy: setRole.isPending || removeMember.isPending || deleteFamily.isPending,

    async promote(member: FamilyMember) {
      if (!isAdmin) return;
      const ok = await confirm({
        title: 'Make Admin',
        message: `Are you sure you want to make ${member.name} an admin? They will have full control over the family group.`,
        confirmLabel: 'Make Admin',
      });
      if (ok) {
        await guarded(
          () => setRole.mutateAsync({ memberId: member.id, role: 'admin' }),
          `${member.name} is now an admin.`,
          'Failed to update member role',
        );
      }
    },

    async demote(member: FamilyMember) {
      if (!isAdmin) return;
      const ok = await confirm({
        title: 'Remove Admin',
        message: `Are you sure you want to remove admin rights from ${member.name}?`,
        confirmLabel: 'Remove Admin',
        destructive: true,
      });
      if (ok) {
        await guarded(
          () => setRole.mutateAsync({ memberId: member.id, role: 'member' }),
          `${member.name} is now a member.`,
          'Failed to update member role',
        );
      }
    },

    async remove(member: FamilyMember) {
      if (!isAdmin) return;
      const ok = await confirm({
        title: 'Remove Member',
        message: `Are you sure you want to remove ${member.name} from the family?`,
        confirmLabel: 'Remove',
        destructive: true,
      });
      if (ok) {
        await guarded(
          () => removeMember.mutateAsync(member.id),
          `${member.name} has been removed from the family.`,
          'Failed to remove member',
        );
      }
    },

    async deleteFamily() {
      if (!isAdmin) return;
      const ok = await confirm({
        title: 'Delete Family',
        message:
          'Are you sure you want to delete this family? This action cannot be undone and all members will be removed.',
        confirmLabel: 'Delete',
        destructive: true,
      });
      if (ok) await guarded(() => deleteFamily.mutateAsync(), 'Family has been deleted.', 'Failed to delete family');
    },
  };
}
