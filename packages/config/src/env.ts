import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(16),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  STORAGE_BUCKET_NAME: z.string().default('documents'),
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  ENABLE_OFFLINE_MODE: z.string().transform((val) => val === 'true').default('true'),
  ENABLE_PUSH_NOTIFICATIONS: z.string().transform((val) => val === 'true').default('false'),
  ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').default('false'),
  DEFAULT_LOCALE: z.enum(['en', 'ar']).default('en'),
  SUPPORTED_LOCALES: z.string().default('en,ar'),
  RATE_LIMIT_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(env: Record<string, string | undefined>): Env {
  return envSchema.parse(env)
}

export function getEnvConfig(): Env {
  if (typeof process === 'undefined') {
    throw new Error('Environment variables can only be accessed on the server')
  }

  return validateEnv(process.env)
}