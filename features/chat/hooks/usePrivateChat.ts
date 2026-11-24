import { useEffect, useState, type ComponentProps } from 'react';
import { StreamChat } from 'stream-chat';
import type { Channel as ChannelView, Chat as ChatView } from 'stream-chat-react-native';
import { config, errorMessage } from '@/shared/api';
import { logger } from '@/shared/logger';
import { chatApi } from '../api/chatApi';
import { privateChannelId } from '../model/channel';

// stream-chat-react-native resolves its own copy of stream-chat, so the view props are the source of truth for these types.
type ChatClient = ComponentProps<typeof ChatView>['client'];
type ChatChannel = NonNullable<ComponentProps<typeof ChannelView>['channel']>;

interface Participant {
  userId: string | undefined;
  userName: string;
  otherUserId: string | undefined;
}

/** Connects to Stream with a server-issued token and opens the channel between two users. */
export function usePrivateChat({ userId, userName, otherUserId }: Participant) {
  const [channel, setChannel] = useState<ChatChannel | null>(null);
  const [client, setClient] = useState<ChatClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unconfigured = config.streamApiKey ? null : 'Chat is not configured for this build.';

  useEffect(() => {
    if (!userId || !otherUserId) return;
    if (!config.streamApiKey) return;
    const stream = StreamChat.getInstance(config.streamApiKey);
    let alive = true;

    const offline = stream.on('connection.changed', (event) => {
      if (alive) setError(event.online ? null : 'You are offline. Reconnecting...');
    });

    (async () => {
      try {
        const { token } = await chatApi.token();
        await stream.connectUser({ id: userId, name: userName }, token);
        const members = [userId, otherUserId].sort();
        const chatChannel = stream.channel('messaging', privateChannelId(userId, otherUserId), { members });
        await chatChannel.watch();
        if (alive) {
          setClient(stream as unknown as ChatClient);
          setChannel(chatChannel as unknown as ChatChannel);
        }
      } catch (e) {
        logger.warn('chat setup failed', e);
        if (alive) setError(errorMessage(e, 'Unknown error occurred.'));
      }
    })();

    return () => {
      alive = false;
      offline.unsubscribe();
      void stream.disconnectUser();
    };
  }, [userId, userName, otherUserId]);

  return { client, channel, error: unconfigured ?? error };
}
