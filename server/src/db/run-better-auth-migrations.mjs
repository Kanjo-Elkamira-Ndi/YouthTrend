/**
 * run-better-auth-migrations.mjs
 *
 * Creates/updates Better Auth's tables using the official public API.
 * Run:  node src/db/run-better-auth-migrations.mjs
 *
 * Env vars are loaded by dotenvx (if installed) automatically,
 * or by dotenv as a fallback. Either way this script reads from
 * process.env - no manual dotenv.config() call needed.
 */

import { getMigrations }  from 'better-auth/db/migration';
import { betterAuth }     from 'better-auth';
import { PostgresDialect } from 'kysely';
import pg    from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Load env (plain dotenv as fallback if dotenvx hasn't already loaded it) ──
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath   = join(__dirname, '../../.env');

// Only call dotenv.config if dotenvx hasn't already injected the vars
// dotenvx sets process.env.DOTENVX_VERSION when it runs
if (!process.env.DOTENVX_VERSION && !process.env.DATABASE_URL) {
  const { config } = dotenv;
  config({ path: envPath });
}

// ── Validate required env vars ────────────────────────────────────────────────
const DATABASE_URL        = process.env.DATABASE_URL;
const BETTER_AUTH_SECRET  = process.env.BETTER_AUTH_SECRET;
const BETTER_AUTH_URL     = process.env.BETTER_AUTH_URL || 'http://localhost:4000';

if (!DATABASE_URL) {
  console.error('[BetterAuth] ERROR: DATABASE_URL is not set in environment.');
  console.error('             Make sure your .env file exists and contains DATABASE_URL.');
  process.exit(1);
}

if (!BETTER_AUTH_SECRET) {
  console.error('[BetterAuth] ERROR: BETTER_AUTH_SECRET is not set in environment.');
  process.exit(1);
}

// ── Build minimal auth instance for migration purposes only ──────────────────
const { Pool } = pg;

const auth = betterAuth({
  secret:   BETTER_AUTH_SECRET,
  baseURL:  BETTER_AUTH_URL,
  database: {
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString: DATABASE_URL }),
    }),
    type: 'postgres',
  },
  emailAndPassword: {
    enabled: true,
    sendVerificationEmail: async () => {},
    sendResetPassword:     async () => {},
  },
  emailVerification: {
    sendOnSignUp:          false,
    sendVerificationEmail: async () => {},
  },
  // NOTE: additionalFields intentionally omitted here.
  // The campusId and ytRole columns are added manually via
  // better-auth-schema.sql or via a separate ALTER TABLE after
  // the base tables are created.
});

// ── Run migrations ────────────────────────────────────────────────────────────
try {
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);

  const hasWork =
    (toBeCreated && toBeCreated.length > 0) ||
    (toBeAdded   && toBeAdded.length   > 0);

  if (!hasWork) {
    console.log('[BetterAuth] All tables already up to date.');
    process.exit(0);
  }

  if (toBeCreated?.length > 0) {
    console.log('[BetterAuth] Creating tables:', toBeCreated.map(t => t.table).join(', '));
  }
  if (toBeAdded?.length > 0) {
    console.log('[BetterAuth] Adding columns:', toBeAdded.map(t => `${t.table}.${Object.keys(t.fields).join(', ')}`).join(' | '));
  }

  await runMigrations();
  console.log('[BetterAuth] Base tables created successfully.');

  // ── Add campusId and ytRole columns to the user table ────────────────────
  // These are our custom fields. We add them via raw SQL after Better Auth
  // creates its base tables, avoiding the additionalFields type issue entirely.
  const pool2 = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool2.query(`
      ALTER TABLE "user"
        ADD COLUMN IF NOT EXISTS "campusId" TEXT,
        ADD COLUMN IF NOT EXISTS "ytRole"   TEXT NOT NULL DEFAULT 'reader'
    `);
    console.log('[BetterAuth] Added campusId and ytRole columns to user table.');
  } finally {
    await pool2.end();
  }

  process.exit(0);

} catch (err) {
  console.error('[BetterAuth] Migration failed:', err.message);
  if (err.message?.includes('password authentication')) {
    console.error('             Check your DATABASE_URL credentials in .env');
  }
  if (err.message?.includes('does not exist')) {
    console.error('             Make sure the database exists. Run in DBeaver:');
    console.error('             CREATE DATABASE youthtrend_dev;');
  }
  process.exit(1);
}
