import * as Crypto from 'expo-crypto';
import { config } from './config';

/**
 * A fresh UUID to send as `Idempotency-Key` with a create, so a retry after a dropped response cannot
 * duplicate it. Generate one per user action and reuse it for every attempt of that action.
 * Returns undefined while the backend feature is switched off (EXPO_PUBLIC_IDEMPOTENCY_KEYS).
 */
export function newIdempotencyKey(): string | undefined {
  return config.idempotencyKeys ? Crypto.randomUUID() : undefined;
}
