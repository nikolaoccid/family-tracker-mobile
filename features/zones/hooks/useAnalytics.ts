import { isApiError } from '@/shared/api';
import { useZoneAnalytics, useZonesSummary } from './useZones';
import type { ZoneAnalytics } from '../model/zone';

interface Params {
  userId: string | undefined;
  zoneId: string | null;
  startDate: string;
  endDate: string;
}

/**
 * Analytics for one zone, or the summary across all zones. A zone the user never
 * visited answers 404; that is an empty result, not an error.
 */
export function useAnalytics({ userId, zoneId, startDate, endDate }: Params) {
  const range = { userId: userId ?? '', startDate, endDate };
  const single = useZoneAnalytics(zoneId ?? undefined, range);
  const summary = useZonesSummary(zoneId ? { ...range, userId: '' } : range);

  if (zoneId) {
    const notFound = isApiError(single.error) && single.error.isNotFound;
    const data: ZoneAnalytics[] = single.data ? [single.data] : [];
    return { data, isLoading: single.isLoading, error: notFound ? null : single.error, refetch: single.refetch };
  }
  return { data: summary.data ?? [], isLoading: summary.isLoading, error: summary.error, refetch: summary.refetch };
}
