import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

/**
 * Load the nearest `.env` file walking up from the current working directory.
 * This makes `@sift/config` work whether it is imported from `apps/api`,
 * `apps/worker`, or the repo root. Next.js already loads env files itself, so
 * this is a harmless no-op there.
 */
function loadEnvFiles(): void {
  let dir = process.cwd();
  for (let i = 0; i < 6; i += 1) {
    const candidate = resolve(dir, '.env');
    if (existsSync(candidate)) {
      loadDotenv({ path: candidate });
      return;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

loadEnvFiles();

const booleanish = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1' || v === 'yes');

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['local', 'test', 'staging', 'production']).default('local'),

  WEB_BASE_URL: z.string().default('http://localhost:3000'),
  API_BASE_URL: z.string().default('http://localhost:4000'),
  API_PORT: z.coerce.number().default(4000),
  NEXT_PUBLIC_API_BASE_URL: z.string().default('http://localhost:4000'),

  AUTH_SECRET: z.string().min(1).default('dev_auth_secret_change_me'),
  SESSION_COOKIE_NAME: z.string().default('sift_session'),
  SESSION_TTL_HOURS: z.coerce.number().default(168),
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,

  DATABASE_URL: z.string().default('file:./dev.db'),
  DB_PROVIDER: z.enum(['sqlite', 'postgresql']).default('sqlite'),

  QUEUE_DRIVER: z.enum(['memory', 'redis']).default('memory'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  LLM_PROVIDER: z.string().default('placeholder'),
  LLM_PROVIDER_KEY: optionalString,
  LLM_DEFAULT_MODEL: z.string().default('placeholder-reasoning'),
  LLM_FAST_MODEL: z.string().default('placeholder-fast'),

  SEARCH_PROVIDER: z.string().default('placeholder'),
  SEARCH_PROVIDER_KEY: optionalString,

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_BUCKET: z.string().default('sift-dev'),
  STORAGE_ACCESS_KEY: optionalString,
  STORAGE_SECRET_KEY: optionalString,
  STORAGE_ENDPOINT: optionalString,

  BILLING_PROVIDER: z.enum(['placeholder', 'stripe']).default('placeholder'),
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  STRIPE_PRICE_ONE_TIME: optionalString,
  STRIPE_PRICE_PRO: optionalString,

  FREE_ANALYSES_PER_ACCOUNT: z.coerce.number().default(2),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SENTRY_DSN: optionalString,

  FF_CHALLENGE_MODE: booleanish,
  FF_EXPERIMENT_WORKSPACE: booleanish,
  FF_PDF_EXPORT: booleanish,
  FF_GOOGLE_AUTH: booleanish,
  FF_BILLING: booleanish,
  FF_COLLABORATION: booleanish,
  FF_ADVANCED_RESEARCH: booleanish,
});

export type Env = z.infer<typeof envSchema>;

let parsed: Env;
try {
  parsed = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const details = error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  throw error;
}

export const env: Env = parsed;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Feature flags are server-authoritative (TPRD §86). The defaults below are
 * only used when the corresponding env var is not set.
 */
export const flags = {
  CHALLENGE_MODE: env.FF_CHALLENGE_MODE || env.FF_CHALLENGE_MODE === undefined,
  EXPERIMENT_WORKSPACE: env.FF_EXPERIMENT_WORKSPACE || env.FF_EXPERIMENT_WORKSPACE === undefined,
  PDF_EXPORT: env.FF_PDF_EXPORT || env.FF_PDF_EXPORT === undefined,
  GOOGLE_AUTH: Boolean(env.FF_GOOGLE_AUTH && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  BILLING: env.FF_BILLING || env.FF_BILLING === undefined,
  COLLABORATION: Boolean(env.FF_COLLABORATION),
  ADVANCED_RESEARCH: Boolean(env.FF_ADVANCED_RESEARCH),
} as const;

export type FeatureFlag = keyof typeof flags;
