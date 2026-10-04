import { env } from '@sift/config';
import { getContext } from './context.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Keys that must never be written to logs (TPRD §60, §70). Matched
 * case-insensitively against the full key path.
 */
const REDACT_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
  'providerkey',
  'clientsecret',
  'stripesecretkey',
  'webhooksecret',
];

export type LogFields = Record<string, unknown>;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[depth_limited]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACT_KEYS.some((r) => k.toLowerCase().includes(r)) ? '[redacted]' : redact(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

export interface Logger {
  child(fields: LogFields): Logger;
  debug(event: string, fields?: LogFields): void;
  info(event: string, fields?: LogFields): void;
  warn(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
}

export function createLogger(service: string, base: LogFields = {}): Logger {
  const threshold = LEVEL_ORDER[env.LOG_LEVEL];

  function emit(level: LogLevel, event: string, fields?: LogFields): void {
    if (LEVEL_ORDER[level] < threshold) return;
    const ctx = getContext();
    const record = {
      timestamp: new Date().toISOString(),
      level,
      service,
      environment: env.APP_ENV,
      event,
      requestId: ctx?.requestId,
      userId: ctx?.userId,
      workspaceId: ctx?.workspaceId,
      analysisId: ctx?.analysisId,
      taskId: ctx?.taskId,
      ...(redact(base) as LogFields),
      ...(redact(fields ?? {}) as LogFields),
    };
    const line = JSON.stringify(record);
    if (level === 'error') process.stderr.write(`${line}\n`);
    else process.stdout.write(`${line}\n`);
  }

  const logger: Logger = {
    child(fields) {
      return createLogger(service, { ...base, ...fields });
    },
    debug: (event, fields) => emit('debug', event, fields),
    info: (event, fields) => emit('info', event, fields),
    warn: (event, fields) => emit('warn', event, fields),
    error: (event, fields) => emit('error', event, fields),
  };
  return logger;
}
