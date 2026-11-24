/**
 * Stable id for the one-to-one channel between two users. Existing channels are
 * stored under these ids, so the hash must never change.
 */
export function privateChannelId(userA: string, userB: string): string {
  const sorted = [userA, userB].sort().join('__');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = (hash << 5) - hash + sorted.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
