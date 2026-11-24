import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import type { Query } from '@tanstack/react-query';
import { z } from 'zod';
import { logger } from '../logger';

/** Bump when a cached shape changes: older snapshots are then discarded, never read. */
export const CACHE_SCHEMA_VERSION = 1;
export const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'family-tracker-query-cache';
const MAX_QUERIES = 40;
const MAX_BYTES = 500_000;

/** Server data that is useful offline. Positions, history and analytics are neither small nor worth keeping. */
const PERSISTED_ROOTS = new Set(['family', 'zones', 'alerts', 'settings', 'subscription']);
const NEVER_PERSISTED = new Set(['analytics', 'summary', 'invite']);

export function shouldPersistQuery(query: Pick<Query, 'queryKey' | 'state'>): boolean {
  const [root, second] = query.queryKey as readonly unknown[];
  return (
    query.state.status === 'success' &&
    typeof root === 'string' &&
    PERSISTED_ROOTS.has(root) &&
    !(typeof second === 'string' && NEVER_PERSISTED.has(second))
  );
}

const snapshotSchema = z.object({
  timestamp: z.number(),
  buster: z.string(),
  clientState: z.object({
    mutations: z.array(z.unknown()),
    queries: z.array(
      z.object({
        queryKey: z.array(z.unknown()),
        queryHash: z.string(),
        state: z.object({ data: z.unknown(), dataUpdatedAt: z.number() }).loose(),
      }).loose(),
    ),
  }),
});

/** Newest queries first, at most `maxQueries`, and a snapshot that serialises under `maxBytes` (else null). */
export function boundSnapshot(client: PersistedClient, maxQueries = MAX_QUERIES, maxBytes = MAX_BYTES): PersistedClient | null {
  const queries = [...client.clientState.queries]
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)
    .slice(0, maxQueries);
  const bounded = { ...client, clientState: { mutations: [], queries } };
  return JSON.stringify(bounded).length <= maxBytes ? bounded : null;
}

/** A stored snapshot, or null when it is corrupt, from another schema version, or too old. */
export function parseSnapshot(raw: string | null, now = Date.now()): PersistedClient | null {
  if (!raw) return null;
  try {
    const parsed = snapshotSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    if (parsed.data.buster !== String(CACHE_SCHEMA_VERSION)) return null;
    if (now - parsed.data.timestamp > CACHE_MAX_AGE_MS) return null;
    return parsed.data as unknown as PersistedClient;
  } catch {
    return null;
  }
}

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createQueryPersister(store: KeyValueStore = AsyncStorage): Persister {
  return {
    async persistClient(client) {
      const bounded = boundSnapshot(client);
      if (!bounded) {
        logger.warn('query cache too large to persist, dropping it');
        await store.removeItem(STORAGE_KEY);
        return;
      }
      await store.setItem(STORAGE_KEY, JSON.stringify(bounded));
    },
    async restoreClient() {
      const restored = parseSnapshot(await store.getItem(STORAGE_KEY));
      if (!restored) await store.removeItem(STORAGE_KEY);
      return restored ?? undefined;
    },
    removeClient: () => store.removeItem(STORAGE_KEY),
  };
}
