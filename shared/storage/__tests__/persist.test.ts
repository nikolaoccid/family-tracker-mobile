import { z } from 'zod';
import { migratePersisted, persistOptions } from '../persist';

const schema = z.object({ theme: z.string(), count: z.number() });
type State = z.infer<typeof schema>;
const defaults: State = { theme: 'light', count: 0 };

const options = persistOptions<State, State>({
  name: 'test',
  version: 3,
  schema,
  defaults,
  migrations: {
    1: (s) => ({ ...(s as object), count: 0 }), // v1 -> v2 added `count`
    2: (s) => {
      const { colour, ...rest } = s as { colour?: string };
      return { ...rest, theme: colour ?? 'light' }; // v2 -> v3 renamed colour -> theme
    },
  },
  partialize: (s) => s,
});
const migrate = options.migrate as (persisted: unknown, version: number) => State;
const merge = options.merge as (persisted: unknown, current: State) => State;

describe('persisted state migrations', () => {
  it('runs every step from an old version up to the current one', () => {
    expect(migrate({ colour: 'dark' }, 1)).toEqual({ theme: 'dark', count: 0 });
  });

  it('a fixture from each previous schema version parses into the current shape', () => {
    const fixtures: Record<number, unknown> = {
      1: { colour: 'dark' },
      2: { colour: 'blue', count: 4 },
      3: { theme: 'green', count: 9 },
    };
    expect(migrate(fixtures[1], 1)).toEqual({ theme: 'dark', count: 0 });
    expect(migrate(fixtures[2], 2)).toEqual({ theme: 'blue', count: 4 });
    expect(migrate(fixtures[3], 3)).toEqual({ theme: 'green', count: 9 });
  });

  it('falls back to defaults when a migration step is missing', () => {
    expect(migrate({ anything: true }, 0)).toEqual(defaults);
  });

  it('falls back to defaults when migrated data is invalid', () => {
    expect(migrate({ colour: 42 }, 2)).toEqual(defaults);
  });

  it('migratePersisted throws on a gap so the caller can fall back', () => {
    expect(() => migratePersisted({}, 0, 2, {})).toThrow(/Missing persisted-state migration from v0/);
  });

  it('merge keeps current state and drops unknown or corrupt persisted fields', () => {
    expect(merge({ theme: 'dark', count: 2, junk: 1 }, { theme: 'x', count: 1 })).toEqual({ theme: 'dark', count: 2 });
    expect(merge({ theme: 7 }, { theme: 'x', count: 1 })).toEqual(defaults);
    expect(merge(undefined, { theme: 'x', count: 1 })).toEqual(defaults);
  });
});
