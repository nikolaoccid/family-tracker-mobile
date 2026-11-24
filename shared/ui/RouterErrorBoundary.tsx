import React from 'react';
import { logger } from '@/shared/logger';
import ErrorState from './ErrorState';

interface Props {
  error: Error;
  retry: () => Promise<unknown>;
}

/** Shape expo-router expects from a layout's `ErrorBoundary` export. */
export default function RouterErrorBoundary({ error, retry }: Props) {
  React.useEffect(() => {
    logger.error('route render error', error.message);
  }, [error]);
  return <ErrorState error={error} onRetry={() => void retry()} />;
}
