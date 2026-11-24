import type { Family } from './family';

/** True when `userId` is an admin of `family`. */
export function isFamilyAdmin(family: Family | null | undefined, userId: string | undefined): boolean {
  if (!family || !userId) return false;
  return family.members.some((m) => m.id === userId && m.role === 'admin');
}
