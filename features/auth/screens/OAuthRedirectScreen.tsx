import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/shared/ui/Themed';
import { logger } from '@/shared/logger';

import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function OAuthRedirectScreen() {
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    state?: string;
    scope?: string;
    authuser?: string;
    prompt?: string;
  }>();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        if (params.error) {
          logger.warn('OAuth error', params.error);
          router.replace('/');
          return;
        }

        if (!params.code) {
          logger.warn('No OAuth code received');
          router.replace('/');
          return;
        }

        // Handle the OAuth callback with the received code
        // await handleOAuthCallback('google', params.code);

        // Redirect to the main app after successful authentication
        router.replace('/(tabs)');
      } catch (err) {
        logger.warn('Error handling OAuth redirect', err);
        router.replace('/');
      }
    };

    handleRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per redirect params
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>Completing sign in...</Text>
    </View>
  );
}
