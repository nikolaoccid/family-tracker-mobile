/**
 * The backend validates with `forbidNonWhitelisted`: one extra key makes a request fail with 400.
 * `request-keys.json` is derived from the backend's OpenAPI document (`node scripts/sync-request-keys.mjs <openapi.json>`).
 * Every request the app can send is captured here and checked against it: the route must exist, every body key must be
 * allowed, every required key present, and every query parameter known.
 */
import keys from './request-keys.json';
import { configureHttp } from '@/shared/api';
import { authApi } from '@/features/auth';
import { familyApi } from '@/features/family';
import { locationApi } from '@/features/location';
import { zonesApi } from '@/features/zones';
import { alertsApi } from '@/features/notifications';
import { privacyApi, privacySettingsSchema } from '@/features/settings';
import { subscriptionApi } from '@/features/subscription';
import { formFromZone, toNewZone } from '@/features/zones/model/zoneForm';
import { buildAlertDraft } from '@/features/map/model/alertDraft';
import { createFixtures, ids } from '@/fixtures';

type RouteKeys = { body: { allowed: string[]; required: string[] } | null; query: string[] };
const table = keys as Record<string, RouteKeys>;
const routes = Object.entries(table).map(([key, value]) => {
  const [method, path] = key.split(' ') as [string, string];
  return { key, method, regex: new RegExp(`^${path.replace(/\{[^}]+\}/g, '[^/]+')}$`), ...value };
});

const sent: { method: string; path: string; query: string[]; body: Record<string, unknown> | undefined }[] = [];

beforeAll(() => {
  const fetchImpl = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    sent.push({
      method: init.method ?? 'GET',
      path: url.pathname.replace(/\/+$/, ''),
      query: [...url.searchParams.keys()],
      body: init.body ? JSON.parse(String(init.body)) : undefined,
    });
    return new Response('{}', { status: 200 });
  }) as typeof fetch;
  configureHttp({ baseUrl: 'https://api.example.test', fetchImpl, getToken: () => 't' });
});

const swallow = (call: Promise<unknown>) => call.catch(() => undefined); // responses are empty; only the request matters

const fx = createFixtures(new Date('2026-06-01T12:00:00.000Z'));
const zone = fx.zones[0] as never as Parameters<typeof formFromZone>[0];
const position = { latitude: 48.85, longitude: 2.29, timestamp: '2026-06-01T12:00:00.000Z', accuracy: 5, speed: 1, heading: 90 };

beforeAll(async () => {
  const privacy = privacySettingsSchema.parse(fx.privacy);
  const draft = toNewZone(formFromZone(zone));
  await Promise.all(
    [
      authApi.login('a@example.com', 'pw'),
      authApi.register('Ana', 'a@example.com', 'pw'),
      authApi.requestPasswordReset('a@example.com'),
      authApi.completePasswordReset('tok', 'newpw'),
      authApi.updateProfile({ name: 'Ana', email: 'a@example.com', phone: '+385', avatar: 'file:///a.png' }),
      authApi.updateProfile({ hasLocationEnabled: true }),
      authApi.updateProfile({ hasNotificationsEnabled: false }),
      authApi.registerPushToken('ExponentPushToken[x]'),
      authApi.refresh(),
      authApi.deleteAccount(),
      authApi.loginWithGoogle('google-id-token'),
      familyApi.current(),
      familyApi.create('The Examples'),
      familyApi.rename(ids.family, 'New'),
      familyApi.remove(ids.family),
      familyApi.addMember(ids.family, 'x@example.com'),
      familyApi.removeMember(ids.family, ids.marko),
      familyApi.setRole(ids.family, ids.marko, 'admin'),
      familyApi.setSharing(ids.family, true),
      familyApi.verifyInvite('tok'),
      familyApi.acceptInvite('tok'),
      familyApi.rejectInvite('tok'),
      locationApi.send(position),
      locationApi.updateBattery(55),
      locationApi.familyLocations(ids.family),
      locationApi.history(ids.ana, { startDate: '2026-05-01', endDate: '2026-06-01' }),
      zonesApi.list(ids.family),
      zonesApi.create(draft, ids.family),
      zonesApi.update(ids.zoneHome, draft, ids.family),
      zonesApi.setActive(ids.zoneHome, false),
      zonesApi.remove(ids.zoneHome),
      zonesApi.analytics(ids.zoneHome, { userId: ids.iva, startDate: '2026-05-01', endDate: '2026-06-01' }),
      zonesApi.analyticsSummary({ userId: ids.iva, startDate: '2026-05-01', endDate: '2026-06-01' }),
      alertsApi.list(ids.family),
      alertsApi.create(buildAlertDraft('emergency', { id: ids.ana, name: 'Ana' }, ids.family, position)),
      alertsApi.create(buildAlertDraft('heading_home', { id: ids.ana, name: 'Ana' }, ids.family, position)),
      alertsApi.remove('alert-1'),
      privacyApi.get(),
      privacyApi.update(privacy),
      subscriptionApi.plans(),
      subscriptionApi.subscribe('premium'),
      subscriptionApi.cancel(),
      subscriptionApi.createPaymentIntent(999, 'usd'),
    ].map(swallow),
  );
});

describe('every request the app sends matches a backend route and its DTO', () => {
  it('captured the whole surface', () => {
    expect(sent.length).toBeGreaterThanOrEqual(40);
  });

  it.each([0])('routes, bodies and query parameters (%#)', () => {
    const problems: string[] = [];
    for (const request of sent) {
      const route = routes.find((r) => r.method === request.method && r.regex.test(request.path));
      const label = `${request.method} ${request.path}`;
      if (!route) {
        problems.push(`${label}: no such route in the backend`);
        continue;
      }
      for (const q of request.query) if (!route.query.includes(q)) problems.push(`${label}: unknown query parameter "${q}"`);
      if (request.body && !route.body) problems.push(`${label}: sends a body, the route takes none`);
      if (route.body) {
        const given = Object.keys(request.body ?? {});
        for (const k of given) if (!route.body.allowed.includes(k)) problems.push(`${label}: extra key "${k}"`);
        for (const k of route.body.required) if (!given.includes(k)) problems.push(`${label}: missing required key "${k}"`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('privacy schedules carry only keys the schedule DTO knows', () => {
    const allowed = table['POST /sharing-schedules']?.body?.allowed ?? [];
    const body = sent.find((r) => r.method === 'PUT' && r.path === '/privacy-settings')?.body as { schedules: object[] };
    for (const schedule of body.schedules) for (const k of Object.keys(schedule)) expect(allowed).toContain(k);
  });
});
