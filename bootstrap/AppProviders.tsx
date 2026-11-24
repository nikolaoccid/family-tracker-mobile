import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StripeProvider } from '@stripe/stripe-react-native';
import { CACHE_MAX_AGE_MS, CACHE_SCHEMA_VERSION, config, createQueryClient, createQueryPersister, shouldPersistQuery } from '@/shared/api';
import { onSessionReset } from '@/shared/session';
import { RouteErrorBoundary } from '@/shared/ui';

/** Gesture root, persisted query cache, payments and the global error boundary. */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [persister] = useState(() => createQueryPersister());

  // Signing out wipes both the in-memory cache and the copy on disk.
  useEffect(
    () =>
      onSessionReset(() => {
        queryClient.clear();
        void persister.removeClient();
      }),
    [queryClient, persister],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: CACHE_MAX_AGE_MS,
          buster: String(CACHE_SCHEMA_VERSION),
          dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
        }}
      >
        <StripeProvider publishableKey={config.stripePublishableKey}>
          <RouteErrorBoundary>{children}</RouteErrorBoundary>
        </StripeProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}
