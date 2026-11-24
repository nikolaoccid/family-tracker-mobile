import { z } from 'zod';
import { createHttpClient, buildUrl, type HttpClientConfig } from '../client';
import { ApiError, isApiError, messageFromBody, toResult } from '../errors';
import { backoffDelay, defaultRetryPolicy } from '../retry';

type FetchStep = Response | Error | ((init: RequestInit) => Response | Promise<Response>);

/** A scripted fake server: each call consumes the next step. Errors are thrown like a dropped connection. */
function fakeFetch(steps: FetchStep[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = jest.fn(async (url: RequestInfo | URL, init: RequestInit = {}) => {
    calls.push({ url: String(url), init });
    const step = steps.shift();
    if (!step) throw new Error('fake server ran out of responses');
    if (step instanceof Error) throw step;
    if (typeof step === 'function') return step(init);
    return step;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function client(steps: FetchStep[], overrides: Partial<HttpClientConfig> = {}) {
  const server = fakeFetch(steps);
  const http = createHttpClient({
    baseUrl: 'https://api.example.test/',
    fetchImpl: server.impl,
    getToken: () => 'token-1',
    sleep: async () => undefined,
    random: () => 0.5,
    ...overrides,
  });
  return { http, ...server };
}

describe('http client: requests', () => {
  it('builds the url, sends the bearer token and parses JSON', async () => {
    const { http, calls } = client([json({ ok: true })]);
    await expect(http.get('/family/1', { query: { a: 1, b: undefined, c: '' } })).resolves.toEqual({ ok: true });
    expect(calls[0]?.url).toBe('https://api.example.test/family/1?a=1');
    expect((calls[0]?.init.headers as Record<string, string>).Authorization).toBe('Bearer token-1');
  });

  it('skips the auth header for public calls', async () => {
    const { http, calls } = client([json({})]);
    await http.post('/auth/login/jwt', { email: 'a@example.com' }, { auth: false });
    expect((calls[0]?.init.headers as Record<string, string>).Authorization).toBeUndefined();
    expect(calls[0]?.init.body).toBe('{"email":"a@example.com"}');
  });

  it('treats an empty body as undefined', async () => {
    const { http } = client([new Response('', { status: 200 })]);
    await expect(http.delete('/alert/1')).resolves.toBeUndefined();
  });

  it('buildUrl passes absolute urls through for third-party calls', () => {
    expect(buildUrl('https://x.test', 'https://other.test/a', { q: 1 })).toBe('https://other.test/a?q=1');
  });

  it('buildUrl joins slashes cleanly', () => {
    expect(buildUrl('https://x.test///', '///a/b')).toBe('https://x.test/a/b');
  });
});

describe('http client: failures', () => {
  it('maps a 4xx to a typed ApiError with the server message and does not retry', async () => {
    const { http, calls } = client([json({ message: ['email must be an email', 'name too short'] }, 400)]);
    const error = await http.get('/x').catch((e) => e);
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ kind: 'http', status: 400, message: 'email must be an email, name too short' });
    expect(calls).toHaveLength(1);
  });

  it('retries a 500 on an idempotent GET and then succeeds', async () => {
    const { http, calls } = client([json({}, 500), json({}, 503), json({ ok: 1 })]);
    await expect(http.get('/x')).resolves.toEqual({ ok: 1 });
    expect(calls).toHaveLength(3);
  });

  it('gives up after the attempt budget and reports the last error', async () => {
    const { http, calls } = client([json({ message: 'a' }, 500), json({ message: 'b' }, 500), json({ message: 'c' }, 500)]);
    await expect(http.get('/x')).rejects.toMatchObject({ status: 500, message: 'c' });
    expect(calls).toHaveLength(3);
  });

  it('never retries a POST unless the caller opts in', async () => {
    const plain = client([json({}, 500), json({ ok: 1 })]);
    await expect(plain.http.post('/x', {})).rejects.toMatchObject({ status: 500 });
    expect(plain.calls).toHaveLength(1);

    const opted = client([json({}, 500), json({ ok: 1 })]);
    await expect(opted.http.post('/x', {}, { retry: true })).resolves.toEqual({ ok: 1 });
  });

  it('retries a dropped connection and reports a network error when it keeps failing', async () => {
    const down = client([new Error('offline'), new Error('offline'), new Error('offline')]);
    await expect(down.http.get('/x')).rejects.toMatchObject({ kind: 'network' });
    expect(down.calls).toHaveLength(3);
  });

  it('turns malformed JSON into a parse error', async () => {
    const { http } = client([new Response('<html>oops</html>', { status: 200 })]);
    await expect(http.get('/x')).rejects.toMatchObject({ kind: 'parse' });
  });

  it('survives a non-JSON error body', async () => {
    const { http } = client([new Response('Bad gateway', { status: 400 })]);
    await expect(http.get('/x')).rejects.toMatchObject({ kind: 'http', message: 'HTTP error 400' });
  });

  it('times out a hung request through AbortController', async () => {
    jest.useFakeTimers();
    try {
      const hang = (init: RequestInit) =>
        new Promise<Response>((_, reject) => init.signal?.addEventListener('abort', () => reject(new Error('aborted'))));
      const { http } = client([hang, hang, hang], { timeoutMs: 1000 });
      const pending = http.post('/x', {}, { timeoutMs: 1000 }).catch((e) => e);
      await jest.advanceTimersByTimeAsync(1001);
      expect(await pending).toMatchObject({ kind: 'timeout' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('reports a caller abort as aborted, not as a network failure', async () => {
    const controller = new AbortController();
    const hang = (init: RequestInit) =>
      new Promise<Response>((_, reject) => init.signal?.addEventListener('abort', () => reject(new Error('aborted'))));
    const { http } = client([hang]);
    const pending = http.get('/x', { signal: controller.signal }).catch((e) => e);
    controller.abort();
    expect(await pending).toMatchObject({ kind: 'aborted' });
  });
});

describe('http client: validation (lenient parsing)', () => {
  const schema = z.object({ id: z.string(), role: z.string().nullish() });

  it('ignores unknown fields and accepts null for optional ones', async () => {
    const { http } = client([json({ id: 'u1', role: null, somethingNew: { nested: true } })]);
    await expect(http.get('/x', { schema })).resolves.toEqual({ id: 'u1', role: null });
  });

  it('rejects a response that lacks a required field with a validation error', async () => {
    const { http } = client([json({ name: 'no id' })]);
    await expect(http.get('/x', { schema })).rejects.toMatchObject({ kind: 'validation' });
  });
});

describe('http client: token refresh', () => {
  it('shares one refresh between concurrent 401s and replays every request with the new token', async () => {
    let token = 'old';
    let refreshes = 0;
    const seen: string[] = [];
    const impl = jest.fn(async (url: RequestInfo | URL, init: RequestInit = {}) => {
      const auth = (init.headers as Record<string, string>).Authorization ?? '';
      seen.push(`${String(url).split('/').pop()}:${auth}`);
      return auth === 'Bearer fresh' ? json({ ok: true }) : json({}, 401);
    }) as unknown as typeof fetch;

    const http = createHttpClient({
      baseUrl: 'https://api.example.test',
      fetchImpl: impl,
      getToken: () => token,
      refreshToken: async () => {
        refreshes += 1;
        await Promise.resolve();
        token = 'fresh';
        return token;
      },
      sleep: async () => undefined,
    });

    const results = await Promise.all([http.get('/a'), http.get('/b'), http.get('/c')]);
    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshes).toBe(1);
    expect(seen.filter((s) => s.endsWith('Bearer fresh'))).toHaveLength(3);
  });

  it('reuses a token that another request already renewed, without refreshing again', async () => {
    let token = 'old';
    const refreshToken = jest.fn(async () => 'never');
    const impl = jest.fn(async (_url: RequestInfo | URL, init: RequestInit = {}) => {
      const auth = (init.headers as Record<string, string>).Authorization;
      if (auth === 'Bearer old') {
        token = 'fresh'; // the renewal lands while this request is in flight
        return json({}, 401);
      }
      return json({ ok: true });
    }) as unknown as typeof fetch;
    const http = createHttpClient({ baseUrl: 'https://api.example.test', fetchImpl: impl, getToken: () => token, refreshToken });
    await expect(http.get('/a')).resolves.toEqual({ ok: true });
    expect(refreshToken).not.toHaveBeenCalled();
  });

  it('signs out once and fails with unauthorized when the refresh yields nothing', async () => {
    const onUnauthorized = jest.fn();
    const { http } = client([json({}, 401)], { refreshToken: async () => null, onUnauthorized });
    await expect(http.get('/a')).rejects.toMatchObject({ kind: 'unauthorized', status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('reports the end of the session once when several requests fail together', async () => {
    const onUnauthorized = jest.fn();
    const { http } = client([json({}, 401), json({}, 401), json({}, 401)], { onUnauthorized });
    const results = await Promise.allSettled([http.get('/a'), http.get('/b'), http.get('/c')]);
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('signs out when there is no refresh endpoint at all', async () => {
    const onUnauthorized = jest.fn();
    const { http } = client([json({}, 401)], { onUnauthorized });
    await expect(http.get('/a')).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not sign out on a 401 from a public call such as a wrong password', async () => {
    const onUnauthorized = jest.fn();
    const { http } = client([json({ message: 'Invalid credentials' }, 401)], { onUnauthorized });
    await expect(http.post('/auth/login/jwt', {}, { auth: false })).rejects.toMatchObject({
      kind: 'http',
      status: 401,
      message: 'Invalid credentials',
    });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('retries only once after a refresh: a second 401 ends the session', async () => {
    const onUnauthorized = jest.fn();
    const { http, calls } = client([json({}, 401), json({}, 401)], { refreshToken: async () => 'fresh', onUnauthorized });
    await expect(http.get('/a')).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(calls).toHaveLength(2);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});

describe('errors and retry helpers', () => {
  it('classifies transient errors', () => {
    expect(new ApiError({ kind: 'network', message: '' }).isTransient).toBe(true);
    expect(new ApiError({ kind: 'http', status: 429, message: '' }).isTransient).toBe(true);
    expect(new ApiError({ kind: 'http', status: 404, message: '' }).isTransient).toBe(false);
    expect(new ApiError({ kind: 'http', status: 404, message: '' }).isNotFound).toBe(true);
  });

  it('toResult returns a typed result and rethrows programmer errors', async () => {
    await expect(toResult(Promise.resolve(1))).resolves.toEqual({ ok: true, data: 1 });
    const failed = await toResult(Promise.reject(new ApiError({ kind: 'http', status: 409, message: 'dup' })));
    expect(failed).toMatchObject({ ok: false, error: { isConflict: true } });
    await expect(toResult(Promise.reject(new TypeError('bug')))).rejects.toThrow('bug');
  });

  it('messageFromBody handles strings, lists and junk', () => {
    expect(messageFromBody({ message: 'nope' }, 'fb')).toEqual({ message: 'nope', code: undefined });
    expect(messageFromBody(null, 'fb')).toEqual({ message: 'fb' });
    expect(messageFromBody({ error: 'Bad Request' }, 'fb').message).toBe('Bad Request');
  });

  it('backoff is jittered and capped', () => {
    expect(backoffDelay(0, defaultRetryPolicy, () => 0)).toBe(0);
    expect(backoffDelay(10, defaultRetryPolicy, () => 0.999)).toBeLessThan(defaultRetryPolicy.maxDelayMs);
  });
});

describe('idempotency keys', () => {
  it('sends the key as a header and retries a keyed create with the same key', async () => {
    const { http, calls } = client([json({}, 503), json({ id: 1 })]);
    await expect(http.post('/safe-zone', { name: 'x' }, { idempotencyKey: 'key-1' })).resolves.toEqual({ id: 1 });
    expect(calls).toHaveLength(2);
    for (const call of calls) expect((call.init.headers as Record<string, string>)['Idempotency-Key']).toBe('key-1');
  });

  it('omits the header and does not retry a create without a key', async () => {
    const { http, calls } = client([json({}, 503), json({ id: 1 })]);
    await expect(http.post('/safe-zone', {})).rejects.toMatchObject({ status: 503 });
    expect((calls[0]?.init.headers as Record<string, string>)['Idempotency-Key']).toBeUndefined();
    expect(calls).toHaveLength(1);
  });
});

describe('newIdempotencyKey', () => {
  it('is on by default and yields a UUID', () => {
     
    const { newIdempotencyKey } = require('../idempotency');
    expect(newIdempotencyKey()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});
