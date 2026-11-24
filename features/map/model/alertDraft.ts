import type { AlertDraft } from '@/features/notifications';
import type { Location } from '@/features/location';

type Kind = AlertDraft['type'];

/** Wire body for an emergency or "heading home" alert, built from the freshest position. */
export function buildAlertDraft(kind: Kind, user: { id: string; name: string }, familyId: string, position: Location): AlertDraft {
  return {
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
  };
}
