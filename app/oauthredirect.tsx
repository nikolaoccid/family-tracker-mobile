import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '../components/Themed';

import * as WebBrowser from 'expo-web-browser';
import {useAuthStore} from "@/store/authStore";

WebBrowser.maybeCompleteAuthSession();

export default function Oauthredirect() {
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    state?: string;
    scope?: string;
    authuser?: string;
    prompt?: string;
  }>();
  const router = useRouter();
  console.log('OAuth Redirect Params:', params);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        if (params.error) {
          console.error('OAuth error:', params.error);
          router.replace('/');
          return;
        }

        if (!params.code) {
          console.error('No OAuth code received');
          router.replace('/');
          return;
        }

        // Handle the OAuth callback with the received code
        // await handleOAuthCallback('google', params.code);

        // Redirect to the main app after successful authentication
        router.replace('/(tabs)');
      } catch (err) {
        console.error('Error handling OAuth redirect:', err);
        router.replace('/');
      }
    };

    handleRedirect();
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>Completing sign in...</Text>
    </View>
  );
}
