import { ApiError, messageFromBody } from './errors';
import { backoffDelay, defaultRetryPolicy, IDEMPOTENT_METHODS } from './retry';
import { buildUrl, parseBody, sendRequest } from './request';
import { createSessionGuard } from './session';
import type { HttpClient, HttpClientConfig, HttpMethod, RequestOptions } from './types';

const DEFAULT_TIMEOUT_MS = 10_000;

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const fetchImpl = config.fetchImpl ?? fetch;
  const policy = config.retryPolicy ?? defaultRetryPolicy;
  const sleep = config.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const random = config.random ?? Math.random;

  const session = createSessionGuard(config);
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function request<T>(method: HttpMethod, path: string, options: RequestOptions<T> = {}): Promise<T> {
    const url = buildUrl(config.baseUrl, path, options.query);
    const useAuth = options.auth !== false;
    const retryable = IDEMPOTENT_METHODS.has(method) || options.retry === true || options.idempotencyKey !== undefined;
    let token = useAuth ? config.getToken() : null;
    let refreshedOnce = false;

    for (let attempt = 0; ; attempt++) {
      try {
        const { response, text } = await sendRequest(fetchImpl, options.timeoutMs ?? timeoutMs, method, url, token, options);

        if (response.status === 401 && useAuth && options.refresh === false) {
          throw new ApiError({ kind: 'unauthorized', status: 401, message: 'Your session has expired' });
        }
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
            const fresh = await session.refreshOnce();
            if (fresh) {
              token = fresh;
              attempt--; // the refresh retry does not consume a transient-failure attempt
              continue;
            }
          }
          session.reportUnauthorized(token);
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

        session.rearm();
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
