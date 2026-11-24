/**
 * Guard behaviour for a deep link into a private route. Lives in its own file because
 * expo-router keeps a module-level navigation store that is not reset between renders.
 */
import { waitFor } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { configureHttp } from '@/shared/api';
import { createDemoFetch } from '@/demo/demoFetch';
import { useAuthStore } from '@/features/auth';

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

describe('session guard: private deep link', () => {
  it('a signed-out visitor deep-linking to a private route is sent to sign-in', async () => {
    const { getPathname } = renderRouter('./app', { initialUrl: '/zones' });
    await waitFor(() => expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0), { timeout: 3000 });
    expect(getPathname()).toBe('/');
  });
});
