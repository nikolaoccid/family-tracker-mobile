import { ids } from './ids';

export const chatToken = { token: 'demo-chat-token-not-real' };

/** Messages for component tests; the live chat UI itself is rendered by the chat SDK. */
export const createChatMessages = (now: Date) =>
  [
    { id: 'm1', from: ids.marko, text: 'Are you on your way home?', at: new Date(now.getTime() - 15 * 60_000).toISOString() },
    { id: 'm2', from: ids.ana, text: 'Leaving the park now.', at: new Date(now.getTime() - 12 * 60_000).toISOString() },
  ] as const;
