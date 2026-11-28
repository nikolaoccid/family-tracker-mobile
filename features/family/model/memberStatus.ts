import { Colors } from '@/shared/ui/theme';
import type { FamilyMember } from './family';

const LOW_BATTERY_PERCENT = 20;
const MEDIUM_BATTERY_PERCENT = 50;
const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function batteryColor(level: FamilyMember['batteryLevel']): string {
  if (!level) return Colors.light.icon;
  if (level < LOW_BATTERY_PERCENT) return Colors.danger;
  if (level < MEDIUM_BATTERY_PERCENT) return Colors.warning;
  return Colors.success;
}

/** A member is online while sharing and last seen within the online window. */
export function isOnline(member: Pick<FamilyMember, 'isSharing' | 'lastSeen'>, now = Date.now()): boolean {
  return Boolean(member.isSharing && member.lastSeen && now - new Date(member.lastSeen).getTime() < ONLINE_WINDOW_MS);
}
