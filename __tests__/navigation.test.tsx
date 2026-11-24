/**
 * The real router over the real `app/` directory: layouts, route groups and the
 * session guard, with only native modules mocked.
 */
import { act, waitFor } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { configureHttp } from '@/shared/api';
import { createDemoFetch } from '@/demo/demoFetch';
import { useAuthStore } from '@/features/auth';
import { signInDemoUser } from '../test-utils/render';

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn(), MediaTypeOptions: { Images: 'Images' } }));
jest.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
}));
jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() }));

beforeEach(() => {
  configureHttp({ baseUrl: 'https://api.example.test', fetchImpl: createDemoFetch(() => new Date(), 0), getToken: () => 'demo-access-token' });
  useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, hydrated: true });
});

describe('session guard over the real route tree', () => {
  it('a signed-out visitor lands on the sign-in screen', async () => {
    renderRouter('./app', { initialUrl: '/' });
    await waitFor(() => expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0));
  });

  it('reset-password stays reachable without a session', async () => {
    const { getPathname } = renderRouter('./app', { initialUrl: '/reset-password?token=abc' });
    await waitFor(() => expect(screen.getAllByText(/password/i).length).toBeGreaterThan(0));
    expect(getPathname()).toBe('/reset-password');
  });

  it('a signed-in user opens the app on the tabs', async () => {
    await signInDemoUser({ hasLocationEnabled: true, hasNotificationsEnabled: true });
    renderRouter('./app', { initialUrl: '/family' });
    await act(async () => undefined);
    await waitFor(() => expect(screen.getAllByText(/Family Members|The Examples/).length).toBeGreaterThan(0));
  });
});
