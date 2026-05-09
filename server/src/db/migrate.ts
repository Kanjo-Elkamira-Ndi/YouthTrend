/**
 * YouthTrend — Database Migration Runner
 *
 * Runs all *.sql files in src/db/migrations/ in filename order.
 * Tracks applied migrations in a `schema_migrations` table so
 * each file runs exactly once.
 *
 * Usage:
 *   npm run db:migrate
 */

import { Pool } from 'pg';
import * as fs   from 'fs';
import * as path from 'path';
import dotenv    from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate(): Promise<void> {
  const client = await pool.connect();

  try {
    // ── Ensure tracking table exists ─────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename    TEXT        PRIMARY KEY,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // ── Read migration files in order ─────────────────────────────────────────
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();   // lexicographic — relies on numeric prefix (001_, 002_, ...)

    // ── Get already-applied migrations ────────────────────────────────────────
    const { rows } = await client.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations'
    );
    const applied = new Set(rows.map((r) => r.filename));

    let ran = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  [skip]  ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  [ok]    ${file}`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  [FAIL]  ${file}`);
        throw err;
      }
    }

    if (ran === 0) {
      console.log('\n  Database is already up to date.\n');
    } else {
      console.log(`\n  Applied ${ran} migration(s) successfully.\n`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('\n[YouthTrend] Running database migrations...\n');

migrate().catch((err) => {
  console.error('\n[YouthTrend] Migration failed:', err.message);
  if (err.detail) console.error('  Detail:', err.detail);
  if (err.hint)   console.error('  Hint:  ', err.hint);
  process.exit(1);
});