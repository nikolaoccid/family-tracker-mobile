import { DEMO_TOKEN, chatToken, createFixtures, demoUser, ids, paymentIntent, plans, users } from '@/fixtures';

type Json = Record<string, unknown> | unknown[] | null;
type Row = Record<string, unknown>;
type Member = Row & { id: unknown };
type Family = Row & { members: Member[] };
type Handler = (ctx: { params: string[]; body: Row; query: URLSearchParams }) => { status?: number; body: Json };

/**
 * In-memory stand-in for the API. It is the only thing demo mode swaps: the
 * HTTP client still builds real requests, validates real-shaped responses and
 * exercises its error handling. Bodies come from `fixtures/`.
 *
 * Only `bootstrap/api.ts` loads this file, behind EXPO_PUBLIC_DEMO_MODE, so
 * production bundles do not contain it.
 */
export function createDemoFetch(clock: () => Date = () => new Date(), latencyMs = 120): typeof fetch {
  const fx = createFixtures(clock());
  const state = {
    family: fx.family as Family | null,
    zones: [...fx.zones] as Row[],
    alerts: [...fx.alerts] as Row[],
    privacy: { ...fx.privacy } as Row,
    user: { ...demoUser } as Row,
  };
  const ok = (body: Json): ReturnType<Handler> => ({ body });
  const withFamily = (change: (f: Family) => void): ReturnType<Handler> => {
    if (state.family) change(state.family);
    return ok(state.family);
  };

  const routes: [string, RegExp, Handler][] = [
    ['POST', /^\/auth\/login\/jwt$/, () => ok({ user: state.user, token: DEMO_TOKEN })],
    [
      'POST',
      /^\/users$/,
      ({ body }) =>
        ok({
          user: { ...state.user, name: body.name ?? state.user.name, email: body.email ?? state.user.email },
          token: DEMO_TOKEN,
        }),
    ],
    ['POST', /^\/users\/(reset-password|complete-reset)$/, () => ok({})],
    ['DELETE', /^\/users\/me$/, () => ok(null)],
    ['PUT', /^\/users\/profile$/, ({ body }) => ok((state.user = { ...state.user, ...body }))],
    ['POST', /^\/(user\/push-token|user\/battery|location)$/, () => ok({})],

    ['GET', /^\/family\/([^/]+)$/, () => ok(state.family)],
    [
      'POST',
      /^\/family$/,
      ({ body }) => ok((state.family = { ...fx.family, members: fx.family.members ?? [], name: body.name })),
    ],
    ['PUT', /^\/family\/([^/]+)$/, ({ body }) => withFamily((f) => (f.name = body.name ?? f.name))],
    ['DELETE', /^\/family\/([^/]+)$/, () => ok((state.family = null))],
    [
      'POST',
      /^\/family\/([^/]+)\/members$/,
      ({ body }) =>
        withFamily((f) =>
          f.members.push({
            id: `invited-${f.members.length}`,
            name: body.email,
            email: body.email,
            role: 'member',
            isSharing: false,
            isInvited: true,
          }),
        ),
    ],
    [
      'DELETE',
      /^\/family\/([^/]+)\/members\/([^/]+)$/,
      ({ params }) => withFamily((f) => (f.members = f.members.filter((m) => m.id !== params[1]))),
    ],
    [
      'PUT',
      /^\/family\/([^/]+)\/members\/([^/]+)\/role$/,
      ({ params, body }) => withFamily((f) => f.members.forEach((m) => m.id === params[1] && (m.role = body.role))),
    ],
    [
      'PUT',
      /^\/family\/([^/]+)\/location-sharing$/,
      ({ body }) => withFamily((f) => f.members.forEach((m) => m.id === ids.ana && (m.isSharing = body.isSharing))),
    ],
    [
      'POST',
      /^\/family\/verify\/?$/,
      () =>
        ok({
          familyId: ids.family,
          familyName: 'The Examples',
          inviteeMail: users.tomas.email,
          expiresAt: clock().toISOString(),
        }),
    ],
    ['POST', /^\/family\/(accept|reject)\/?$/, () => ok({})],
    ['GET', /^\/family\/([^/]+)\/locations$/, () => ok(fx.familyLocations)],
    ['GET', /^\/family\/([^/]+)\/safe-zones$/, () => ok(state.zones)],
    ['GET', /^\/family\/([^/]+)\/alerts$/, () => ok(state.alerts)],

    [
      'POST',
      /^\/safe-zone$/,
      ({ body }) => {
        const zone = { ...body, id: `zone-${state.zones.length + 1}`, createdAt: clock().toISOString() };
        state.zones.push(zone);
        return ok(zone);
      },
    ],
    [
      'PUT',
      /^\/safe-zone\/([^/]+)(\/status)?$/,
      ({ params, body }) => {
        const zone = state.zones.find((z) => z.id === params[0]);
        return zone ? ok(Object.assign(zone, body)) : { status: 404, body: { message: 'Safe zone not found' } };
      },
    ],
    [
      'DELETE',
      /^\/safe-zone\/([^/]+)$/,
      ({ params }) => {
        state.zones = state.zones.filter((z) => z.id !== params[0]);
        return ok({});
      },
    ],
    [
      'GET',
      /^\/zone-analytics\/user\/([^/]+)\/summary$/,
      ({ params }) =>
        ok(state.zones.filter((z) => z.isActive).map((z) => fx.analytics(String(z.id), params[0] as string))),
    ],
    [
      'GET',
      /^\/zone-analytics\/([^/]+)\/([^/]+)$/,
      ({ params }) => ok(fx.analytics(params[0] as string, params[1] as string)),
    ],
    ['GET', /^\/location\/history\/([^/]+)$/, () => ok(fx.history)],

    [
      'POST',
      /^\/alert\/(emergency|heading-home)$/,
      ({ body }) => {
        const alert = {
          id: `alert-${state.alerts.length + 1}`,
          timestamp: clock().toISOString(),
          ...body,
          type: body.type,
        };
        state.alerts.unshift(alert);
        return ok(alert);
      },
    ],
    [
      'DELETE',
      /^\/alert\/([^/]+)$/,
      ({ params }) => {
        state.alerts = state.alerts.filter((a) => a.id !== params[0]);
        return ok({});
      },
    ],

    ['GET', /^\/privacy-settings$/, () => ok(state.privacy)],
    ['PUT', /^\/privacy-settings$/, ({ body }) => ok((state.privacy = { ...state.privacy, ...body }))],

    ['GET', /^\/subscription\/plans$/, () => ok(plans)],
    [
      'POST',
      /^\/subscription$/,
      ({ body }) => {
        state.user.isPremium = body.planId === 'premium';
        return ok({ plan: body.planId });
      },
    ],
    [
      'DELETE',
      /^\/subscription$/,
      () => {
        state.user.isPremium = false;
        return ok({});
      },
    ],
    ['POST', /^\/payments\/create-payment-intent$/, () => ok(paymentIntent)],
    ['GET', /^\/chat\/token$/, () => ok(chatToken)],
  ];

  return async (input, init) => {
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      'http://demo.invalid',
    );
    const method = (init?.method ?? 'GET').toUpperCase();
    const body = typeof init?.body === 'string' && init.body ? JSON.parse(init.body) : {};
    await new Promise((resolve) => setTimeout(resolve, latencyMs));

    for (const [routeMethod, pattern, handler] of routes) {
      const match = routeMethod === method ? pattern.exec(url.pathname) : null;
      if (!match) continue;
      const { status = 200, body: payload } = handler({ params: match.slice(1), body, query: url.searchParams });
      return new Response(payload === null ? '' : JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ message: `No demo route for ${method} ${url.pathname}` }), { status: 404 });
  };
}

export const demoFetch = createDemoFetch();
