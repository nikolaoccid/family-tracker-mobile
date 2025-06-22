import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-react-native';
import { StreamChat } from 'stream-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { chatController } from '@/api/chatController';
import { useAuthStore } from '@/store/authStore';
import { useLocalSearchParams } from 'expo-router';

const client = StreamChat.getInstance('REDACTED_STREAM_KEY');

export default function PrivateChatScreen() {
  const { user } = useAuthStore();
  const { targetUserId, name } = useLocalSearchParams<{ targetUserId: string; name?: string }>();
  const [isReady, setIsReady] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  const USER_ID = user?.id;
  const USER_NAME = user?.name || 'User';
  const USER_IMAGE = `https://getstream.io/random_png/?id=${USER_ID}&name=${USER_NAME}`;
  const STORAGE_KEY = `stream_user_token_${USER_ID}`;

  useEffect(() => {
    const setupChat = async () => {
      try {
        if (!USER_ID || !targetUserId) throw new Error('Missing user ID');

        let token = await AsyncStorage.getItem(STORAGE_KEY);
        if (!token) {
          const tokenResponse = await chatController.getToken();
          if (!tokenResponse?.token) throw new Error('Failed to fetch chat token');
          token = tokenResponse.token;
          if (token){
            await AsyncStorage.setItem(STORAGE_KEY, token);
          }
        }

        await client.connectUser(
          { id: USER_ID, name: USER_NAME, image: USER_IMAGE },
          token
        );
        function getPrivateChannelId(members: string[]): string {
          const sorted = [...members].sort().join('__');
          let hash = 0;
          for (let i = 0; i < sorted.length; i++) {
            hash = ((hash << 5) - hash) + sorted.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
          }
          return Math.abs(hash).toString(36);
        }

        const members = [USER_ID, targetUserId].sort();
        const privateChannelId = await getPrivateChannelId(members);

        const chatChannel = client.channel('messaging', privateChannelId, {
          members,
        });

        await chatChannel.watch();
        setChannel(chatChannel);
        setIsReady(true);
      } catch (error) {
        console.error('Chat connection error:', error);
      }
    };

    setupChat();

    return () => {
      client.disconnectUser();
    };
  }, [USER_ID, targetUserId]);

  if (!isReady || !channel) return null;

  return (
    <OverlayProvider>
      <View style={styles.container}>
        <Chat client={client}>
          <Channel channel={channel}>
            <MessageList />
            <MessageInput />
          </Channel>
        </Chat>s
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
