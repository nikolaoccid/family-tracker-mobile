import type { z } from 'zod';
import type { userSchema } from '@/features/auth';
import { ids } from './ids';

type WireUser = z.input<typeof userSchema>;

const base = (id: string, name: string, email: string, extra: Partial<WireUser> = {}): WireUser => ({
  id,
  name,
  email,
  isPremium: false,
  createdAt: '2026-01-05T09:00:00.000Z',
  hasNotificationsEnabled: true,
  hasLocationEnabled: true,
  ...extra,
});

export const users = {
  ana: base(ids.ana, 'Ana Example', 'ana@example.com', { isPremium: true, phone: '+385 00 000 0001' }),
  marko: base(ids.marko, 'Marko Sample', 'marko@example.com'),
  iva: base(ids.iva, 'Iva Demo', 'iva@example.com'),
  tomas: base(ids.tomas, 'Tomas Test', 'tomas@example.com'),
} as const;

/** The signed-in user in demo mode. */
export const demoUser = users.ana;
export const DEMO_TOKEN = 'demo-access-token';
