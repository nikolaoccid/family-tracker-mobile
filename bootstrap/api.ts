import { configureHttp, config } from '@/shared/api';
import { logger } from '@/shared/logger';
import { hydrateAuth, useAuthStore } from '@/features/auth';
import { registerLocationTask } from '@/features/location';

/**
 * The single swap point between the app and its backend. Demo mode replaces
 * `fetch` with an in-memory fake; the branch is removed from production bundles
 * because EXPO_PUBLIC_DEMO_MODE is inlined at build time.
 */
function selectFetch(): typeof fetch | undefined {
  if (process.env.EXPO_PUBLIC_DEMO_MODE === '1') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay a lazy require so production bundles drop it
    return (require('../demo/demoFetch') as typeof import('../demo/demoFetch')).demoFetch;
  }
  return undefined;
}

let started = false;

export function startApp(): void {
  if (started) return;
  started = true;

  configureHttp({
    baseUrl: config.apiBaseUrl,
    fetchImpl: selectFetch(),
    getToken: () => useAuthStore.getState().accessToken,
    // The API has no refresh endpoint yet; a 401 ends the session.
    onUnauthorized: () => {
      logger.info('session expired, signing out');
      useAuthStore.getState().signOut();
    },
  });

  // Headless context (background location): rebuild the session from secure storage on demand.
  let hydrating: Promise<void> | null = null;
  registerLocationTask(async () => {
    if (!useAuthStore.getState().hydrated) {
      hydrating ??= hydrateAuth().finally(() => {
        hydrating = null;
      });
      await hydrating;
    }
    return useAuthStore.getState().isAuthenticated;
  });
}
