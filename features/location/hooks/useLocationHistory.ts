import { useQuery } from '@tanstack/react-query';
import { locationApi, type HistoryRange } from '../api/locationApi';
import { locationKeys } from '../model/keys';

export function useLocationHistory(userId: string | undefined, range: HistoryRange) {
  return useQuery({
    queryKey: locationKeys.history(userId ?? '', range),
    queryFn: ({ signal }) => locationApi.history(userId as string, range, signal),
    enabled: !!userId,
  });
}
