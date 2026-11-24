import { http } from '@/shared/api';
import { refreshedTokenSchema, sessionSchema, userSchema, type User } from '../model/user';

export const authApi = {
  login: (email: string, password: string) =>
    http.post('/auth/login/jwt', { email, password }, { auth: false, schema: sessionSchema }),

  register: (name: string, email: string, password: string) =>
    http.post('/users', { name, email, password }, { auth: false, schema: sessionSchema }),

  /** Trades the current (still valid) token for a new 30-day one. */
  refresh: () => http.post('/auth/refresh', undefined, { schema: refreshedTokenSchema, refresh: false }),

  /** The server verifies the Google ID token itself; first use creates the account. */
  loginWithGoogle: (idToken: string) => http.post('/auth/google', { idToken }, { auth: false, schema: sessionSchema }),

  requestPasswordReset: (email: string) => http.post('/users/reset-password', { email }, { auth: false }),

  completePasswordReset: (token: string, newPassword: string) =>
    http.post('/users/complete-reset', { token, newPassword }, { auth: false }),

  updateProfile: (changes: Partial<User>) => http.put('/users/profile', changes, { schema: userSchema.partial() }),

  registerPushToken: (token: string) => http.post('/notifications/register', { token }),
};
