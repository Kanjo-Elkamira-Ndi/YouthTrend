import { Router, Request, Response } from 'express';
import { pingDb } from '../../config/db';
import { env } from '../../config/env';

const router = Router();

/**
 * GET /health
 *
 * Returns server status and database connectivity.
 * Used by load balancers, monitoring tools, and the
 * Phase B1 checkpoint test.
 */
router.get('/', async (_req: Request, res: Response) => {
  const dbOk = await pingDb();

  const status = {
    status:    dbOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
    env:        env.NODE_ENV,
    services: {
      database: {
        status:  dbOk ? 'connected' : 'unreachable',
        message: dbOk ? 'PostgreSQL connection pool is healthy' : 'Cannot reach PostgreSQL',
      },
      server: {
        status:  'running',
        uptime:  `${Math.floor(process.uptime())}s`,
        memory:  `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
    },
  };

  res.status(dbOk ? 200 : 503).json(status);
});

/**
 * GET /health/ping
 * Ultra-lightweight — just confirms the process is alive.
 */
router.get('/ping', (_req: Request, res: Response) => {
  res.status(200).json({ pong: true, ts: Date.now() });
});

export default router;