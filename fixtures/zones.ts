import type { z } from 'zod';
import type { analyticsSchema, zoneSchema } from '@/features/zones';
import { ids, landmarks } from './ids';
import { users } from './users';

type WireZone = z.input<typeof zoneSchema>;
type WireAnalytics = z.input<typeof analyticsSchema>;

export const createZones = (): WireZone[] => [
  {
    id: ids.zoneHome,
    name: 'Home',
    color: '#4A80F0',
    radius: 150,
    centerLatitude: landmarks.eiffelTower.latitude,
    centerLongitude: landmarks.eiffelTower.longitude,
    membersToTrack: [ids.ana, ids.marko, ids.iva],
    isActive: true,
    createdAt: '2026-01-06T10:00:00.000Z',
  },
  {
    id: ids.zoneSchool,
    name: 'School',
    color: '#4AD991',
    radius: 200,
    centerLatitude: landmarks.notreDame.latitude,
    centerLongitude: landmarks.notreDame.longitude,
    membersToTrack: [ids.iva],
    isActive: true,
    createdAt: '2026-01-07T10:00:00.000Z',
  },
  {
    id: ids.zonePark,
    name: 'Park',
    color: '#F2994A',
    radius: 300,
    centerLatitude: landmarks.arcDeTriomphe.latitude,
    centerLongitude: landmarks.arcDeTriomphe.longitude,
    membersToTrack: [],
    isActive: false,
    createdAt: '2026-01-08T10:00:00.000Z',
  },
];

const day = (now: Date, ago: number) =>
  new Date(now.getTime() - ago * 86_400_000).toISOString().split('T')[0] as string;

export function createAnalytics(now: Date, zoneId: string, userId: string = ids.iva): WireAnalytics {
  const zone = createZones().find((z) => z.id === zoneId) ?? createZones()[0]!;
  const visit = (daysAgo: number, minutes: number) => {
    const entry = new Date(now.getTime() - daysAgo * 86_400_000);
    return {
      entryTime: entry.toISOString(),
      exitTime: new Date(entry.getTime() + minutes * 60_000).toISOString(),
      duration: minutes,
    };
  };
  return {
    zoneId: zone.id,
    zoneName: zone.name,
    userId,
    userName: Object.values(users).find((u) => u.id === userId)?.name ?? 'Unknown',
    totalTimeSpent: 95 + 240 + 180,
    visits: [visit(1, 240), visit(2, 180), visit(3, 95)],
    timeByDay: [
      { date: day(now, 3), minutes: 95 },
      { date: day(now, 2), minutes: 180 },
      { date: day(now, 1), minutes: 240 },
    ],
  };
}
