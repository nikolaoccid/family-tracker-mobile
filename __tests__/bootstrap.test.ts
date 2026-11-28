import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { startApp } from '@/bootstrap/api';
import { hydrateAuth, useAuthStore } from '@/features/auth';
import { http } from '@/shared/api';
import {
  handleLocationUpdate,
  startLocationTracking,
  stopLocationTracking,
  isLocationTrackingActive,
  useLocationStore,
  LOCATION_TASK,
} from '@/features/location';
import { requestLocationGrant } from '@/features/permissions/model/locationGrant';
import { onSessionReset } from '@/shared/session';
import { makeUser } from '@/test-utils/user';

const session = { user: makeUser({ id: 'u1', name: 'Ana', email: 'ana@example.com' }), token: 'tok-1' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const defineTask = TaskManager.defineTask as jest.Mock;

let fetchMock: jest.Mock;

beforeAll(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  startApp();
});

beforeEach(async () => {
  fetchMock.mockReset();
  await useAuthStore.getState().signIn(session);
});

describe('startApp', () => {
  it('registers the background location task at startup, exactly once, even if called again', () => {
    startApp();
    const registrations = defineTask.mock.calls.filter(([name]) => name === LOCATION_TASK);
    expect(registrations).toHaveLength(1);
    expect(typeof registrations[0]?.[1]).toBe('function');
  });

  it('stores the access token in secure storage, not in persisted state', async () => {
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(expect.stringContaining('access-token'), 'tok-1');
    const persisted = JSON.stringify(useAuthStore.persist.getOptions().partialize?.(useAuthStore.getState()));
    expect(persisted).not.toContain('tok-1');
  });

  it('simulated concurrent 401s sign the user out exactly once and clear the token', async () => {
    const signOutSpy = jest.fn();
    const unsubscribe = onSessionReset(signOutSpy);
    fetchMock.mockImplementation(async () => json({ message: 'Unauthorized' }, 401));

    const results = await Promise.allSettled([
      http.get('/family/x'),
      http.get('/privacy-settings'),
      http.get('/subscription'),
    ]);

    expect(results.map((r) => r.status)).toEqual(['rejected', 'rejected', 'rejected']);
    expect(signOutSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, accessToken: null, user: null });
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    unsubscribe();
  });

  it('a 401 refreshes the token once, retries every request with it, and keeps the session', async () => {
    const seen: string[] = [];
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      const auth = (init.headers as Record<string, string>).Authorization;
      seen.push(`${new URL(url).pathname} ${auth}`);
      if (new URL(url).pathname === '/auth/refresh')
        return json({ token: 'tok-2', expiresAt: '2027-01-01T00:00:00.000Z' });
      return auth === 'Bearer tok-2' ? json({ ok: true }) : json({}, 401);
    });

    const results = await Promise.all([
      http.get('/family/x'),
      http.get('/privacy-settings'),
      http.get('/subscription'),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(seen.filter((s) => s.startsWith('/auth/refresh'))).toEqual(['/auth/refresh Bearer tok-1']);
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: true, accessToken: 'tok-2' });
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(expect.stringContaining('access-token'), 'tok-2');
  });

  it('signs out only when the refresh itself is refused', async () => {
    fetchMock.mockImplementation(async () => json({ message: 'Unauthorized' }, 401));
    await expect(http.get('/family/x')).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(fetchMock.mock.calls.filter(([u]) => String(u).endsWith('/auth/refresh'))).toHaveLength(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('sends the stored token on authenticated calls', async () => {
    fetchMock.mockResolvedValue(json({}));
    await http.get('/privacy-settings');
    expect((fetchMock.mock.calls[0]?.[1].headers as Record<string, string>).Authorization).toBe('Bearer tok-1');
  });
});

describe('session hydration', () => {
  it('restores the token from secure storage after a restart', async () => {
    useAuthStore.setState({ accessToken: null });
    await hydrateAuth();
    expect(useAuthStore.getState()).toMatchObject({ accessToken: 'tok-1', hydrated: true, isAuthenticated: true });
  });

  it('treats a persisted sign-in without a stored token as signed out', async () => {
    await (SecureStore.deleteItemAsync as jest.Mock)('family-tracker.access-token');
    useAuthStore.setState({ accessToken: null, isAuthenticated: true });
    await hydrateAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('background location task', () => {
  const fix = { coords: { latitude: 48.85, longitude: 2.29, accuracy: 5, speed: null, heading: null } };

  it('uploads the latest fix and records it locally', async () => {
    fetchMock.mockResolvedValue(json({}));
    await handleLocationUpdate(
      { data: { locations: [fix, { coords: { ...fix.coords, latitude: 1 } }] as never } },
      () => true,
    );
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toMatch(/\/location$/);
    expect(JSON.parse(init.body)).toMatchObject({ latitude: 1, longitude: 2.29 });
    expect(useLocationStore.getState().myLocation?.latitude).toBe(1);
  });

  it('does nothing when signed out, when the task errors, or when there are no fixes', async () => {
    await handleLocationUpdate({ data: { locations: [fix] as never } }, () => false);
    await handleLocationUpdate({ error: { message: 'boom' } }, () => true);
    await handleLocationUpdate({ data: { locations: [] } }, () => true);
    await handleLocationUpdate({}, () => true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('swallows an upload failure instead of crashing the headless task', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    await expect(handleLocationUpdate({ data: { locations: [fix] as never } }, () => true)).resolves.toBeUndefined();
  });

  it('rebuilds the session in a headless start before uploading', async () => {
    useAuthStore.setState({ accessToken: null, isAuthenticated: true, hydrated: false });
    fetchMock.mockResolvedValue(json({}));
    const task = defineTask.mock.calls.find(([name]) => name === LOCATION_TASK)?.[1] as (
      body: unknown,
    ) => Promise<void>;
    await task({ data: { locations: [fix] } });
    expect((fetchMock.mock.calls[0]?.[1].headers as Record<string, string>).Authorization).toBe('Bearer tok-1');
  });
});

describe('start and stop tracking', () => {
  const location = Location as jest.Mocked<typeof Location>;
  const registered = TaskManager.isTaskRegisteredAsync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    registered.mockResolvedValue(false);
  });

  it('starts location updates after both permissions are granted', async () => {
    await expect(startLocationTracking()).resolves.toBe(true);
    expect(location.startLocationUpdatesAsync).toHaveBeenCalledWith(
      LOCATION_TASK,
      expect.objectContaining({ distanceInterval: 50 }),
    );
  });

  it('does not start twice when the task is already registered', async () => {
    registered.mockResolvedValue(true);
    await expect(startLocationTracking()).resolves.toBe(true);
    expect(location.startLocationUpdatesAsync).not.toHaveBeenCalled();
    await expect(isLocationTrackingActive()).resolves.toBe(true);
  });

  it('refuses to start without background permission', async () => {
    location.requestBackgroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' } as never);
    await expect(startLocationTracking()).resolves.toBe(false);
    expect(location.startLocationUpdatesAsync).not.toHaveBeenCalled();
  });

  it('asks for foreground permission first and stops if it is refused', async () => {
    location.getForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' } as never);
    location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' } as never);
    await expect(startLocationTracking()).resolves.toBe(false);
    expect(location.requestBackgroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('reports false instead of throwing when the platform call fails', async () => {
    location.startLocationUpdatesAsync.mockRejectedValueOnce(new Error('native'));
    await expect(startLocationTracking()).resolves.toBe(false);
  });

  it('stops only a registered task', async () => {
    await stopLocationTracking();
    expect(location.stopLocationUpdatesAsync).not.toHaveBeenCalled();
    registered.mockResolvedValue(true);
    await stopLocationTracking();
    expect(location.stopLocationUpdatesAsync).toHaveBeenCalledWith(LOCATION_TASK);
  });
});

describe('location permission flow', () => {
  const api = (fg: string, bg: string) => ({
    requestForeground: jest.fn(async () => ({ status: fg as never })),
    requestBackground: jest.fn(async () => ({ status: bg as never })),
  });

  it.each([
    ['granted', 'granted', false, 'background'],
    ['granted', 'denied', false, 'foreground'],
    ['denied', 'granted', false, 'denied'],
    ['granted', 'granted', true, 'foreground'],
  ])('fg=%s bg=%s web=%s -> %s', async (fg, bg, web, expected) => {
    expect(await requestLocationGrant(api(fg, bg), web)).toBe(expected);
  });

  it('never asks for background permission once foreground is refused, or on web', async () => {
    const refused = api('denied', 'granted');
    await requestLocationGrant(refused, false);
    expect(refused.requestBackground).not.toHaveBeenCalled();
    const web = api('granted', 'granted');
    await requestLocationGrant(web, true);
    expect(web.requestBackground).not.toHaveBeenCalled();
  });
});
