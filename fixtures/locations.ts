import type { z } from 'zod';
import type { historyPointSchema } from '@/features/location';
import { ids, landmarks } from './ids';

type WireHistoryPoint = z.input<typeof historyPointSchema>;

const path = [
  landmarks.eiffelTower,
  landmarks.arcDeTriomphe,
  landmarks.louvre,
  landmarks.notreDame,
  landmarks.sacreCoeur,
];

/** A walk between five public landmarks, one point every 20 minutes ending at `now`. */
export function createHistory(now: Date, userId: string = ids.ana): WireHistoryPoint[] {
  return path.map((point, index) => ({
    id: `hist-${index + 1}`,
    userId,
    ...point,
    accuracy: 8,
    speed: 1.2,
    timestamp: new Date(now.getTime() - (path.length - index) * 20 * 60_000).toISOString(),
    whoCanSeeLocation: [ids.ana, ids.marko],
  }));
}
