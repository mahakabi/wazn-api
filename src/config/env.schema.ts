import { z } from 'zod';

const MIN_SECRET_LENGTH = 32;

const optionalString = z.string().trim().optional().default('');

/**
 * Single source of truth for environment variables. The app refuses to boot when
 * anything required is missing or malformed, instead of failing later at runtime.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),

  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }),

  JWT_ACCESS_SECRET: z.string().min(MIN_SECRET_LENGTH),
  JWT_REFRESH_SECRET: z.string().min(MIN_SECRET_LENGTH),
  OTP_SECRET: z.string().min(MIN_SECRET_LENGTH),

  // Defaults point at Mailpit from docker-compose (UI: http://localhost:8025).
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  MAIL_FROM: z.string().default('Wazn <no-reply@wazn.local>'),

  WHATSAPP_TOKEN: optionalString,
  WHATSAPP_PHONE_ID: optionalString,
  GOOGLE_MAPS_KEY: optionalString,
  S3_ENDPOINT: optionalString,
  S3_BUCKET: optionalString,
  S3_KEY: optionalString,
  S3_SECRET: optionalString,
  LLM_API_KEY: optionalString,
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return result.data;
}
