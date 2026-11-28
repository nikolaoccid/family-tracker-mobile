import { z, type ZodType } from 'zod';

/** Optional field that also accepts `null` (the server serialises missing columns as null). */
export const opt = <T extends ZodType>(schema: T) =>
  schema
    .nullish()
    .transform((value) => value ?? undefined)
    .optional();

/**
 * Open enum: known values pass through, anything the server adds later maps to
 * `fallback` so the app never crashes on a value it has not seen.
 */
export const openEnum = <const V extends readonly string[], F extends string>(values: V, fallback: F) =>
  z
    .string()
    .nullish()
    .transform((value): V[number] | F =>
      value && (values as readonly string[]).includes(value) ? (value as V[number]) : fallback,
    );

/** Numbers that the server may send as numeric strings (Postgres `numeric`/`decimal` columns). */
export const numeric = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
  z.number(),
);
