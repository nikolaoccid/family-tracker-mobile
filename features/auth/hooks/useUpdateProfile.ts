import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../model/authStore';
import type { User } from '../model/user';

/** Updates the local user at once and rolls back if the server rejects the change. */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (changes: Partial<User>) => authApi.updateProfile(changes),
    onMutate: (changes) => {
      const previous = useAuthStore.getState().user;
      useAuthStore.getState().patchUser(changes);
      return { previous };
    },
    onError: (_error, _changes, context) => {
      if (context?.previous) useAuthStore.setState({ user: context.previous });
    },
  });
}
