import { useCallback } from 'react';
import * as ExpoLocation from 'expo-location';
import { logger } from '@/shared/logger';
import { toLocation } from '../model/fix';
import type { Location } from '../model/location';

/** One-off position read for forms (e.g. centring a map). Nothing is uploaded or stored. */
export function useCurrentPosition() {
  return useCallback(async (): Promise<Location | null> => {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      return toLocation(await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced }));
    } catch (error) {
      logger.debug('current position unavailable', error);
      return null;
    }
  }, []);
}
