import { Alert } from 'react-native';
import { useAlertMutations } from '@/features/notifications';
import { useAuthStore } from '@/features/auth';
import { useCurrentPosition } from '@/features/location';
import { logger } from '@/shared/logger';
import { buildAlertDraft } from '../model/alertDraft';

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
      await create.mutateAsync(buildAlertDraft(kind, user, familyId, position));
      Alert.alert('Alert sent', 'Your family has been notified.');
    } catch (error) {
      logger.warn('could not send alert', error);
      Alert.alert('Could not send alert', 'Please try again.');
    }
  };
}
