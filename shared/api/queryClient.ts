import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './errors';

const MINUTE = 60_000;

/** Retries only transient failures, and never more than twice. */
const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 2 && isApiError(error) && error.isTransient;

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: MINUTE,
        gcTime: 24 * 60 * MINUTE, // must cover the persisted cache's max age or restored data is collected at once
        retry: shouldRetry,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
