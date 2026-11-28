import { decideRoute } from '../model/routeGuard';
import { makeUser } from '@/test-utils/user';

const user = (over: Parameters<typeof makeUser>[0] = {}) => makeUser(over);

describe('decideRoute', () => {
  it('sends signed-out users to sign-in from private screens', () => {
    expect(decideRoute(['(tabs)'], false, null)).toBe('/');
    expect(decideRoute(['family', 'create'], false, null)).toBe('/');
  });

  it('keeps signed-out users on the public screens', () => {
    expect(decideRoute(['(auth)'], false, null)).toBeNull();
    expect(decideRoute(['(auth)', 'register'], false, null)).toBeNull();
    expect(decideRoute(['subscription'], false, null)).toBeNull();
    expect(decideRoute(['permissions', 'location'], false, null)).toBeNull();
  });

  it('never redirects away from reset-password, signed in or not', () => {
    expect(decideRoute(['(auth)', 'reset-password'], false, null)).toBeNull();
    expect(decideRoute(['(auth)', 'reset-password'], true, user())).toBeNull();
  });

  it('walks a freshly signed-in user through the missing permission steps', () => {
    expect(decideRoute(['(auth)'], true, user())).toBe('/permissions/notifications');
    expect(decideRoute(['(auth)'], true, user({ hasNotificationsEnabled: true }))).toBe('/permissions/location');
    expect(decideRoute(['(auth)'], true, user({ hasNotificationsEnabled: true, hasLocationEnabled: true }))).toBe(
      '/(tabs)',
    );
    expect(decideRoute(['(auth)'], true, user({ hasLocationEnabled: true }))).toBe('/(tabs)');
  });

  it('leaves a signed-in user alone inside the app', () => {
    expect(decideRoute(['(tabs)'], true, user())).toBeNull();
    expect(decideRoute([], true, user())).toBeNull();
  });
});
