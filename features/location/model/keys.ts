import type { HistoryRange } from '../api/locationApi';

export const locationKeys = {
  all: ['location'] as const,
  family: (familyId: string) => [...locationKeys.all, 'family', familyId] as const,
  history: (userId: string, range: HistoryRange) => [...locationKeys.all, 'history', userId, range] as const,
};
