import { Colors } from '@/shared/ui/theme';
import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from '@/shared/logger';
import { useAuthStore, authApi } from '@/features/auth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: Colors.notificationLight,
  });
}

/** Push permission, token registration with the API, and the last notification received in the foreground. */
export function usePushNotifications() {
  const userId = useAuthStore((s) => s.user?.id);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === 'web') return undefined;
    try {
      const existing = await Notifications.getPermissionsAsync();
      const status = existing.status === 'granted' ? existing.status : (await Notifications.requestPermissionsAsync()).status;
      if (status !== 'granted') return undefined;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      if (userId) await authApi.registerPushToken(token);
      await ensureAndroidChannel();
      return token;
    } catch (error) {
      logger.warn('push registration failed', error);
      return undefined;
    }
  }, [userId]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const received = Notifications.addNotificationReceivedListener(setNotification);
    return () => received.remove();
  }, []);

  return { expoPushToken, notification, registerForPushNotifications };
}
