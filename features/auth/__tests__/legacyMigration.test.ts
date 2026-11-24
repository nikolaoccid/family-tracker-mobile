import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { hydrateAuth, useAuthStore } from '../model/authStore';

const KEY = 'family-tracker-auth';
const TOKEN_KEY = 'family-tracker.access-token';

/** The exact shape the pre-refactor build wrote: unversioned, token and privacy settings inside. */
const legacyEntry = (over: object = {}) =>
  JSON.stringify({
    state: {
      user: { id: 'u1', name: 'Ana', email: 'ana@example.com', isPremium: true, createdAt: '2025-01-01', futureField: 1 },
      accessToken: 'legacy-token',
      isAuthenticated: true,
      privacySettings: { locationSharing: { enabled: true } },
      ...over,
    },
    version: 0,
  });

beforeEach(async () => {
  await AsyncStorage.clear();
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false, hydrated: false });
});

describe('upgrading from the build that stored the token in AsyncStorage', () => {
  it('keeps the user signed in: the token moves to secure storage and the session restores', async () => {
    await AsyncStorage.setItem(KEY, legacyEntry());
    await useAuthStore.persist.rehydrate();
    await hydrateAuth();

    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: true, accessToken: 'legacy-token', hydrated: true });
    expect(useAuthStore.getState().user).toMatchObject({ id: 'u1', name: 'Ana' });
    expect(await SecureStore.getItemAsync(TOKEN_KEY)).toBe('legacy-token');
  });

  it('does not leave the token in AsyncStorage once the store has written itself again', async () => {
    await AsyncStorage.setItem(KEY, legacyEntry());
    await useAuthStore.persist.rehydrate();
    await hydrateAuth();
    useAuthStore.setState({ hydrated: true }); // any write persists the current, token-free shape
    await useAuthStore.persist.rehydrate();
    expect(await AsyncStorage.getItem(KEY)).not.toContain('legacy-token');
  });

  it('prefers a token already in secure storage over the legacy one', async () => {
    await SecureStore.setItemAsync(TOKEN_KEY, 'newer-token');
    await AsyncStorage.setItem(KEY, legacyEntry());
    await useAuthStore.persist.rehydrate();
    await hydrateAuth();
    expect(useAuthStore.getState().accessToken).toBe('newer-token');
  });

  it('signs out cleanly when the old entry had no token', async () => {
    await AsyncStorage.setItem(KEY, legacyEntry({ accessToken: null }));
    await useAuthStore.persist.rehydrate();
    await hydrateAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('survives a corrupt old entry', async () => {
    await AsyncStorage.setItem(KEY, '{not json');
    await expect(useAuthStore.persist.rehydrate()).resolves.not.toThrow();
    await hydrateAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
