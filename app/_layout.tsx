import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import {Platform} from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from "@/store/authStore";
import { QueryClient, QueryClientProvider } from 'react-query';
import { startLocationTracking, stopLocationTracking, isLocationTrackingActive } from '@/background/locationTask';
import { useLocationStore } from '@/store/locationStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import * as Linking from 'expo-linking';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime:  0,
      cacheTime:  0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  }
});

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useRef<boolean>(false);

  useEffect(() => {
    // Skip if we've already navigated to prevent loops
    if (navigationRef.current) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inPermissionsGroup = segments[0] === "permissions";
    const inSubscriptionScreen = segments[0] === "subscription";
    const isResetPasswordScreen = segments[0] === "(auth)" && segments[1] === "reset-password";

    // Allow access to reset-password screen without authentication
    if (isResetPasswordScreen) {
      return;
    }

    if (!isAuthenticated && !inAuthGroup && !inPermissionsGroup && !inSubscriptionScreen) {
      // Redirect to the sign-in page if not authenticated and not already in auth group
      navigationRef.current = true;
      router.replace("/");
    } else if (isAuthenticated && inAuthGroup) {
      // Check if user needs to go through permission screens
      const user = useAuthStore.getState().user;

      if (user && !user.hasNotificationsEnabled && !user.hasLocationEnabled) {
        // User hasn't set up permissions yet, send to permission flow
        navigationRef.current = true;
        router.replace("/permissions/notifications");
      } else if (user && !user.hasLocationEnabled) {
        // User has notifications but not location
        navigationRef.current = true;
        router.replace("/permissions/location");
      } else {
        // User has all permissions, go to main app
        navigationRef.current = true;
        router.replace("/(tabs)");
      }
    }

    // Reset the navigation flag after a short delay
    const timer = setTimeout(() => {
      navigationRef.current = false;
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, segments, router]);
}

function LocationAndNotificationSetup() {
  const { user } = useAuthStore();
  const { setBackgroundTrackingEnabled } = useLocationStore();
  const { registerForPushNotifications } = usePushNotifications();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);

  // Set up location tracking and notifications on app start
  useEffect(() => {
    isMountedRef.current = true;

    const setupTracking = async () => {
      if (Platform.OS === 'web' || isProcessingRef.current) return;

      isProcessingRef.current = true;

      try {
        // Check if user is authenticated and has location permissions
        if (user?.id && user.hasLocationEnabled) {
          // Register for push notifications if enabled
          if (user.hasNotificationsEnabled) {
            await registerForPushNotifications();
          }

          // Check if background tracking is active
          const isActive = await isLocationTrackingActive();

          // Start background tracking if it's not already active
          if (!isActive && isMountedRef.current) {
            const success = await startLocationTracking();
            if (isMountedRef.current) {
              setBackgroundTrackingEnabled(success);
            }
          } else if (isMountedRef.current) {
            setBackgroundTrackingEnabled(true);
          }
        }
      } catch (error) {
        console.error('Error setting up tracking:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };

    // Initial setup
    setupTracking();

    // Set up periodic check to ensure background tracking is still active
    checkIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return;
      setupTracking();
    }, 60000) as unknown as NodeJS.Timeout; // Check every minute

    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [user?.id, user?.hasLocationEnabled]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;
      const parsed = Linking.parse(url);

      if (url.includes('family-invite')) {
        const { invitedEmail, token } = parsed.queryParams ?? {};
        router.push({
          pathname: '/family/accept-invite',
          params: { invitedEmail, token },
        });
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Use the protected route hook to handle redirects
  useProtectedRoute(isAuthenticated);

  // Set up location tracking and notifications
  if (isAuthenticated) {
    return (
      <>
        <LocationAndNotificationSetup />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="family/add-member" options={{ presentation: 'modal' }} />
          <Stack.Screen name="family/accept-invite" options={{ headerShown: false }} />
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="subscription" options={{ headerShown: false }} />
      <Stack.Screen name="permissions/notifications" options={{ headerShown: false }} />
      <Stack.Screen name="permissions/location" options={{ headerShown: false }} />
    </Stack>
  );
}
