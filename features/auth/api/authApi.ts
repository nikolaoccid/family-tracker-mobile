import { http } from '@/shared/api';
import { sessionSchema, userSchema, type User } from '../model/user';

export const authApi = {
  login: (email: string, password: string) =>
    http.post('/auth/login/jwt', { email, password }, { auth: false, schema: sessionSchema }),

  register: (name: string, email: string, password: string) =>
    http.post('/users', { name, email, password }, { auth: false, schema: sessionSchema }),

  requestPasswordReset: (email: string) => http.post('/users/reset-password', { email }, { auth: false }),

  completePasswordReset: (token: string, newPassword: string) =>
    http.post('/users/complete-reset', { token, newPassword }, { auth: false }),

  updateProfile: (changes: Partial<User>) => http.put('/users/profile', changes, { schema: userSchema.partial() }),

  registerPushToken: (token: string) => http.post('/user/push-token', { token }),
};
