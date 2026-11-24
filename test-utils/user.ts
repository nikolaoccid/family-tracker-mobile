import type { User } from '@/features/auth';

/** A complete app-side user for tests; override only what the test is about. */
export const makeUser = (over: Partial<User> = {}): User => ({
  id: 'u1',
  name: 'Test User',
  email: 'user@example.com',
  avatar: undefined,
  phone: undefined,
  isPremium: false,
  createdAt: '',
  expoPushToken: undefined,
  hasNotificationsEnabled: undefined,
  hasLocationEnabled: undefined,
  ...over,
});
