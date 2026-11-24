import type { ConfigContext, ExpoConfig } from 'expo/config';

const env = process.env;
const demoMode = env.EXPO_PUBLIC_DEMO_MODE === '1';

// The API URL is the only value the app cannot start without.
if (!env.EXPO_PUBLIC_API_BASE_URL && !demoMode) {
  throw new Error(
    'EXPO_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env, or set EXPO_PUBLIC_DEMO_MODE=1.',
  );
}

// Optional: maps render a blank tile layer without a key, everything else keeps working.
const mapsKey = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Family Tracker',
  slug: 'family-tracker',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'app.familytracker',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  owner: 'nikolasty',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.familytracker',
    config: { googleMapsApiKey: mapsKey },
    infoPlist: {
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'This app needs location access to track your family members even in the background.',
      NSLocationWhenInUseUsageDescription:
        'This app needs location access to show your location on the map.',
      UIBackgroundModes: ['location', 'fetch'],
    },
  },
  android: {
    package: 'app.familytracker',
    config: { googleMaps: { apiKey: mapsKey } },
    // Firebase config is supplied per developer or build profile, never committed.
    ...(env.GOOGLE_SERVICES_FILE ? { googleServicesFile: env.GOOGLE_SERVICES_FILE } : {}),
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    permissions: [
      'FOREGROUND_SERVICE',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        data: [{ scheme: 'https', host: 'familytracker.app', pathPrefix: '/' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
      {
        action: 'VIEW',
        data: [{ scheme: 'app.familytracker', host: 'oauthredirect' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: { favicon: './assets/images/favicon.png' },
  plugins: [
    './withLargeHeap.js',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow FamilyTracker to use your location to connect with your family.',
        isIosBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    ['react-native-maps', { androidGoogleMapsApiKey: mapsKey, iosGoogleMapsApiKey: mapsKey }],
    ['expo-router', { origin: 'https://familytracker.app/' }],
    'expo-secure-store',
    'expo-web-browser',
  ],
  experiments: { typedRoutes: true },
  extra: {
    router: { origin: 'https://family-tracker.app/' },
    eas: { projectId: 'bf75b202-51ee-4a26-ae71-c821241c5765' },
  },
});
