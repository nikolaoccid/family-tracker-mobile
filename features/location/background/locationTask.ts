import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { logger } from '@/shared/logger';
import { locationApi } from '../api/locationApi';
import { toLocation } from '../model/fix';
import { useLocationStore } from '../model/locationStore';

export const TASK = 'BG_LOCATION';

interface TaskBody {
  data?: { locations?: Location.LocationObject[] };
  error?: { message: string } | null;
}

/** Task body, exported for tests. Runs in a headless JS context: no UI, no React. */
export async function handleLocationUpdate({ data, error }: TaskBody, ensureSignedIn: () => boolean | Promise<boolean>): Promise<void> {
  if (error) {
    logger.warn('background location task error', error.message);
    return;
  }
  const latest = data?.locations?.at(-1);
  if (!latest || !(await ensureSignedIn())) return;

  const location = toLocation(latest);
  try {
    await locationApi.send(location);
    useLocationStore.getState().updateMyLocation(location);
  } catch (sendError) {
    logger.warn('background location upload failed', sendError);
  }
}

/** Registered at module load, as TaskManager requires. Imported from the root layout. */
export function registerLocationTask(ensureSignedIn: () => boolean | Promise<boolean>): void {
  TaskManager.defineTask(TASK, (body) => handleLocationUpdate(body as TaskBody, ensureSignedIn));
}

export async function startLocationTracking(): Promise<boolean> {
  const foreground = await Location.getForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    const requested = await Location.requestForegroundPermissionsAsync();
    if (requested.status !== 'granted') return false;
  }
  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== 'granted') return false;

  try {
    if (await TaskManager.isTaskRegisteredAsync(TASK)) return true;
    await Location.startLocationUpdatesAsync(TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60_000,
      distanceInterval: 50,
      foregroundService: {
        notificationTitle: 'Family Tracker',
        notificationBody: 'Tracking your location for your family',
      },
      activityType: Location.ActivityType.Other,
      showsBackgroundLocationIndicator: true,
    });
    return true;
  } catch (error) {
    logger.warn('could not start location tracking', error);
    return false;
  }
}

export async function stopLocationTracking(): Promise<boolean> {
  try {
    if (await TaskManager.isTaskRegisteredAsync(TASK)) await Location.stopLocationUpdatesAsync(TASK);
    return true;
  } catch (error) {
    logger.warn('could not stop location tracking', error);
    return false;
  }
}

export async function isLocationTrackingActive(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(TASK);
  } catch (error) {
    logger.warn('could not read location tracking state', error);
    return false;
  }
}
