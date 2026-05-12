import { execSync }     from 'child_process';
import * as path        from 'path';
import { createApp }    from './app';
import { env }          from './config/env';
import { pool, pingDb } from './config/db';

async function bootstrap(): Promise<void> {
  console.log('\n[YouthTrend] Starting server...');
  console.log(`[YouthTrend] Environment: ${env.NODE_ENV}`);

  // ── 1. Verify PostgreSQL is reachable ─────────────────────────────────────
  const dbOk = await pingDb();
  if (!dbOk) {
    console.error('[YouthTrend] ❌  Cannot connect to PostgreSQL.');
    console.error('[YouthTrend]    Check DATABASE_URL in your .env file.');
    process.exit(1);
  }
  console.log('[YouthTrend] ✓  PostgreSQL connected.');

  // ── 2. Auto-run Better Auth schema migrations ─────────────────────────────
  // Runs an ESM child process that calls getMigrations → runMigrations.
  // This creates user / session / account / verification tables with the
  // correct camelCase column names Better Auth expects.
  console.log('[YouthTrend]    Syncing Better Auth schema...');
  try {
    const scriptPath = path.join(__dirname, 'db', 'run-better-auth-migrations.mjs');
    execSync(`node "${scriptPath}"`, {
      stdio:  'inherit',
      env:    process.env,
      timeout: 30_000,
    });
    console.log('[YouthTrend] ✓  Better Auth schema synced.');
  } catch (err) {
    // If the script exits 1 it already logged the error — just warn here.
    console.warn('[YouthTrend] ⚠  Better Auth schema sync failed (see above).');
    console.warn('[YouthTrend]    Manually run: node src/db/run-better-auth-migrations.mjs');
    console.warn('[YouthTrend]    Or paste src/db/better-auth-schema.sql into DBeaver.\n');
  }

  // ── 3. Start Express ───────────────────────────────────────────────────────
  const app    = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[YouthTrend] ✓  Server: http://localhost:${env.PORT}`);
    console.log(`[YouthTrend] ✓  Health: http://localhost:${env.PORT}/health`);
    console.log(`[YouthTrend] ✓  Auth:   http://localhost:${env.PORT}/api/auth`);
    console.log(`[YouthTrend] ✓  API:    http://localhost:${env.PORT}/api/v1\n`);
  });

  // ── 4. Graceful shutdown ───────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[YouthTrend] ${signal} — shutting down gracefully...`);
    server.close(async () => {
      await pool.end();
      console.log('[YouthTrend] Goodbye. 👋');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('[YouthTrend] Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[YouthTrend] Uncaught exception:', err);
    shutdown('uncaughtException').catch(() => process.exit(1));
  });
}

bootstrap();