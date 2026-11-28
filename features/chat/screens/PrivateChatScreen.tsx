import React from 'react';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Channel, Chat, MessageInput, MessageList, OverlayProvider } from 'stream-chat-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth';
import { usePrivateChat } from '../hooks/usePrivateChat';
import { styles } from './PrivateChatScreen.styles';

export function PrivateChatScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { targetUserId, name } = useLocalSearchParams<{ targetUserId: string; name?: string }>();
  const { client, channel, error } = usePrivateChat({
    userId: user?.id,
    userName: user?.name || 'User',
    otherUserId: targetUserId,
  });

  if (!client || !channel) {
    return (
      <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
        <Header name={name} onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Connecting to chat...</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <Header name={name} onBack={() => router.back()} />
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}
          <View style={styles.chatArea}>
            <Chat client={client}>
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
      <TouchableOpacity onPress={onBack} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{name || 'Chat'}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}
