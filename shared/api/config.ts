import Constants from 'expo-constants';

/** Public, build-time configuration. Everything here ships in the bundle. */
export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === '1',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  streamApiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY ?? '',
  iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID ?? '',
  androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID ?? '',
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
} as const;
