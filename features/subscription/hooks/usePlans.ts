import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '../api/subscriptionApi';

export const usePlans = () =>
  useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: ({ signal }) => subscriptionApi.plans(signal),
    staleTime: 60 * 60_000, // plans change with app releases, not minute to minute
  });
