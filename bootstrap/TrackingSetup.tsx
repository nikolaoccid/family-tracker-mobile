import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { isLocationTrackingActive, startLocationTracking, useLocationStore } from '@/features/location';
import { usePushNotifications } from '@/features/notifications';
import { logger } from '@/shared/logger';

const RECHECK_MS = 60_000;

/** Keeps background tracking and the push token in step with the signed-in user's permissions. */
export default function TrackingSetup() {
  const userId = useAuthStore((s) => s.user?.id);
  const hasLocation = useAuthStore((s) => s.user?.hasLocationEnabled);
  const hasNotifications = useAuthStore((s) => s.user?.hasNotificationsEnabled);
  const setEnabled = useLocationStore((s) => s.setBackgroundTrackingEnabled);
  const { registerForPushNotifications } = usePushNotifications();

  useEffect(() => {
    if (Platform.OS === 'web' || !userId || !hasLocation) return;
    let alive = true;
    let running = false;

    const sync = async () => {
      if (running) return;
      running = true;
      try {
        if (hasNotifications) await registerForPushNotifications();
        const active = (await isLocationTrackingActive()) || (await startLocationTracking());
        if (alive) setEnabled(active);
      } catch (error) {
        logger.warn('tracking setup failed', error);
      } finally {
        running = false;
      }
    };

    void sync();
    const interval = setInterval(() => void sync(), RECHECK_MS);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [userId, hasLocation, hasNotifications, registerForPushNotifications, setEnabled]);

  return null;
}
