import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logger';
import { clearAccessToken } from './secureToken';

/** Wipes everything the app keeps on the device: secure token, persisted stores and the query cache. */
export async function clearAllLocalData(): Promise<void> {
  await clearAccessToken();
  try {
    await AsyncStorage.clear();
  } catch (error) {
    logger.warn('could not clear local storage', error);
  }
}
