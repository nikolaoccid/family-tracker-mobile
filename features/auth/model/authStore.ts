import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { persistOptions } from '@/shared/storage';
import { resetSession } from '@/shared/session';
import { userSchema, type Session, type User } from './user';
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
  patchUser: (changes: Partial<User>) => void;
}

const defaults: Persisted = { user: null, isAuthenticated: false };

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
      migrations: { 0: (state) => state, 1: (state) => state },
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }),
  ),
);

/** Loads the token from secure storage once persisted state has been restored. */
export async function hydrateAuth(): Promise<void> {
  const token = await readAccessToken();
  const { isAuthenticated } = useAuthStore.getState();
  useAuthStore.setState({
    accessToken: token,
    isAuthenticated: isAuthenticated && token !== null,
    hydrated: true,
  });
}
