import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { runAccountDeletion } from '../model/accountDeletion';
import { useAuthStore } from '../model/authStore';
import { clearAllLocalData } from '@/shared/storage';
import { onSessionReset } from '@/shared/session';
import { makeUser } from '@/test-utils/user';

describe('runAccountDeletion', () => {
  const steps = (over: Partial<Parameters<typeof runAccountDeletion>[0]> = {}) => ({
    confirm: jest.fn(async () => true),
    remove: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
    ...over,
  });

  it('does nothing when the user cancels', async () => {
    const s = steps({ confirm: jest.fn(async () => false) });
    expect(await runAccountDeletion(s)).toBe('cancelled');
    expect(s.remove).not.toHaveBeenCalled();
    expect(s.clear).not.toHaveBeenCalled();
  });

  it('deletes on the server, then wipes the device', async () => {
    const order: string[] = [];
    const s = steps({ remove: jest.fn(async () => void order.push('remove')), clear: jest.fn(async () => void order.push('clear')) });
    expect(await runAccountDeletion(s)).toBe('deleted');
    expect(order).toEqual(['remove', 'clear']);
  });

  it('keeps local data when the server refuses, so the user can retry', async () => {
    const s = steps({ remove: jest.fn(async () => Promise.reject(new Error('503'))) });
    expect(await runAccountDeletion(s)).toBe('failed');
    expect(s.clear).not.toHaveBeenCalled();
  });
});

describe('local wipe after deletion', () => {
  it('clears the token, persisted stores and the query cache', async () => {
    await useAuthStore.getState().signIn({ user: makeUser(), token: 'tok' });
    await AsyncStorage.setItem('family-tracker-query-cache', '{"x":1}');
    const cacheCleared = jest.fn();
    const off = onSessionReset(cacheCleared);

    useAuthStore.getState().signOut();
    await clearAllLocalData();

    expect(cacheCleared).toHaveBeenCalledTimes(1);
    expect(await SecureStore.getItemAsync('family-tracker.access-token')).toBeNull();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, user: null, accessToken: null });
    off();
  });
});
