import type { Alert } from './alert';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Newest first. An alert counts as read once opened, or when it is older than 24 hours. */
export function selectAlerts(alerts: readonly Alert[], readIds: ReadonlySet<string>, now: Date = new Date()): Alert[] {
  return alerts
    .map((alert) => {
      const age = now.getTime() - new Date(alert.timestamp).getTime();
      return { ...alert, read: age > DAY_MS || readIds.has(alert.id) };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
