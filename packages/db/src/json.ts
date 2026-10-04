import type { z } from 'zod';
import type { JsonValue } from '@sift/types';

/**
 * JSON column helpers.
 *
 * SQLite (the local-first default) does not support Prisma's `Json` scalar, so
 * JSON is stored as `String`. All reads/writes go through these helpers which
 * (optionally) validate with a Zod schema so a malformed row can never silently
 * become trusted application state (TPRD §38).
 */

export function toJsonString(value: JsonValue | unknown): string {
  return JSON.stringify(value ?? null);
}

export function parseJson<T = JsonValue>(raw: string | null | undefined, fallback: T): T {
  if (raw === null || raw === undefined || raw === '') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Parse and validate. Throws when the stored value violates the schema. */
export function parseJsonValidated<S extends z.ZodTypeAny>(
  raw: string | null | undefined,
  schema: S,
): z.infer<S> {
  const parsed = parseJson<unknown>(raw, null);
  return schema.parse(parsed);
}

/** Parse when valid, otherwise return the fallback (never throws). */
export function parseJsonSafe<S extends z.ZodTypeAny>(
  raw: string | null | undefined,
  schema: S,
  fallback: z.infer<S>,
): z.infer<S> {
  const result = schema.safeParse(parseJson<unknown>(raw, null));
  return result.success ? result.data : fallback;
}
