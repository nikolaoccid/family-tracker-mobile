/**
 * Route names and deep links are public contracts: users have links, QR codes
 * and emails pointing at them. This inventory was captured before the
 * restructure; routes may be added, never renamed or dropped.
 */
import fs from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join(__dirname, '..', 'app');

function routeFiles(dir: string, prefix = ''): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) return routeFiles(path.join(dir, entry.name), rel);
    return /\.tsx?$/.test(entry.name) ? [rel.replace(/\.tsx?$/, '')] : [];
  });
}

// `app/` inventory before the refactor (layouts included), minus two unreachable template leftovers:
// `modal` (Expo starter example) and `error-boundary` (a component misfiled as a route, nothing linked to it).
const ROUTES_BEFORE = [
  '(auth)/_layout',
  '(auth)/forgot-password',
  '(auth)/index',
  '(auth)/register',
  '(auth)/reset-password',
  '(tabs)/_layout',
  '(tabs)/alerts',
  '(tabs)/chat',
  '(tabs)/family',
  '(tabs)/index',
  '(tabs)/settings',
  '+not-found',
  '_layout',
  'chat/private',
  'family/accept-invite',
  'family/add-member',
  'family/create',
  'location/history',
  'oauthredirect',
  'permissions/location',
  'permissions/notifications',
  'profile/edit',
  'profile/view',
  'profile/view/[id]',
  'schedule/_layout',
  'schedule/create',
  'schedule/edit',
  'settings/privacy',
  'subscription',
  'zones/analytics',
  'zones/create',
  'zones/edit',
  'zones/index',
];

describe('route inventory', () => {
  const now = routeFiles(APP_DIR);

  it('keeps every route that existed before the restructure', () => {
    expect(ROUTES_BEFORE.filter((route) => !now.includes(route))).toEqual([]);
  });

  it('adds no route by accident', () => {
    expect(now.filter((route) => !ROUTES_BEFORE.includes(route))).toEqual([]);
  });

  it('keeps route files thin: each is a re-export of a feature screen, or a layout', () => {
    const offenders = now
      .filter((route) => !/(^|\/)_layout$/.test(route) && route !== '+not-found')
      .filter((route) => {
        const source = fs.readFileSync(path.join(APP_DIR, `${route}.tsx`), 'utf8').trim();
        return !/^export \{ \w+ as default \} from '@\/features\/\w+';$/.test(source);
      });
    expect(offenders).toEqual([]);
  });

  it('exposes the deep-link entry for password reset and invites as routes or handlers', () => {
    expect(now).toContain('(auth)/reset-password');
    expect(now).toContain('family/accept-invite');
    expect(fs.readFileSync(path.join(APP_DIR, '_layout.tsx'), 'utf8')).toContain('useInviteDeepLink');
  });
});

describe('deep links and app identity (app.config.ts)', () => {
  const config = require('../app.config').default({ config: {} });

  it('keeps the custom scheme, bundle ids and universal-link host', () => {
    expect(config.scheme).toBe('app.familytracker');
    expect(config.ios.bundleIdentifier).toBe('app.familytracker');
    expect(config.android.package).toBe('app.familytracker');
    expect(config.plugins).toContainEqual(['expo-router', { origin: 'https://familytracker.app/' }]);
    expect(config.extra.router.origin).toBe('https://family-tracker.app/');
  });

  it('keeps both Android intent filters', () => {
    const data = (config.android.intentFilters as { data: unknown }[]).map((f) =>
      (Array.isArray(f.data) ? f.data : [f.data]).flat(),
    );
    expect(data).toEqual([
      [{ scheme: 'https', host: 'familytracker.app', pathPrefix: '/' }],
      [{ scheme: 'app.familytracker', host: 'oauthredirect' }],
    ]);
  });

  it('ships no secret: only public values from the environment', () => {
    const text = JSON.stringify(config);
    expect(text).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
    expect(config.android.googleServicesFile).toBeUndefined();
  });
});

describe('app.config.ts environment handling', () => {
  const load = (env: Record<string, string | undefined>) => {
    const saved = { ...process.env };
    Object.assign(process.env, env);
    for (const [key, value] of Object.entries(env)) if (value === undefined) delete process.env[key];
    try {
      let result: unknown;
      jest.isolateModules(() => {
        result = require('../app.config').default({ config: {} });
      });
      return result as { android: { config: { googleMaps: { apiKey: string } }; googleServicesFile?: string } };
    } finally {
      process.env = saved;
    }
  };

  it('fails with a clear message when the API url is missing', () => {
    expect(() => load({ EXPO_PUBLIC_API_BASE_URL: undefined, EXPO_PUBLIC_DEMO_MODE: undefined })).toThrow(
      /EXPO_PUBLIC_API_BASE_URL is not set/,
    );
  });

  it('starts without any optional variable', () => {
    const config = load({
      EXPO_PUBLIC_API_BASE_URL: 'https://api.example.test',
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: undefined,
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: undefined,
      EXPO_PUBLIC_STREAM_API_KEY: undefined,
      GOOGLE_SERVICES_FILE: undefined,
    });
    expect(config.android.config.googleMaps.apiKey).toBe('');
    expect(config.android.googleServicesFile).toBeUndefined();
  });

  it('demo mode needs no API url', () => {
    expect(() => load({ EXPO_PUBLIC_API_BASE_URL: undefined, EXPO_PUBLIC_DEMO_MODE: '1' })).not.toThrow();
  });

  it('wires the Firebase file only when the build supplies one', () => {
    expect(
      load({ EXPO_PUBLIC_API_BASE_URL: 'x', GOOGLE_SERVICES_FILE: './google-services.json' }).android
        .googleServicesFile,
    ).toBe('./google-services.json');
  });
});
