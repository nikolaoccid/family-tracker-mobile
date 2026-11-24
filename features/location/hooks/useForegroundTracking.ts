import { useCallback, useEffect, useRef, useState } from 'react';
import * as ExpoLocation from 'expo-location';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/shared/logger';
import { locationApi } from '../api/locationApi';
import { toLocation } from '../model/fix';
import { locationKeys } from '../model/keys';
import { useLocationStore } from '../model/locationStore';
import { isLocationTrackingActive } from '../background/locationTask';

const FOREGROUND_INTERVAL_MS = 15_000;
const BACKGROUND_CHECK_MS = 30_000;

/**
 * Asks for foreground permission, then publishes the device position every
 * 15 seconds while a signed-in user has the app open.
 */
export function useForegroundTracking(userId: string | undefined, familyId: string | undefined) {
  const queryClient = useQueryClient();
  const updateMyLocation = useLocationStore((s) => s.updateMyLocation);
  const [permission, setPermission] = useState<ExpoLocation.PermissionStatus | null>(null);
  const [backgroundActive, setBackgroundActive] = useState(false);
  const busy = useRef(false);

  const send = useMutation({
    mutationFn: locationApi.send,
    onSuccess: () => {
      if (familyId) void queryClient.invalidateQueries({ queryKey: locationKeys.family(familyId) });
    },
    onError: (error) => logger.warn('location upload failed', error),
  });
  const { mutate } = send;

  const requestPermissions = useCallback(async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      setPermission(status);
      return status;
    } catch (error) {
      logger.warn('location permission request failed', error);
      return null;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    if (busy.current) return null;
    busy.current = true;
    try {
      const fix = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Highest });
      const location = toLocation(fix);
      updateMyLocation(location);
      mutate(location);
      return location;
    } catch (error) {
      logger.debug('could not read the current position', error);
      return null;
    } finally {
      busy.current = false;
    }
  }, [mutate, updateMyLocation]);

  useEffect(() => {
    let alive = true;
    ExpoLocation.requestForegroundPermissionsAsync()
      .then(({ status }) => alive && setPermission(status))
      .catch((error) => logger.warn('location permission request failed', error));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (permission !== 'granted' || !userId) return;
    const first = setTimeout(() => void getCurrentLocation(), 1_000);
    const interval = setInterval(() => void getCurrentLocation(), FOREGROUND_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [permission, userId, getCurrentLocation]);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const active = await isLocationTrackingActive();
      if (alive) setBackgroundActive(active);
    };
    void check();
    const interval = setInterval(() => void check(), BACKGROUND_CHECK_MS);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  return { permission, requestPermissions, getCurrentLocation, backgroundActive, isSending: send.isPending };
}
