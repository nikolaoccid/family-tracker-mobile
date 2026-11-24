import type { User } from './user';

export type GuardDecision = '/' | '/permissions/notifications' | '/permissions/location' | '/(tabs)' | null;

/** Group names that stay reachable without a session. */
const PUBLIC_ROOTS = new Set(['(auth)', 'permissions', 'subscription']);

/**
 * Where the router must send the user, or null to stay. Pure so it can be tested
 * without navigation: signed-out users go to sign-in, signed-in users leaving the
 * auth group go through the missing permission steps first.
 */
export function decideRoute(segments: readonly string[], isAuthenticated: boolean, user: User | null): GuardDecision {
  const root = segments[0] ?? '';
  const inAuthGroup = root === '(auth)';
  if (inAuthGroup && segments[1] === 'reset-password') return null;

  if (!isAuthenticated) return PUBLIC_ROOTS.has(root) ? null : '/';
  if (!inAuthGroup) return null;

  if (user && !user.hasNotificationsEnabled && !user.hasLocationEnabled) return '/permissions/notifications';
  if (user && !user.hasLocationEnabled) return '/permissions/location';
  return '/(tabs)';
}
