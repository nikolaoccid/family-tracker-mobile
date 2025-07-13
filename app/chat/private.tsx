import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  OverlayProvider,
} from 'stream-chat-react-native';
import { StreamChat } from 'stream-chat';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { chatController } from '@/api/chatController';
import { useAuthStore } from '@/store/authStore';

const streamClient = StreamChat.getInstance('REDACTED_STREAM_KEY');

export default function PrivateChatScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { targetUserId, name } = useLocalSearchParams<{ targetUserId: string; name?: string }>();
  const [chatClientReady, setChatClientReady] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const USER_ID = user?.id;
  const USER_NAME = user?.name || 'User';
  const USER_IMAGE = `https://getstream.io/random_png/?id=${USER_ID}&name=${USER_NAME}`;

  useEffect(() => {
    const setupChat = async () => {
      try {
        setConnectionError(null);
        if (!USER_ID || !targetUserId) {
          console.error('[Chat] Missing USER_ID or targetUserId:', USER_ID, targetUserId);
          return;
        }

        const tokenResponse = await chatController.getToken();
        const token = tokenResponse?.token;
        if (!token) throw new Error('Token missing in response');

        streamClient.on('connection.error', (event) => {
          console.error('❌ Stream connection error:', event);
          setConnectionError('Connection error. Please try again later.');
        });

        streamClient.on('connection.changed', (event) => {
          console.log('🔄 Stream connection changed:', event);
          if (!event.online) {
            setConnectionError('You are offline. Reconnecting...');
          } else {
            setConnectionError(null);
          }
        });

        await streamClient.connectUser(
          { id: USER_ID, name: USER_NAME, image: USER_IMAGE },
          token
        );

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
        const chatChannel = streamClient.channel('messaging', privateChannelId, { members });
        await chatChannel.watch();

        setChannel(chatChannel);
        setChatClientReady(true);
      } catch (error: any) {
        console.error('[Chat] ❌ setupChat error:', error?.message || error);
        setConnectionError(error?.message || 'Unknown error occurred.');
      }
    };

    setupChat();

    return () => {
      streamClient.disconnectUser();
    };
  }, [USER_ID, targetUserId]);

  if (!chatClientReady || !channel) {
    return (
      <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
        <Header name={name} onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Connecting to chat...</Text>
          {connectionError && <Text style={styles.errorText}>{connectionError}</Text>}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <OverlayProvider>
      <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust if needed
        >
          <Header name={name} onBack={() => router.back()} />
          {connectionError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{connectionError}</Text>
            </View>
          )}
          <View style={styles.chatArea}>
            <Chat client={streamClient}>
              <Channel channel={channel}>
                <MessageList />
                <MessageInput />
              </Channel>
            </Chat>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </OverlayProvider>
  );

}

function Header({ name, onBack }: { name?: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{name || 'Chat'}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  errorBanner: {
    backgroundColor: '#ffcccc',
    padding: 8,
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#990000',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },

});
