export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const defaultRetryPolicy: RetryPolicy = { maxAttempts: 3, baseDelayMs: 400, maxDelayMs: 5000 };

/** Full jitter: random delay in [0, min(max, base * 2^attempt)). */
export function backoffDelay(attempt: number, policy: RetryPolicy, random: () => number): number {
  const ceiling = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** attempt);
  return Math.floor(random() * ceiling);
}

export const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'PUT', 'DELETE']);
