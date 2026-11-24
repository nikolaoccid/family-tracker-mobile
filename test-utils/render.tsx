import React from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureHttp } from '@/shared/api';
import { createDemoFetch } from '@/demo/demoFetch';
import { useAuthStore } from '@/features/auth';
import { demoUser, DEMO_TOKEN } from '@/fixtures';
import { makeUser } from './user';

export type FetchMode = 'data' | 'loading' | 'error';

/** Backend stand-ins for the three states every screen must handle. */
export function fetchFor(mode: FetchMode): typeof fetch {
  if (mode === 'loading') {
    // Never answers, but gives up when the client aborts, like a real socket would.
    return ((_url: unknown, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))))) as typeof fetch;
  }
  if (mode === 'error') return (async () => new Response(JSON.stringify({ message: 'Server exploded' }), { status: 500 })) as typeof fetch;
  return createDemoFetch(() => new Date(), 0);
}

export async function signInDemoUser(overrides: Record<string, unknown> = {}) {
  await useAuthStore.getState().signIn({
    user: makeUser({ id: demoUser.id, name: demoUser.name ?? '', email: demoUser.email, isPremium: true, ...overrides }),
    token: DEMO_TOKEN,
  });
}

export function renderScreen(ui: React.ReactElement, mode: FetchMode = 'data') {
  configureHttp({
    baseUrl: 'https://api.example.test',
    fetchImpl: fetchFor(mode),
    getToken: () => DEMO_TOKEN,
    retryPolicy: { maxAttempts: 1, baseDelayMs: 0, maxDelayMs: 0 },
    sleep: async () => undefined,
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const utils = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  return { ...utils, client };
}
