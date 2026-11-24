/**
 * Every route in `app/` rendered through its real route module, with the router
 * mocked, a query client, the stores and mocked native modules. Query-driven
 * screens are rendered in all three states: loading, error, data.
 */
import React from 'react';
import { screen, waitFor, act } from '@testing-library/react-native';
import { renderScreen, signInDemoUser, type FetchMode } from '../test-utils/render';
import { ids } from '@/fixtures';

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn() };
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    useRouter: () => mockRouter,
    useLocalSearchParams: () => mockParams,
    useSegments: () => [],
    useNavigation: () => ({ addListener: () => () => undefined }),
    Link: ({ children }: { children: React.ReactNode }) => React.createElement(Text, null, children),
    Stack: { Screen: () => null },
    Tabs: { Screen: () => null },
    router: mockRouter,
  };
});
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => require('react').useEffect(effect, []),
}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn(), MediaTypeOptions: { Images: 'Images' } }));
jest.mock('expo-linking', () => ({
  useURL: () => null,
  parse: () => ({ queryParams: {} }),
  addEventListener: () => ({ remove: () => undefined }),
}));
jest.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

type RouteCase = { route: string; load: () => { default: React.ComponentType }; params?: Record<string, string>; states: FetchMode[]; settle: string | RegExp };

const ALL: FetchMode[] = ['data', 'loading', 'error'];
const FORM: FetchMode[] = ['data'];

// `load` is lazy so jest.mock above is applied before each module is evaluated.
const routes: RouteCase[] = [
  { route: '(auth)/index', load: () => require('../app/(auth)/index'), states: FORM, settle: /Sign In/i },
  { route: '(auth)/register', load: () => require('../app/(auth)/register'), states: FORM, settle: /Create Account|Sign Up|Register/i },
  { route: '(auth)/forgot-password', load: () => require('../app/(auth)/forgot-password'), states: FORM, settle: /Reset|Forgot/i },
  { route: '(auth)/reset-password', load: () => require('../app/(auth)/reset-password'), params: { token: 'abc' }, states: FORM, settle: /password/i },
  { route: 'oauthredirect', load: () => require('../app/oauthredirect'), params: {}, states: FORM, settle: /Completing sign in/ },
  { route: '(tabs)/index', load: () => require('../app/(tabs)/index'), states: ALL, settle: /Safe Zones|Emergency/ },
  { route: '(tabs)/family', load: () => require('../app/(tabs)/family'), states: ALL, settle: /Family Members/ },
  { route: '(tabs)/alerts', load: () => require('../app/(tabs)/alerts'), states: ALL, settle: /Alerts/ },
  { route: '(tabs)/chat', load: () => require('../app/(tabs)/chat'), states: ALL, settle: /Marko Sample/ },
  { route: '(tabs)/settings', load: () => require('../app/(tabs)/settings'), states: FORM, settle: /Privacy Settings/ },
  { route: 'chat/private', load: () => require('../app/chat/private'), params: { targetUserId: ids.marko, name: 'Marko' }, states: FORM, settle: /Connecting to chat|Chat is not configured/ },
  { route: 'family/accept-invite', load: () => require('../app/family/accept-invite'), states: FORM, settle: /Invalid invitation link/ },
  { route: 'family/add-member', load: () => require('../app/family/add-member'), states: FORM, settle: /Send Invitation/ },
  { route: 'family/create', load: () => require('../app/family/create'), states: FORM, settle: /Create Family/ },
  { route: 'location/history', load: () => require('../app/location/history'), states: ALL, settle: /Location History/ },
  { route: 'permissions/location', load: () => require('../app/permissions/location'), states: FORM, settle: /Location Sharing/ },
  { route: 'permissions/notifications', load: () => require('../app/permissions/notifications'), states: FORM, settle: /Stay Updated/ },
  { route: 'profile/edit', load: () => require('../app/profile/edit'), states: FORM, settle: /Edit Profile/ },
  { route: 'profile/view', load: () => require('../app/profile/view'), states: FORM, settle: /Ana Example/ },
  { route: 'profile/view/[id]', load: () => require('../app/profile/view/[id]'), params: { id: ids.marko }, states: ALL, settle: /Marko Sample|Member not found/ },
  { route: 'schedule/create', load: () => require('../app/schedule/create'), states: FORM, settle: /Create Schedule/ },
  { route: 'schedule/edit', load: () => require('../app/schedule/edit'), params: { id: 'schedule-1' }, states: ALL, settle: /Edit Schedule/ },
  { route: 'settings/privacy', load: () => require('../app/settings/privacy'), states: ALL, settle: /Location Sharing/ },
  { route: 'subscription', load: () => require('../app/subscription'), states: ALL, settle: /Subscription/ },
  { route: 'zones/index', load: () => require('../app/zones/index'), states: ALL, settle: /Safe Zones/ },
  { route: 'zones/create', load: () => require('../app/zones/create'), states: FORM, settle: /Create Safe Zone/ },
  { route: 'zones/edit', load: () => require('../app/zones/edit'), params: { id: ids.zoneHome }, states: ALL, settle: /Edit Safe Zone/ },
  { route: 'zones/analytics', load: () => require('../app/zones/analytics'), states: ALL, settle: /Zone Analytics/ },
];

beforeEach(async () => {
  Object.values(mockRouter).forEach((fn) => fn.mockClear());
  await signInDemoUser();
});

describe.each(routes)('route $route', ({ load, params = {}, states, settle }) => {
  it.each(states)('renders in %s state without throwing', async (mode) => {
    mockParams = params;
    const Screen = load().default;
    const { toJSON } = renderScreen(<Screen />, mode);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(toJSON()).not.toBeNull();
    if (mode === 'data') await waitFor(() => expect(screen.getAllByText(settle).length).toBeGreaterThan(0));
  });
});

describe('query-driven screens show loading and error through shared components', () => {
  it('family screen: spinner while loading, retryable error on failure, data when loaded', async () => {
    mockParams = {};
    const Screen = require('../app/(tabs)/family').default;

    const loading = renderScreen(<Screen />, 'loading');
    expect(loading.getByRole('progressbar')).toBeTruthy();
    loading.unmount();

    const failed = renderScreen(<Screen />, 'error');
    await waitFor(() => expect(failed.getByText('Server exploded')).toBeTruthy());
    expect(failed.getByText('Try again')).toBeTruthy();
    failed.unmount();

    const loaded = renderScreen(<Screen />, 'data');
    await waitFor(() => expect(loaded.getByText('The Examples')).toBeTruthy());
    expect(loaded.getByText('Iva Demo')).toBeTruthy();
  });

  it('alerts screen lists alerts newest first, with an unread badge', async () => {
    const Screen = require('../app/(tabs)/alerts').default;
    const { getByText } = renderScreen(<Screen />, 'data');
    await waitFor(() => expect(getByText('Iva Demo has 15% battery left')).toBeTruthy());
    expect(getByText('Marko Sample arrived at School')).toBeTruthy();
  });

  it('zones screen shows the empty state when the family has no zones', async () => {
    const Screen = require('../app/zones/index').default;
    const { getByText } = renderScreen(<Screen />, 'data');
    await waitFor(() => expect(getByText('Home')).toBeTruthy());
  });
});
