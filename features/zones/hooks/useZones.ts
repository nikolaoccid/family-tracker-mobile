import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newIdempotencyKey } from '@/shared/api';
import { zonesApi, type AnalyticsRange } from '../api/zonesApi';
import { zoneKeys } from '../model/keys';
import type { NewSafeZone, SafeZone } from '../model/zone';

export function useZones(familyId: string | undefined) {
  return useQuery({
    queryKey: zoneKeys.list(familyId ?? ''),
    queryFn: ({ signal }) => zonesApi.list(familyId as string, signal),
    enabled: !!familyId,
  });
}

export function useZoneAnalytics(zoneId: string | undefined, range: AnalyticsRange) {
  return useQuery({
    queryKey: zoneKeys.analytics(zoneId ?? '', range),
    queryFn: ({ signal }) => zonesApi.analytics(zoneId as string, range, signal),
    enabled: !!zoneId && !!range.userId,
  });
}

export function useZonesSummary(range: AnalyticsRange) {
  return useQuery({
    queryKey: zoneKeys.summary(range),
    queryFn: ({ signal }) => zonesApi.analyticsSummary(range, signal),
    enabled: !!range.userId,
  });
}

export function useZoneMutations(familyId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: zoneKeys.all });
  return {
    create: useMutation({
      mutationFn: (zone: NewSafeZone) => zonesApi.create(zone, familyId, newIdempotencyKey()),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: (v: { zoneId: string; changes: Partial<SafeZone> }) => zonesApi.update(v.zoneId, v.changes, familyId),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (zoneId: string) => zonesApi.remove(zoneId), onSuccess: invalidate }),
    setActive: useMutation({
      mutationFn: (v: { zoneId: string; isActive: boolean }) => zonesApi.setActive(v.zoneId, v.isActive),
      onSuccess: invalidate,
    }),
  };
}
