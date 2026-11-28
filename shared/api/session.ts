import type { HttpClientConfig } from './types';

/** Session bookkeeping for the client: one sign-out report and one refresh call per burst of 401s. */
export function createSessionGuard(config: Pick<HttpClientConfig, 'refreshToken' | 'onUnauthorized'>) {
  // Concurrent 401s on the same token report the end of the session once.
  let reportedToken: string | null | undefined;
  // Single-flight refresh: concurrent 401s share one refresh call.
  let refreshing: Promise<string | null> | null = null;

  return {
    reportUnauthorized(token: string | null) {
      if (reportedToken === token) return;
      reportedToken = token;
      config.onUnauthorized?.();
    },
    /** A working session re-arms the sign-out report. */
    rearm() {
      reportedToken = undefined;
    },
    refreshOnce(): Promise<string | null> {
      if (!config.refreshToken) return Promise.resolve(null);
      refreshing ??= config.refreshToken().finally(() => {
        refreshing = null;
      });
      return refreshing;
    },
  };
}
