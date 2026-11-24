import type { ZodType } from 'zod';
import { ApiError, messageFromBody } from './errors';
import { backoffDelay, defaultRetryPolicy, IDEMPOTENT_METHODS, type RetryPolicy } from './retry';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions<T> {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /** Response validator. Use non-strict objects: unknown fields must be tolerated. */
  schema?: ZodType<T>;
  /** Skip the Authorization header and the 401 refresh flow (login, register, reset). */
  auth?: boolean;
  /** Allow automatic retries for a non-idempotent call that is safe to repeat. */
  retry?: boolean;
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

const DEFAULT_TIMEOUT_MS = 10_000;

export interface HttpClient {
  request<T = unknown>(method: HttpMethod, path: string, options?: RequestOptions<T>): Promise<T>;
  get<T = unknown>(path: string, options?: RequestOptions<T>): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  delete<T = unknown>(path: string, options?: RequestOptions<T>): Promise<T>;
}

export function buildUrl(baseUrl: string, path: string, query?: RequestOptions<unknown>['query']): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
  }
  const qs = params.toString();
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}${qs ? `?${qs}` : ''}`;
}

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const policy = config.retryPolicy ?? defaultRetryPolicy;
  const sleep = config.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const random = config.random ?? Math.random;

  // Concurrent 401s on the same token report the end of the session once.
  let reportedToken: string | null | undefined;
  const reportUnauthorized = (token: string | null) => {
    if (reportedToken === token) return;
    reportedToken = token;
    config.onUnauthorized?.();
  };

  // Single-flight refresh: concurrent 401s share one refresh call.
  let refreshing: Promise<string | null> | null = null;
  const refreshOnce = (): Promise<string | null> => {
    if (!config.refreshToken) return Promise.resolve(null);
    refreshing ??= config.refreshToken().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  async function send(method: HttpMethod, url: string, token: string | null, options: RequestOptions<unknown>) {
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    const onCallerAbort = () => controller.abort();
    options.signal?.addEventListener('abort', onCallerAbort);

    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (options.body !== undefined) headers['Content-Type'] = 'application/json';
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetchImpl(url, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
      const text = await response.text();
      return { response, text };
    } catch (cause) {
      if (timedOut) throw new ApiError({ kind: 'timeout', message: 'The request timed out', cause });
      if (options.signal?.aborted) throw new ApiError({ kind: 'aborted', message: 'Request cancelled', cause });
      throw new ApiError({ kind: 'network', message: 'Network request failed', cause });
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onCallerAbort);
    }
  }

  function parseBody(text: string, status: number): unknown {
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch (cause) {
      throw new ApiError({ kind: 'parse', status, message: 'The server sent an unreadable response', cause });
    }
  }

  async function request<T>(method: HttpMethod, path: string, options: RequestOptions<T> = {}): Promise<T> {
    const url = buildUrl(config.baseUrl, path, options.query);
    const useAuth = options.auth !== false;
    const retryable = IDEMPOTENT_METHODS.has(method) || options.retry === true;
    let token = useAuth ? config.getToken() : null;
    let refreshedOnce = false;

    for (let attempt = 0; ; attempt++) {
      try {
        const { response, text } = await send(method, url, token, options);

        if (response.status === 401 && useAuth) {
          // A concurrent request may already have renewed the token; reuse it instead of refreshing again.
          const latest = config.getToken();
          if (!refreshedOnce && latest && latest !== token) {
            refreshedOnce = true;
            token = latest;
            attempt--;
            continue;
          }
          if (!refreshedOnce && config.refreshToken) {
            refreshedOnce = true;
            const fresh = await refreshOnce();
            if (fresh) {
              token = fresh;
              attempt--; // the refresh retry does not consume a transient-failure attempt
              continue;
            }
          }
          reportUnauthorized(token);
          throw new ApiError({ kind: 'unauthorized', status: 401, message: 'Your session has expired' });
        }

        if (!response.ok) {
          let body: unknown;
          try {
            body = parseBody(text, response.status);
          } catch {
            body = undefined;
          }
          const { message, code } = messageFromBody(body, `HTTP error ${response.status}`);
          throw new ApiError({ kind: 'http', status: response.status, message, code });
        }

        const data = parseBody(text, response.status);
        if (!options.schema) return data as T;
        const parsed = options.schema.safeParse(data);
        if (!parsed.success) {
          throw new ApiError({
            kind: 'validation',
            status: response.status,
            message: 'The server response did not match the expected shape',
            cause: parsed.error,
          });
        }
        return parsed.data;
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;
        const canRetry = retryable && error.isTransient && attempt + 1 < policy.maxAttempts;
        if (!canRetry) throw error;
        await sleep(backoffDelay(attempt, policy, random));
      }
    }
  }

  return {
    request,
    get: (path, options) => request('GET', path, options),
    post: (path, body, options) => request('POST', path, { ...options, body }),
    put: (path, body, options) => request('PUT', path, { ...options, body }),
    delete: (path, options) => request('DELETE', path, options),
  };
}
