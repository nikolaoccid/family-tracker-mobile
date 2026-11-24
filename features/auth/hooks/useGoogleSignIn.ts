import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { config, createHttpClient } from '@/shared/api';
import { logger } from '@/shared/logger';
import { googleProfileSchema } from '../model/googleProfile';

/**
 * Google sign-in: opens the prompt on Android and hands the verified profile to `onProfile`.
 * The app registers the account with the same endpoint as e-mail sign-up.
 */
export function useGoogleSignIn(onProfile: (name: string, email: string) => Promise<unknown>) {
  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: config.androidClientId,
    iosClientId: config.iosClientId,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const accessToken = response.authentication?.accessToken;
    if (!accessToken) return;
    const google = createHttpClient({ baseUrl: '', getToken: () => accessToken });
    google
      .get('https://www.googleapis.com/userinfo/v2/me', { schema: googleProfileSchema })
      .then((profile) => onProfile(profile.name, profile.email))
      .catch((error) => logger.warn('could not read Google profile', error));
    // `onProfile` changes identity every render; run once per auth response.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return async () => {
    try {
      if (Platform.OS === 'android') await promptAsync();
    } catch (error) {
      logger.warn('Google sign-in failed', error);
    }
  };
}
