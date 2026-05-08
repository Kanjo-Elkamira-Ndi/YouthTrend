import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// ── Schema ────────────────────────────────────────────────────────────────────
const envSchema = z.object({
  PORT:         z.string().default('4000').transform(Number),
  NODE_ENV:     z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET:             z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_EXPIRES_IN:         z.string().default('15m'),
  JWT_REFRESH_SECRET:     z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  BCRYPT_ROUNDS: z.string().default('12').transform(Number),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  SMTP_HOST:  z.string().optional(),
  SMTP_PORT:  z.string().default('587').transform(Number),
  SMTP_USER:  z.string().optional(),
  SMTP_PASS:  z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@youthtrend.cm'),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX:       z.string().default('100').transform(Number),
});

// ── Parse & validate ──────────────────────────────────────────────────────────
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('');
  console.error('❌  Invalid environment variables — server cannot start.');
  console.error('');
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${String(issue.path.join('.'))} — ${issue.message}`);
  });
  console.error('');
  console.error('   Copy .env.example to .env and fill in the missing values.');
  console.error('');
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;