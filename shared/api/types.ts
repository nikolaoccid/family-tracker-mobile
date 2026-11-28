import type { ZodType } from 'zod';
import type { RetryPolicy } from './retry';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions<T> {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /** Response validator. Use non-strict objects: unknown fields must be tolerated. */
  schema?: ZodType<T>;
  /** Skip the Authorization header and the 401 refresh flow (login, register, reset). */
  auth?: boolean;
  /** Set false on the refresh call itself: its 401 means "cannot refresh", not "try refreshing". */
  refresh?: boolean;
  /** Allow automatic retries for a non-idempotent call that is safe to repeat. */
  retry?: boolean;
  /** Sent as `Idempotency-Key`; a keyed create is safe to retry, so it is retried like an idempotent call. */
  idempotencyKey?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface HttpClientConfig {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  getToken: () => string | null;
  /** Returns a fresh token, or null when the session cannot be renewed. Optional: the API has no refresh endpoint yet. */
  refreshToken?: () => Promise<string | null>;
  /** Called once when the session is definitively invalid. */
  onUnauthorized?: () => void;
  timeoutMs?: number;
  retryPolicy?: RetryPolicy;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

export interface HttpClient {
  request<T = unknown>(method: HttpMethod, path: string, options?: RequestOptions<T>): Promise<T>;
  get<T = unknown>(path: string, options?: RequestOptions<T>): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  delete<T = unknown>(path: string, options?: RequestOptions<T>): Promise<T>;
}
