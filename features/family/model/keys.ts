export const familyKeys = {
  all: ['family'] as const,
  current: () => [...familyKeys.all, 'current'] as const,
  invite: (token: string) => [...familyKeys.all, 'invite', token] as const,
};
