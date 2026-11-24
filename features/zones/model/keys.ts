import type { AnalyticsRange } from '../api/zonesApi';

export const zoneKeys = {
  all: ['zones'] as const,
  list: (familyId: string) => [...zoneKeys.all, 'list', familyId] as const,
  analytics: (zoneId: string, range: AnalyticsRange) => [...zoneKeys.all, 'analytics', zoneId, range] as const,
  summary: (range: AnalyticsRange) => [...zoneKeys.all, 'summary', range] as const,
};
