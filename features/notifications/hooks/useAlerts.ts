import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { newIdempotencyKey } from '@/shared/api';
import { alertsApi, type AlertDraft } from '../api/alertsApi';
import { alertKeys } from '../model/keys';
import { useReadAlertsStore } from '../model/readAlertsStore';
import { selectAlerts } from '../model/selectAlerts';

export function useAlerts(familyId: string | undefined) {
  const query = useQuery({
    queryKey: alertKeys.list(familyId ?? ''),
    queryFn: ({ signal }) => alertsApi.list(familyId as string, signal),
    enabled: !!familyId,
  });
  const readIds = useReadAlertsStore((s) => s.readIds);
  const alerts = useMemo(() => selectAlerts(query.data ?? [], new Set(readIds)), [query.data, readIds]);
  return { ...query, alerts };
}

export function useAlertMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: alertKeys.all });
  return {
    create: useMutation({
      mutationFn: (draft: AlertDraft) => alertsApi.create(draft, newIdempotencyKey()),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (alertId: string) => alertsApi.remove(alertId),
      onSuccess: invalidate,
    }),
  };
}
