import * as Crypto from 'expo-crypto';
import { config } from './config';

/**
 * A fresh UUID to send as `Idempotency-Key` with a create, so a retry after a dropped response cannot
 * duplicate it. Generate one per user action and reuse it for every attempt of that action.
 * Returns undefined when switched off with EXPO_PUBLIC_IDEMPOTENCY_KEYS=0 (e.g. against an older server).
 */
export function newIdempotencyKey(): string | undefined {
  return config.idempotencyKeys ? Crypto.randomUUID() : undefined;
}
