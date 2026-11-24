import { Alert } from 'react-native';
import { useAlertMutations } from '@/features/notifications';
import { useAuthStore } from '@/features/auth';
import { useCurrentPosition } from '@/features/location';
import { logger } from '@/shared/logger';

type Kind = 'emergency' | 'heading_home';

/** Sends an emergency or "heading home" alert with the freshest position available. */
export function useSafetyAlerts(familyId: string | undefined) {
  const user = useAuthStore((s) => s.user);
  const getPosition = useCurrentPosition();
  const { create } = useAlertMutations();

  return async (kind: Kind) => {
    if (!user || !familyId) return;
    const position = await getPosition();
    if (!position) {
      Alert.alert('Location unavailable', 'Turn on location services so your family can see where you are.');
      return;
    }
    try {
      await create.mutateAsync({
        type: kind,
        userId: user.id,
        familyId,
        message: kind === 'emergency' ? `${user.name} triggered an emergency alert` : `${user.name} is heading home`,
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: position.timestamp,
        accuracy: position.accuracy,
        speed: position.speed,
        heading: position.heading,
      });
      Alert.alert('Alert sent', 'Your family has been notified.');
    } catch (error) {
      logger.warn('could not send alert', error);
      Alert.alert('Could not send alert', 'Please try again.');
    }
  };
}
