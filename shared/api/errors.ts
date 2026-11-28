export type ApiErrorKind = 'network' | 'timeout' | 'aborted' | 'unauthorized' | 'http' | 'parse' | 'validation';

interface ApiErrorInit {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  code?: string;
  cause?: unknown;
}

/** Every failure the API client can produce. Screens never see `fetch` errors. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;

  constructor({ kind, message, status, code, cause }: ApiErrorInit) {
    super(message, { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.code = code;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  /** True when retrying the same request later could succeed. */
  get isTransient(): boolean {
    return (
      this.kind === 'network' ||
      this.kind === 'timeout' ||
      (this.kind === 'http' && (this.status === 429 || (this.status ?? 0) >= 500))
    );
  }
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

/** Turns a rejecting call into a typed result, for expected failures (validation, conflict, offline). */
export async function toResult<T>(call: Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await call };
  } catch (error) {
    if (isApiError(error)) return { ok: false, error };
    throw error;
  }
}

/** Human-readable message for any thrown value. */
export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}

type ErrorBody = { message?: unknown; code?: unknown; error?: unknown };

/** Backend (Nest) errors carry `message` as a string or a list of validation messages. */
export function messageFromBody(body: unknown, fallback: string): { message: string; code?: string } {
  if (typeof body !== 'object' || body === null) return { message: fallback };
  const { message, code, error } = body as ErrorBody;
  const text = Array.isArray(message)
    ? message.filter((m) => typeof m === 'string').join(', ')
    : typeof message === 'string'
      ? message
      : typeof error === 'string'
        ? error
        : '';
  return {
    message: text || fallback,
    code: typeof code === 'string' ? code : undefined,
  };
}
