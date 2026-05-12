/**
 * Creates Better Auth's required tables (session, account, verification)
 * Uses your existing 'users' table for user data.
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('[BetterAuth] Creating required tables...');

    // Session table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id"          TEXT        PRIMARY KEY,
        "expires_at"  TIMESTAMPTZ NOT NULL,
        "token"       TEXT        NOT NULL UNIQUE,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "ip_address"  TEXT,
        "user_agent"  TEXT,
        "user_id"     TEXT        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Account table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id"                        TEXT PRIMARY KEY,
        "account_id"                TEXT NOT NULL,
        "provider_id"               TEXT NOT NULL,
        "user_id"                   TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "access_token"              TEXT,
        "refresh_token"             TEXT,
        "id_token"                  TEXT,
        "access_token_expires_at"   TIMESTAMPTZ,
        "refresh_token_expires_at"  TIMESTAMPTZ,
        "scope"                     TEXT,
        "password"                  TEXT,
        "created_at"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"                TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Verification table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id"          TEXT        PRIMARY KEY,
        "identifier"  TEXT        NOT NULL,
        "value"       TEXT        NOT NULL,
        "expires_at"  TIMESTAMPTZ NOT NULL,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("user_id")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "session_token_idx" ON "session" ("token")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" ("user_id")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "account_provider_idx" ON "account" ("provider_id", "account_id")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier")`);

    console.log('[BetterAuth] ✓ Tables created: session, account, verification');
    console.log('[BetterAuth] ✓ Using existing users table');
    
  } catch (err) {
    console.error('[BetterAuth] Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

createTables().catch(console.error);