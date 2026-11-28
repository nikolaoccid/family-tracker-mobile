import type { z } from 'zod';
import type { familySchema } from '@/features/family';
import { ids, landmarks } from './ids';
import { users } from './users';

type WireFamily = z.input<typeof familySchema>;

export function createFamily(now: Date): WireFamily {
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
  return {
    id: ids.family,
    name: 'The Examples',
    ownerId: ids.ana,
    createdAt: '2026-01-05T09:00:00.000Z',
    members: [
      {
        ...users.ana,
        role: 'admin',
        isSharing: true,
        batteryLevel: 82,
        lastSeen: minutesAgo(1),
        location: { ...landmarks.eiffelTower, timestamp: minutesAgo(1) },
      },
      {
        ...users.marko,
        role: 'member',
        isSharing: true,
        batteryLevel: 47,
        lastSeen: minutesAgo(3),
        location: { ...landmarks.louvre, timestamp: minutesAgo(3) },
      },
      {
        ...users.iva,
        role: 'member',
        isSharing: true,
        batteryLevel: 15,
        lastSeen: minutesAgo(40),
        location: { ...landmarks.sacreCoeur, timestamp: minutesAgo(40) },
      },
      { ...users.tomas, role: 'member', isSharing: false, isInvited: true },
    ],
  };
}

/** Rows of `GET /family/:id/locations`: member entities carrying their latest position. */
export const createFamilyLocations = () => [
  { id: 'loc-ana', ...landmarks.eiffelTower, user: { id: ids.ana, name: users.ana.name } },
  { id: 'loc-marko', ...landmarks.louvre, user: { id: ids.marko, name: users.marko.name } },
  { id: 'loc-iva', ...landmarks.sacreCoeur, user: { id: ids.iva, name: users.iva.name } },
];
