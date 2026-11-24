import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { familyApi } from '../api/familyApi';
import { familyKeys } from '../model/keys';

/** The signed-in user's family, or null when they have none. */
export function useFamily() {
  const signedIn = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: familyKeys.current(),
    queryFn: ({ signal }) => familyApi.current(signal),
    enabled: signedIn,
  });
}
