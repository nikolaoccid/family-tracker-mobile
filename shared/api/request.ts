import { ApiError } from './errors';
import type { HttpMethod, RequestOptions } from './types';

export function buildUrl(baseUrl: string, path: string, query?: RequestOptions<unknown>['query']): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
  }
  const qs = params.toString();
  const suffix = qs ? `?${qs}` : '';
  if (/^https?:\/\//.test(path)) return `${path}${suffix}`; // absolute URL for third-party calls
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}${suffix}`;
}

export async function sendRequest(
  fetchImpl: typeof fetch,
  defaultTimeoutMs: number,
  method: HttpMethod,
  url: string,
  token: string | null,
  options: RequestOptions<unknown>,
) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
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
    if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
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

export function parseBody(text: string, status: number): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiError({ kind: 'parse', status, message: 'The server sent an unreadable response', cause });
  }
}
