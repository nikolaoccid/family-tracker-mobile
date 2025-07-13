import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-react-native';
import { StreamChat } from 'stream-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { chatController } from '@/api/chatController';
import { useAuthStore } from '@/store/authStore';
import { useLocalSearchParams } from 'expo-router';

const streamClient = StreamChat.getInstance('REDACTED_STREAM_KEY');

export default function PrivateChatScreen() {
  const { user } = useAuthStore();
  const { targetUserId, name } = useLocalSearchParams<{ targetUserId: string; name?: string }>();
  const [chatClientReady, setChatClientReady] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  const USER_ID = user?.id;
  const USER_NAME = user?.name || 'User';
  const USER_IMAGE = `https://getstream.io/random_png/?id=${USER_ID}&name=${USER_NAME}`;

  useEffect(() => {
    const setupChat = async () => {
      try {
        console.log('[Chat] Starting setup');

        if (!USER_ID || !targetUserId) {
          console.error('[Chat] Missing USER_ID or targetUserId:', USER_ID, targetUserId);
          return;
        }

        console.log('[Chat] Fetching token...');
        const tokenResponse = await chatController.getToken();
        console.log('[Chat] Token response:', tokenResponse);

        const token = tokenResponse?.token;
        if (!token) throw new Error('Token missing in response');

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('[Chat] Decoded token payload:', payload);
          if (payload.user_id !== USER_ID) {
            console.warn('[Chat] Token user_id mismatch:', payload.user_id, USER_ID);
          }
        } catch (e) {
          console.warn('[Chat] Token decode failed:', e);
        }

        streamClient.on('connection.error', (event) => {
          console.error('❌ Stream connection error:', event);
        });

        streamClient.on('connection.changed', (event) => {
          console.log('🔄 Stream connection changed:', event);
        });

        console.log('[Chat] Connecting user...');
        await streamClient.connectUser(
          { id: USER_ID, name: USER_NAME, image: USER_IMAGE },
          token
        );
        console.log('[Chat] Connected ✅');

        const getPrivateChannelId = (members: string[]): string => {
          const sorted = [...members].sort().join('__');
          let hash = 0;
          for (let i = 0; i < sorted.length; i++) {
            hash = ((hash << 5) - hash) + sorted.charCodeAt(i);
            hash |= 0;
          }
          return Math.abs(hash).toString(36);
        };

        const members = [USER_ID, targetUserId].sort();
        const privateChannelId = getPrivateChannelId(members);
        console.log('[Chat] Channel ID:', privateChannelId);

        const chatChannel = streamClient.channel('messaging', privateChannelId, { members });
        await chatChannel.watch();
        console.log('[Chat] Channel ready ✅');

        setChannel(chatChannel);
        setChatClientReady(true);
      } catch (error: any) {
        console.error('[Chat] ❌ setupChat error:', error?.message || error);
      }
    };

    setupChat();

    return () => {
      console.log('[Chat] Disconnecting user...');
      streamClient.disconnectUser();
    };
  }, [USER_ID, targetUserId]);

  if (!chatClientReady || !channel) return null;
  if (channel.error) {
    console.error('[Chat] Channel error:', channel.error);
    return null;
  }

  return (
    <OverlayProvider>
      <View style={styles.container}>
        <Chat client={streamClient}>
          <Channel channel={channel}>
            <MessageList />
            <MessageInput />
          </Channel>
        </Chat>
      </View>
    </OverlayProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
