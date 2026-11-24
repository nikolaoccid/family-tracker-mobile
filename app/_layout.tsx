import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AppProviders from '@/bootstrap/AppProviders';
import TrackingSetup from '@/bootstrap/TrackingSetup';
import { startApp } from '@/bootstrap/api';
import { hydrateAuth, useAuthStore, useProtectedRoute } from '@/features/auth';
import { useInviteDeepLink } from '@/features/family';
import { RouterErrorBoundary } from '@/shared/ui';

export { RouterErrorBoundary as ErrorBoundary };

// Must run at module load: background tasks are registered before any component renders.
startApp();

export const unstable_settings = { initialRouteName: '/(auth)' };

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...FontAwesome.font });
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    void hydrateAuth();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && hydrated) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, hydrated]);

  // A missing icon font must not block the app: icons degrade, the rest works.
  if (!(fontsLoaded || fontError) || !hydrated) return null;

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useProtectedRoute();
  useInviteDeepLink();

  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="permissions/notifications" />
        <Stack.Screen name="permissions/location" />
      </Stack>
    );
  }

  return (
    <>
      <TrackingSetup />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="family/add-member" options={{ presentation: 'modal' }} />
        <Stack.Screen name="family/accept-invite" />
        <Stack.Screen name="zones/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="zones/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile/view" options={{ presentation: 'modal' }} />
        <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
        <Stack.Screen name="zones/index" />
        <Stack.Screen name="permissions/notifications" />
        <Stack.Screen name="permissions/location" />
        <Stack.Screen name="oauthredirect" />
      </Stack>
    </>
  );
}
