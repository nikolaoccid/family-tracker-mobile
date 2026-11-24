import { useCallback, useState } from 'react';
import { errorMessage } from '@/shared/api';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../model/authStore';

type Credentials = { email: string; password: string };

/**
 * Sign-in, registration and password-reset calls for the auth screens, with one
 * shared loading flag and error message. Expected failures (wrong password,
 * duplicate email) end up in `error`; nothing here throws.
 */
export function useAuthFlow() {
  const signIn = useAuthStore((s) => s.signIn);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (call: () => Promise<void>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await call();
      return true;
    } catch (e) {
      setError(errorMessage(e, 'An error occurred'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError: useCallback(() => setError(null), []),
    login: ({ email, password }: Credentials) => run(async () => signIn(await authApi.login(email, password))),
    register: (name: string, email: string, password: string) =>
      run(async () => signIn(await authApi.register(name, email, password))),
    // Google sign-in creates the account on first use, with the same endpoint as registration.
    loginWithGoogle: (name: string, email: string, password: string) =>
      run(async () => signIn(await authApi.register(name, email, password))),
    requestPasswordReset: (email: string) => run(async () => void (await authApi.requestPasswordReset(email))),
    completePasswordReset: (token: string, newPassword: string) =>
      run(async () => void (await authApi.completePasswordReset(token, newPassword))),
  };
}
