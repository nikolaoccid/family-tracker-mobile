import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, type PersistOptions } from 'zustand/middleware';
import type { ZodType } from 'zod';
import { logger } from '../logger';

/** Maps state written by schema version N to version N + 1. Keyed by N. */
export type Migrations = Record<number, (state: unknown) => unknown>;

export function migratePersisted(state: unknown, fromVersion: number, toVersion: number, migrations: Migrations): unknown {
  let current = state;
  for (let v = fromVersion; v < toVersion; v++) {
    const step = migrations[v];
    if (!step) throw new Error(`Missing persisted-state migration from v${v}`);
    current = step(current);
  }
  return current;
}

interface PersistConfig<S, P> {
  name: string;
  version: number;
  schema: ZodType<P>;
  defaults: P;
  migrations?: Migrations;
  partialize: (state: S) => P;
}

/**
 * Zustand persist options with a schema version, a migration table and a zod
 * schema. Data that fails to migrate or parse falls back to defaults and is
 * reported; it never crashes the app.
 */
export function persistOptions<S, P extends object>(config: PersistConfig<S, P>): PersistOptions<S, P> {
  const { name, version, schema, defaults, migrations = {}, partialize } = config;
  return {
    name: `family-tracker-${name}`,
    version,
    storage: createJSONStorage(() => AsyncStorage),
    partialize,
    migrate: (persisted, from) => {
      try {
        const migrated = migratePersisted(persisted, from, version, migrations);
        const parsed = schema.safeParse(migrated);
        if (parsed.success) return parsed.data;
        logger.warn(`persisted ${name} state is invalid, using defaults`, parsed.error.issues);
      } catch (error) {
        logger.warn(`persisted ${name} migration failed, using defaults`, error);
      }
      return defaults;
    },
    merge: (persisted, current) => {
      const parsed = schema.safeParse(persisted);
      if (!parsed.success) {
        if (persisted !== undefined) logger.warn(`persisted ${name} state is invalid, using defaults`);
        return { ...current, ...defaults };
      }
      return { ...current, ...parsed.data };
    },
  };
}
