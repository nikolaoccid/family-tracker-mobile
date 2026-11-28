import type { ZoneAnalytics } from './zone';

/** "45 min", "2 hr", "2 hr 5 min". */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.round(totalMinutes);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

export const totalMinutes = (analytics: readonly ZoneAnalytics[]): number =>
  analytics.reduce((sum, zone) => sum + zone.totalTimeSpent, 0);

/** Share of `part` in `total` as a whole percent; 0 when there is nothing to share. */
export const sharePercent = (part: number, total: number): number => (total > 0 ? Math.round((part / total) * 100) : 0);

const FULL_BAR_MINUTES = 8 * 60;

/** Bar width for a day's time, where eight hours fills the bar. */
export const dayBarPercent = (minutes: number): number =>
  Math.min(100, Math.max(0, (minutes / FULL_BAR_MINUTES) * 100));
