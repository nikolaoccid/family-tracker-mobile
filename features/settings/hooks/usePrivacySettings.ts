import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { privacyApi } from '../api/privacyApi';
import type { PrivacySettings } from '../model/privacy';

const privacyKey = ['settings', 'privacy'] as const;

export function usePrivacySettings() {
  const signedIn = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: privacyKey,
    queryFn: ({ signal }) => privacyApi.get(signal),
    enabled: signedIn,
  });
}

/** Optimistic: the cache shows the new value at once and rolls back if the server refuses it. */
export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: PrivacySettings) => privacyApi.update(settings),
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: privacyKey });
      const previous = queryClient.getQueryData<PrivacySettings>(privacyKey);
      queryClient.setQueryData(privacyKey, settings);
      return { previous };
    },
    onError: (_error, _settings, context) => {
      if (context?.previous) queryClient.setQueryData(privacyKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: privacyKey }),
  });
}
