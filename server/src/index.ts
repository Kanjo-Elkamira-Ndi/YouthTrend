import { createApp } from './app';
import { env }       from './config/env';
import { pool, pingDb } from './config/db';

async function bootstrap(): Promise<void> {
  // ── Validate DB connectivity before accepting traffic ─────────────────────
  console.log('[YouthTrend] Starting server...');
  console.log(`[YouthTrend] Environment: ${env.NODE_ENV}`);

  const dbOk = await pingDb();
  if (!dbOk) {
    console.error('[YouthTrend] ❌  Cannot connect to PostgreSQL.');
    console.error('[YouthTrend]    Check DATABASE_URL in your .env file.');
    console.error('[YouthTrend]    Server will start but /health will report degraded status.');
  } else {
    console.log('[YouthTrend] ✓  PostgreSQL connected.');
  }

  // ── Create Express app ────────────────────────────────────────────────────
  const app = createApp();

  // ── Start listening ───────────────────────────────────────────────────────
  const server = app.listen(env.PORT, () => {
    console.log(`[YouthTrend] ✓  Server listening on http://localhost:${env.PORT}`);
    console.log(`[YouthTrend] ✓  Health check: http://localhost:${env.PORT}/health`);
    console.log(`[YouthTrend] ✓  API base:     http://localhost:${env.PORT}/api/v1`);
    console.log('');
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[YouthTrend] ${signal} received — shutting down gracefully...`);

    server.close(async () => {
      console.log('[YouthTrend] HTTP server closed.');

      try {
        await pool.end();
        console.log('[YouthTrend] PostgreSQL pool closed.');
        console.log('[YouthTrend] Goodbye. 👋');
        process.exit(0);
      } catch (err) {
        console.error('[YouthTrend] Error closing DB pool:', err);
        process.exit(1);
      }
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error('[YouthTrend] Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // ── Unhandled rejection / exception guards ────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    console.error('[YouthTrend] Unhandled promise rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[YouthTrend] Uncaught exception:', err);
    shutdown('uncaughtException').catch(() => process.exit(1));
  });
}

bootstrap();