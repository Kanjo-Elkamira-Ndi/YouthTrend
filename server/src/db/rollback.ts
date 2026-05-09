/**
 * YouthTrend — Rollback Runner
 *
 * Removes the last applied migration from schema_migrations
 * so you can re-run it after fixing a bug.
 *
 * NOTE: This does NOT undo DDL (PostgreSQL doesn't auto-reverse
 * DROP TABLE etc.). Use it to re-run a migration during development,
 * not to restore data in production.
 *
 * Usage:
 *   npm run db:rollback
 */

import { Pool } from 'pg';
import dotenv   from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function rollback(): Promise<void> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query<{ filename: string }>(
      `SELECT filename FROM schema_migrations
       ORDER BY applied_at DESC
       LIMIT 1`
    );

    if (rows.length === 0) {
      console.log('\n  No migrations to roll back.\n');
      return;
    }

    const last = rows[0].filename;
    await client.query('DELETE FROM schema_migrations WHERE filename = $1', [last]);
    console.log(`\n  Removed migration record: ${last}`);
    console.log('  Re-run npm run db:migrate to re-apply it.\n');
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('\n[YouthTrend] Rolling back last migration...\n');

rollback().catch((err) => {
  console.error('\n[YouthTrend] Rollback failed:', err.message);
  process.exit(1);
});