import { z } from 'zod';
import { http } from '@/shared/api';
import { alertSchema } from '../model/alert';

export interface AlertDraft {
  type: 'emergency' | 'heading_home';
  message: string;
  familyId: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

const route = { emergency: '/alert/emergency', heading_home: '/alert/heading-home' } as const;

export const alertsApi = {
  list: (familyId: string, signal?: AbortSignal) =>
    http.get(`/family/${familyId}/alerts`, { schema: z.array(alertSchema), signal }),
  create: (alert: AlertDraft) => http.post(route[alert.type], alert),
  remove: (alertId: string) => http.delete(`/alert/${alertId}`),
};
