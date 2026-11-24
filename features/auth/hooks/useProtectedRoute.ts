import { useEffect } from 'react';
import { useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../model/authStore';
import { decideRoute } from '../model/routeGuard';

/** Redirects based on session state. Mounted once, in the root layout. */
export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const navigationReady = Boolean(useRootNavigationState()?.key);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Navigating before the root navigator mounts throws; wait for it.
    if (!navigationReady) return;
    const target = decideRoute(segments, isAuthenticated, user);
    if (target) router.replace(target);
    // `user` only matters when leaving the auth group, which `segments` already tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments, isAuthenticated, router, navigationReady]);
}
