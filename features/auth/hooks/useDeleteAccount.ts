import { useState } from 'react';
import { Alert } from 'react-native';
import { clearAllLocalData } from '@/shared/storage';
import { logger } from '@/shared/logger';
import { confirm } from '@/shared/utils/confirm';
import { authApi } from '../api/authApi';
import { runAccountDeletion } from '../model/accountDeletion';
import { useAuthStore } from '../model/authStore';

/** "Delete account": confirmation dialog, `DELETE /users/me`, then sign-out and a full local wipe. */
export function useDeleteAccount(onDeleted: () => void) {
  const signOut = useAuthStore((s) => s.signOut);
  const [isDeleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const outcome = await runAccountDeletion({
        confirm: () =>
          confirm({
            title: 'Delete account',
            message:
              'This permanently deletes your account, your location history and your data. This cannot be undone.',
            confirmLabel: 'Delete',
            destructive: true,
          }),
        remove: authApi.deleteAccount,
        clear: async () => {
          signOut(); // resets the session: in-memory query cache, persisted cache, stores
          await clearAllLocalData();
        },
      });
      if (outcome === 'deleted') onDeleted();
      if (outcome === 'failed') {
        logger.warn('account deletion failed');
        Alert.alert('Could not delete account', 'Please check your connection and try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return { deleteAccount, isDeleting };
}
