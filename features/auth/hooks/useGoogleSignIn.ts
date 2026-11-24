import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { config } from '@/shared/api';
import { logger } from '@/shared/logger';

/**
 * Google sign-in: opens the prompt on Android and hands the Google ID token to `onIdToken`.
 * The server verifies the token; the app never sees or sends a password for Google accounts.
 */
export function useGoogleSignIn(onIdToken: (idToken: string) => Promise<unknown>) {
  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: config.androidClientId,
    iosClientId: config.iosClientId,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.params.id_token;
    if (!idToken) return;
    onIdToken(idToken).catch((error) => logger.warn('Google sign-in failed', error));
    // `onIdToken` changes identity every render; run once per auth response.
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
