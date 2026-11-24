import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import { config, createQueryClient } from '@/shared/api';
import { RouteErrorBoundary } from '@/shared/ui';

/** Gesture root, query cache, payments and the global error boundary. */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={config.stripePublishableKey}>
          <RouteErrorBoundary>{children}</RouteErrorBoundary>
        </StripeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
