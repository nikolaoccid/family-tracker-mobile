import { z } from 'zod';
import { http } from '@/shared/api';

export const chatTokenSchema = z.object({ token: z.string() });

export const chatApi = {
  token: () => http.get('/chat/token', { schema: chatTokenSchema }),
};
