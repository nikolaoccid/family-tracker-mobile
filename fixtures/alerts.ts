import type { z } from 'zod';
import type { alertSchema } from '@/features/notifications';
import { ids, landmarks } from './ids';

type WireAlert = z.input<typeof alertSchema>;

export function createAlerts(now: Date): WireAlert[] {
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
  return [
    {
      id: 'alert-1',
      type: 'low_battery',
      userId: ids.iva,
      familyId: ids.family,
      message: 'Iva Demo has 15% battery left',
      timestamp: ago(25),
    },
    {
      id: 'alert-2',
      type: 'zone_entry',
      userId: ids.marko,
      familyId: ids.family,
      message: 'Marko Sample arrived at School',
      ...landmarks.notreDame,
      timestamp: ago(90),
    },
    {
      id: 'alert-3',
      type: 'zone_exit',
      userId: ids.marko,
      familyId: ids.family,
      message: 'Marko Sample left Home',
      ...landmarks.eiffelTower,
      timestamp: ago(60 * 5),
    },
    {
      id: 'alert-4',
      type: 'heading_home',
      userId: ids.iva,
      familyId: ids.family,
      message: 'Iva Demo is heading home',
      ...landmarks.sacreCoeur,
      timestamp: ago(60 * 30),
    },
  ];
}
