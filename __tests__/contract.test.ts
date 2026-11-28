/**
 * The API is a permanent contract: released apps keep talking to servers that
 * keep changing. These tests run every feature api module through the real HTTP
 * client against responses shaped like the backend DTOs, plus the awkward
 * variants a server can legitimately produce: nulls, missing optionals, unknown
 * fields, unknown enum values, numerics sent as strings.
 */
import { configureHttp } from '@/shared/api';
import { authApi } from '@/features/auth';
import { familyApi } from '@/features/family';
import { locationApi } from '@/features/location';
import { zonesApi } from '@/features/zones';
import { alertsApi } from '@/features/notifications';
import { privacyApi } from '@/features/settings';
import { subscriptionApi } from '@/features/subscription';
import { chatApi } from '@/features/chat';
import { createFixtures, ids } from '@/fixtures';

type Routes = Record<string, unknown>;

function serve(routes: Routes) {
  const requests: { method: string; path: string; body: unknown }[] = [];
  const fetchImpl = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    const key = `${init.method ?? 'GET'} ${url.pathname}`;
    requests.push({
      method: init.method ?? 'GET',
      path: url.pathname + url.search,
      body: init.body ? JSON.parse(String(init.body)) : undefined,
    });
    if (!(key in routes)) return new Response(JSON.stringify({ message: `unexpected ${key}` }), { status: 404 });
    const payload = routes[key];
    return new Response(payload === undefined ? '' : JSON.stringify(payload), { status: 200 });
  }) as typeof fetch;
  configureHttp({ baseUrl: 'https://api.example.test', fetchImpl, getToken: () => 't', sleep: async () => undefined });
  return requests;
}

const fx = createFixtures(new Date('2026-06-01T12:00:00.000Z'));

describe('wire contract: routes, methods and bodies are unchanged', () => {
  it('auth', async () => {
    const requests = serve({
      'POST /auth/login/jwt': { user: fx.family.members?.[0], token: 'jwt' },
      'POST /users': { user: fx.family.members?.[0], token: 'jwt' },
      'POST /users/reset-password': {},
      'POST /users/complete-reset': {},
      'PUT /users/profile': {},
      'POST /notifications/register': {},
    });
    await authApi.login('a@example.com', 'pw');
    await authApi.register('A', 'a@example.com', 'pw');
    await authApi.requestPasswordReset('a@example.com');
    await authApi.completePasswordReset('tok', 'new');
    await authApi.updateProfile({ name: 'B' });
    await authApi.registerPushToken('ExponentPushToken[x]');
    expect(requests.map((r) => `${r.method} ${r.path}`)).toEqual([
      'POST /auth/login/jwt',
      'POST /users',
      'POST /users/reset-password',
      'POST /users/complete-reset',
      'PUT /users/profile',
      'POST /notifications/register',
    ]);
    expect(requests[0]?.body).toEqual({ email: 'a@example.com', password: 'pw' });
    expect(requests[3]?.body).toEqual({ token: 'tok', newPassword: 'new' });
  });

  it('family, locations, zones, alerts, privacy, subscription, chat', async () => {
    const nil = '00000000-0000-0000-0000-000000000000';
    const requests = serve({
      [`GET /family/${nil}`]: fx.family,
      'POST /family': fx.family,
      [`PUT /family/${ids.family}`]: fx.family,
      [`DELETE /family/${ids.family}`]: {},
      [`POST /family/${ids.family}/members`]: fx.family,
      [`DELETE /family/${ids.family}/members/m1`]: fx.family,
      [`PUT /family/${ids.family}/members/m1/role`]: fx.family,
      [`PUT /family/${ids.family}/location-sharing`]: fx.family,
      'POST /family/verify/': { familyId: 'f', familyName: 'n', inviteeMail: 'e' },
      'POST /family/accept/': {},
      'POST /family/reject/': {},
      [`GET /family/${ids.family}/locations`]: fx.familyLocations,
      [`GET /location/history/${ids.ana}`]: fx.history,
      'POST /location': {},
      'POST /user/battery': {},
      [`GET /family/${ids.family}/safe-zones`]: fx.zones,
      'POST /safe-zone': fx.zones[0],
      [`PUT /safe-zone/${ids.zoneHome}`]: fx.zones[0],
      [`PUT /safe-zone/${ids.zoneHome}/status`]: {},
      [`DELETE /safe-zone/${ids.zoneHome}`]: {},
      [`GET /zone-analytics/${ids.zoneHome}/${ids.iva}`]: fx.analytics(ids.zoneHome),
      [`GET /zone-analytics/user/${ids.iva}/summary`]: [fx.analytics(ids.zoneHome)],
      [`GET /family/${ids.family}/alerts`]: fx.alerts,
      'POST /alert/emergency': {},
      'POST /alert/heading-home': {},
      'DELETE /alert/alert-1': {},
      'GET /privacy-settings': fx.privacy,
      'PUT /privacy-settings': {},
      'GET /subscription/plans': [{ id: 'free', name: 'Free', price: 0, features: ['x'] }],
      'POST /subscription': {},
      'DELETE /subscription': {},
      'POST /payments/create-payment-intent': { clientSecret: 'cs' },
      'GET /chat/token': { token: 'stream' },
    });

    await familyApi.current();
    await familyApi.create('n');
    await familyApi.rename(ids.family, 'n');
    await familyApi.remove(ids.family);
    await familyApi.addMember(ids.family, 'x@example.com');
    await familyApi.removeMember(ids.family, 'm1');
    await familyApi.setRole(ids.family, 'm1', 'admin');
    await familyApi.setSharing(ids.family, false);
    await familyApi.verifyInvite('tok');
    await familyApi.acceptInvite('tok');
    await familyApi.rejectInvite('tok');
    await locationApi.familyLocations(ids.family);
    await locationApi.history(ids.ana, { startDate: '2026-05-01', endDate: '2026-06-01' });
    await locationApi.send({ latitude: 1, longitude: 2, timestamp: 't' });
    await locationApi.updateBattery(50);
    await zonesApi.list(ids.family);
    await zonesApi.create(
      {
        name: 'n',
        color: '#fff',
        radius: 100,
        centerLatitude: 1,
        centerLongitude: 2,
        membersToTrack: [],
        isActive: true,
      },
      ids.family,
    );
    await zonesApi.update(ids.zoneHome, { name: 'x' }, ids.family);
    await zonesApi.setActive(ids.zoneHome, false);
    await zonesApi.remove(ids.zoneHome);
    await zonesApi.analytics(ids.zoneHome, { userId: ids.iva });
    await zonesApi.analyticsSummary({ userId: ids.iva });
    await alertsApi.list(ids.family);
    await alertsApi.create({
      type: 'emergency',
      message: 'm',
      familyId: ids.family,
      userId: ids.ana,
      latitude: 1,
      longitude: 2,
      timestamp: 't',
    });
    await alertsApi.create({
      type: 'heading_home',
      message: 'm',
      familyId: ids.family,
      userId: ids.ana,
      latitude: 1,
      longitude: 2,
      timestamp: 't',
    });
    await alertsApi.remove('alert-1');
    await privacyApi.get();
    await privacyApi.update(await privacyApi.get());
    await subscriptionApi.plans();
    await subscriptionApi.subscribe('premium');
    await subscriptionApi.cancel();
    await subscriptionApi.createPaymentIntent(999, 'usd');
    await chatApi.token();

    const find = (m: string, p: string) => requests.find((r) => r.method === m && r.path.startsWith(p));
    expect(find('POST', '/family/verify/')?.body).toEqual({ inviteToken: 'tok' });
    expect(find('PUT', `/family/${ids.family}/members/m1/role`)?.body).toEqual({ role: 'admin' });
    expect(find('POST', '/safe-zone')?.body).toMatchObject({ familyId: ids.family, centerLatitude: 1 });
    expect(find('GET', `/location/history/${ids.ana}`)?.path).toBe(
      `/location/history/${ids.ana}?startDate=2026-05-01&endDate=2026-06-01&limit=1000`,
    );
    expect(find('POST', '/payments/create-payment-intent')?.body).toEqual({ amount: 999, currency: 'usd' });
  });
});

describe('lenient parsing: awkward but valid server responses', () => {
  it('family: null optionals, unknown role, extra fields, empty body for "no family"', async () => {
    serve({
      'GET /family/00000000-0000-0000-0000-000000000000': {
        id: 'f',
        name: null,
        members: [
          {
            id: 'm',
            name: null,
            email: 'x@example.com',
            role: 'owner',
            isSharing: null,
            batteryLevel: null,
            location: null,
            brandNew: [1, 2],
          },
        ],
        futureField: true,
      },
    });
    const family = await familyApi.current();
    expect(family?.members[0]).toMatchObject({ role: 'member', isSharing: false, name: '' });
    expect(family?.members[0]?.batteryLevel).toBeUndefined();
    expect(family?.members[0]?.location).toBeUndefined();

    serve({ 'GET /family/00000000-0000-0000-0000-000000000000': undefined });
    await expect(familyApi.current()).resolves.toBeNull();
  });

  it('zones: numerics arriving as strings, nulls and missing optionals', async () => {
    serve({
      [`GET /family/${ids.family}/safe-zones`]: [
        {
          id: 'z',
          radius: '250.5',
          centerLatitude: '48.85',
          centerLongitude: 2.29,
          name: null,
          membersToTrack: null,
          isActive: null,
        },
      ],
    });
    const [zone] = await zonesApi.list(ids.family);
    expect(zone).toMatchObject({ radius: 250.5, centerLatitude: 48.85, name: '', membersToTrack: [], isActive: true });
  });

  it('analytics: missing arrays become empty, numerics may be strings', async () => {
    serve({
      [`GET /zone-analytics/${ids.zoneHome}/${ids.ana}`]: {
        zoneId: 'z',
        userId: 'u',
        totalTimeSpent: '95',
        visits: [{ entryTime: 'a', exitTime: null, duration: '5' }],
      },
    });
    const analytics = await zonesApi.analytics(ids.zoneHome, { userId: ids.ana });
    expect(analytics).toMatchObject({ totalTimeSpent: 95, timeByDay: [], visits: [{ exitTime: '', duration: 5 }] });
  });

  it('alerts: unknown type and absent coordinates', async () => {
    serve({
      [`GET /family/${ids.family}/alerts`]: [
        { id: 'a', type: 'sos_v2', latitude: null },
        { id: 'b', type: 'low_battery' },
      ],
    });
    const alerts = await alertsApi.list(ids.family);
    expect(alerts.map((a) => a.type)).toEqual(['unknown', 'low_battery']);
  });

  it('location history and family locations: missing optional fields', async () => {
    serve({
      [`GET /location/history/${ids.ana}`]: [
        { id: 'h', latitude: 1, longitude: 2, timestamp: null, userId: null, accuracy: null },
      ],
      [`GET /family/${ids.family}/locations`]: [{ id: 'l', latitude: null, user: null }],
    });
    const point = (await locationApi.history(ids.ana, {}))[0];
    expect(point?.timestamp).toBe('');
    expect(point?.accuracy).toBeUndefined();
    const row = (await locationApi.familyLocations(ids.family))[0];
    expect(row?.latitude).toBeUndefined();
    expect(row?.user).toBeUndefined();
  });

  it('login: a user with only the required fields', async () => {
    serve({
      'POST /auth/login/jwt': { user: { id: 'u', email: 'a@example.com' }, token: 'jwt', refreshToken: 'ignored' },
    });
    const session = await authApi.login('a@example.com', 'pw');
    expect(session.user).toMatchObject({ name: '', isPremium: false });
    expect(session.user.avatar).toBeUndefined();
  });

  it('a response missing a required field fails as a validation error, not a crash', async () => {
    serve({ 'POST /auth/login/jwt': { user: { id: 'u' }, token: '' } });
    await expect(authApi.login('a@example.com', 'pw')).rejects.toMatchObject({ kind: 'validation' });
  });
});
