import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { persistOptions } from '@/shared/storage';
import { resetSession } from '@/shared/session';
import { userSchema, type Session, type User } from './user';
import { logger } from '@/shared/logger';
import { clearAccessToken, readAccessToken, writeAccessToken } from '@/shared/storage';

const persistedSchema = z.object({
  user: userSchema.nullable(),
  isAuthenticated: z.boolean(),
});
type Persisted = z.infer<typeof persistedSchema>;

interface AuthStore extends Persisted {
  accessToken: string | null;
  hydrated: boolean;
  signIn: (session: Session) => Promise<void>;
  signOut: () => void;
  /** Stores a refreshed token in secure storage and in memory. */
  setToken: (token: string) => Promise<void>;
  patchUser: (changes: Partial<User>) => void;
}

const defaults: Persisted = { user: null, isAuthenticated: false };

/**
 * Builds before 2026 kept the access token inside this store's AsyncStorage entry. When that old entry is
 * migrated, the token moves to secure storage so the user stays signed in. `hydrateAuth` waits for the move.
 */
let legacyTokenMove: Promise<void> = Promise.resolve();
function moveLegacyToken(state: unknown): unknown {
  const token = (state as { accessToken?: unknown } | null)?.accessToken;
  if (typeof token === 'string' && token.length > 0) {
    legacyTokenMove = readAccessToken().then(async (existing) => {
      if (!existing) await writeAccessToken(token);
    }).catch((error) => logger.warn('could not move the legacy token to secure storage', error));
  }
  return state;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...defaults,
      accessToken: null,
      hydrated: false,
      signIn: async ({ user, token }) => {
        await writeAccessToken(token);
        set({ user, accessToken: token, isAuthenticated: true });
      },
      setToken: async (token) => {
        await writeAccessToken(token);
        set({ accessToken: token });
      },
      signOut: () => {
        void clearAccessToken();
        set({ ...defaults, accessToken: null });
        resetSession();
      },
      patchUser: (changes) => set((s) => (s.user ? { user: { ...s.user, ...changes } } : s)),
    }),
    persistOptions<AuthStore, Persisted>({
      name: 'auth',
      version: 2,
      schema: persistedSchema,
      defaults,
      // v0/v1 also stored the access token in AsyncStorage; it now lives in secure storage only.
      migrations: { 0: moveLegacyToken, 1: moveLegacyToken },
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }),
  ),
);

/** Loads the token from secure storage once persisted state has been restored. */
export async function hydrateAuth(): Promise<void> {
  if (!useAuthStore.persist.hasHydrated()) await useAuthStore.persist.rehydrate();
  await legacyTokenMove;
  const token = await readAccessToken();
  const { isAuthenticated } = useAuthStore.getState();
  useAuthStore.setState({
    accessToken: token,
    isAuthenticated: isAuthenticated && token !== null,
    hydrated: true,
  });
}
