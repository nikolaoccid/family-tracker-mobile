import { QueryClient } from '@tanstack/react-query';
import { dehydrate } from '@tanstack/react-query';
import {
  CACHE_MAX_AGE_MS,
  CACHE_SCHEMA_VERSION,
  boundSnapshot,
  createQueryPersister,
  parseSnapshot,
  shouldPersistQuery,
  type KeyValueStore,
} from '../queryPersistence';

const memoryStore = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: async (k) => data.get(k) ?? null,
    setItem: async (k, v) => void data.set(k, v),
    removeItem: async (k) => void data.delete(k),
  };
};

const snapshot = (queries: { key: unknown[]; at: number; data?: unknown }[], over: object = {}) => ({
  timestamp: Date.now(),
  buster: String(CACHE_SCHEMA_VERSION),
  clientState: {
    mutations: [],
    queries: queries.map((q) => ({
      queryKey: q.key,
      queryHash: JSON.stringify(q.key),
      state: { data: q.data ?? { ok: 1 }, dataUpdatedAt: q.at, status: 'success' },
    })),
  },
  ...over,
});

describe('what is worth persisting', () => {
  const client = new QueryClient();
  const set = (key: unknown[]) => client.setQueryData(key, { x: 1 });

  it('keeps family, zones, alerts, settings and plans; drops positions, history and analytics', () => {
    set(['family', 'current']);
    set(['zones', 'list', 'f']);
    set(['alerts', 'list', 'f']);
    set(['settings', 'privacy']);
    set(['subscription', 'plans']);
    set(['location', 'family', 'f']);
    set(['zones', 'analytics', 'z', {}]);
    set(['zones', 'summary', {}]);
    set(['family', 'invite', 'tok']);
    const persisted = dehydrate(client, { shouldDehydrateQuery: shouldPersistQuery }).queries.map((q) =>
      q.queryKey.join('/'),
    );
    expect(persisted).toEqual([
      'family/current',
      'zones/list/f',
      'alerts/list/f',
      'settings/privacy',
      'subscription/plans',
    ]);
  });

  it('never persists a failed or pending query', () => {
    expect(shouldPersistQuery({ queryKey: ['family', 'current'], state: { status: 'error' } } as never)).toBe(false);
    expect(shouldPersistQuery({ queryKey: ['family', 'current'], state: { status: 'pending' } } as never)).toBe(false);
  });
});

describe('bounds', () => {
  it('keeps the newest queries up to the limit', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ key: ['family', i], at: i }));
    const bounded = boundSnapshot(snapshot(many) as never, 3);
    expect(bounded?.clientState.queries.map((q) => q.queryKey[1])).toEqual([9, 8, 7]);
  });

  it('drops the snapshot entirely when it would exceed the byte budget', () => {
    expect(boundSnapshot(snapshot([{ key: ['family'], at: 1, data: 'x'.repeat(2000) }]) as never, 40, 1000)).toBeNull();
  });
});

describe('restoring', () => {
  it('accepts a fresh snapshot of the current version', () => {
    expect(parseSnapshot(JSON.stringify(snapshot([{ key: ['family'], at: 1 }])))).not.toBeNull();
  });

  it.each([
    ['nothing stored', null],
    ['not JSON', '{oops'],
    ['wrong shape', JSON.stringify({ hello: 'world' })],
    [
      'a queries field of the wrong type',
      JSON.stringify(snapshot([], { clientState: { mutations: [], queries: 'x' } })),
    ],
    ['another schema version', JSON.stringify(snapshot([], { buster: '0' }))],
    ['too old', JSON.stringify(snapshot([], { timestamp: Date.now() - CACHE_MAX_AGE_MS - 1000 }))],
  ])('discards %s', (_name, raw) => {
    expect(parseSnapshot(raw as string | null)).toBeNull();
  });

  it('persister round-trips, removes corrupt data and clears on logout', async () => {
    const store = memoryStore();
    const persister = createQueryPersister(store);
    await persister.persistClient(snapshot([{ key: ['family', 'current'], at: 5 }]) as never);
    expect(await persister.restoreClient()).toMatchObject({ buster: String(CACHE_SCHEMA_VERSION) });

    store.data.set('family-tracker-query-cache', '{corrupt');
    expect(await persister.restoreClient()).toBeUndefined();
    expect(store.data.size).toBe(0); // corrupt data is deleted, not kept

    await persister.persistClient(snapshot([{ key: ['family'], at: 1 }]) as never);
    await persister.removeClient();
    expect(store.data.size).toBe(0);
  });

  it('persister drops an oversized cache instead of writing it', async () => {
    const store = memoryStore();
    const persister = createQueryPersister(store);
    await persister.persistClient(snapshot([{ key: ['family'], at: 1, data: 'x'.repeat(600_000) }]) as never);
    expect(store.data.size).toBe(0);
  });
});
