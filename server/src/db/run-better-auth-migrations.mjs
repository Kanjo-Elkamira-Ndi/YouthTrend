/**
 * run-better-auth-migrations.mjs
 * 
 * Creates / updates Better Auth's tables (session, account, verification)
 * Does NOT create a 'user' table — we use your existing users table instead
 * 
 * Run once before starting the server:
 *   node src/db/run-better-auth-migrations.mjs
 */

import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// ── Load .env ─────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('[BetterAuth] Checking/creating Better Auth tables...');

    // Create session table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id"          TEXT        PRIMARY KEY,
        "expiresAt"   TIMESTAMPTZ NOT NULL,
        "token"       TEXT        NOT NULL UNIQUE,
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "ipAddress"   TEXT,
        "userAgent"   TEXT,
        "userId"      TEXT        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create account table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id"                     TEXT PRIMARY KEY,
        "accountId"              TEXT NOT NULL,
        "providerId"             TEXT NOT NULL,
        "userId"                 TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "accessToken"            TEXT,
        "refreshToken"           TEXT,
        "idToken"                TEXT,
        "accessTokenExpiresAt"   TIMESTAMPTZ,
        "refreshTokenExpiresAt"  TIMESTAMPTZ,
        "scope"                  TEXT,
        "password"               TEXT,
        "createdAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create verification table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id"          TEXT        PRIMARY KEY,
        "identifier"  TEXT        NOT NULL,
        "value"       TEXT        NOT NULL,
        "expiresAt"   TIMESTAMPTZ NOT NULL,
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "session_token_idx" ON "session" ("token")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "account_provider_idx" ON "account" ("providerId", "accountId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "verification_ident_idx" ON "verification" ("identifier")`);

    console.log('[BetterAuth] ✓ Tables ready: session, account, verification');
    console.log('[BetterAuth] ✓ Using existing users table');
    
  } catch (err) {
    console.error('[BetterAuth] Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);