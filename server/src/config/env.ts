import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT:         z.string().default('4000').transform(Number),
  NODE_ENV:     z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Better Auth
  BETTER_AUTH_SECRET:  z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 chars'),
  BETTER_AUTH_URL:     z.string().default('http://localhost:4000'),

  // Social OAuth (optional — only required when the provider is enabled)
  GOOGLE_CLIENT_ID:     z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID:      z.string().optional(),
  FACEBOOK_APP_SECRET:  z.string().optional(),
  APPLE_CLIENT_ID:      z.string().optional(),
  APPLE_CLIENT_SECRET:  z.string().optional(),
  X_CLIENT_ID:          z.string().optional(),
  X_CLIENT_SECRET:      z.string().optional(),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Email
  SMTP_HOST:  z.string().optional(),
  SMTP_PORT:  z.string().default('587').transform(Number),
  SMTP_USER:  z.string().optional(),
  SMTP_PASS:  z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@youthtrend.cm'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX:       z.string().default('100').transform(Number),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌  Invalid environment variables — server cannot start.\n');
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${String(issue.path.join('.'))} — ${issue.message}`);
  });
  console.error('\n   Copy .env.example to .env and fill in the missing values.\n');
  process.exit(1);
}

export const env = parsed.data;
export type Env  = typeof env;