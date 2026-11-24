export const alertKeys = {
  all: ['alerts'] as const,
  list: (familyId: string) => [...alertKeys.all, 'list', familyId] as const,
};
