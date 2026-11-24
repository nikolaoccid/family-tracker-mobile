import * as SecureStore from 'expo-secure-store';
import { logger } from '../logger';

const TOKEN_KEY = 'family-tracker.access-token';

export async function readAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    logger.warn('secure-store read failed', error);
    return null;
  }
}

export async function writeAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    logger.warn('secure-store delete failed', error);
  }
}
