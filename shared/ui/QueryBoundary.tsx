import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

interface Props<T> {
  query: Pick<UseQueryResult<T>, 'data' | 'error' | 'isPending' | 'isError' | 'refetch'>;
  children: (data: T) => React.ReactNode;
}

/** Loading, error, data: the three states every screen deals with. */
export function QueryBoundary<T>({ query, children }: Props<T>) {
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  return <>{children(query.data as T)}</>;
}
