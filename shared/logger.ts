/* eslint-disable no-console -- the logger is the single place allowed to touch the console */
type Level = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry {
  level: Level;
  message: string;
  context?: unknown;
  at: number;
}
type Reporter = (entry: LogEntry) => void;

const BUFFER_LIMIT = 100;
const buffer: LogEntry[] = [];
let reporter: Reporter | null = null;

/** Plug a crash reporter here; warn and error entries are forwarded to it. */
export const setLogReporter = (next: Reporter | null) => {
  reporter = next;
};

/** Recent entries, used as breadcrumbs when an error is reported. */
export const recentLogs = (): readonly LogEntry[] => buffer;

function write(level: Level, message: string, context?: unknown) {
  const entry: LogEntry = { level, message, context, at: Date.now() };
  buffer.push(entry);
  if (buffer.length > BUFFER_LIMIT) buffer.shift();
  if (level === 'warn' || level === 'error') reporter?.(entry);
  if (__DEV__ && process.env.NODE_ENV !== 'test') console[level](`[${level}] ${message}`, context ?? '');
}

export const logger = {
  debug: (message: string, context?: unknown) => write('debug', message, context),
  info: (message: string, context?: unknown) => write('info', message, context),
  warn: (message: string, context?: unknown) => write('warn', message, context),
  error: (message: string, context?: unknown) => write('error', message, context),
};
