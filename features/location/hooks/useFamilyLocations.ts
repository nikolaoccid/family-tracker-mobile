import { useQuery } from '@tanstack/react-query';
import { locationApi } from '../api/locationApi';
import { locationKeys } from '../model/keys';

const REFRESH_MS = 8_000;

export function useFamilyLocations(familyId: string | undefined) {
  return useQuery({
    queryKey: locationKeys.family(familyId ?? ''),
    queryFn: ({ signal }) => locationApi.familyLocations(familyId as string, signal),
    enabled: !!familyId,
    refetchInterval: REFRESH_MS, // live map: the one place polling is intended
    staleTime: REFRESH_MS,
  });
}
