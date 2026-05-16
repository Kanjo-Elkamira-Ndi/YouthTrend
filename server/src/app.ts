import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';

import { corsOptions } from './config/cors';
import { auth } from './config/auth';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { defaultLimiter } from './middleware/rateLimiter';
import { authLimiter } from './middleware/rateLimiter';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import campusRoutes from './modules/campus/campus.routes';
import usersRoutes from './modules/users/users.routes';
import postsRoutes from './modules/posts/posts.routes';
import commentsRoutes from './modules/comments/comments.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import moderationRoutes   from './modules/moderation/moderation.routes';
import writerUpgradeRoutes from './modules/writer-upgrade/writer-upgrade.routes';
import announcementsRoutes from './modules/announcements/announcements.routes';
import searchRoutes from './modules/search/search.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
export function createApp(): Application {
  const app = express();

  // ── Security ────────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors(corsOptions));
  app.options('/{*path}', cors(corsOptions));

  // ── Body / cookies ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // ── Logging ─────────────────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── Better Auth — handles /api/auth/* ───────────────────────────────────────
  // Must be mounted BEFORE the global rate limiter so auth endpoints
  // can use their own stricter limiter below.
  app.use('/api/auth', authLimiter, (req, res) => {
    if (env.NODE_ENV === 'development' && !req.headers.origin) {
      req.headers.origin = new URL(env.BETTER_AUTH_URL).origin;
    }

    toNodeHandler(auth)(req, res);
  });

  // ── Global rate limiter for all other API routes ────────────────────────────
  app.use('/api', defaultLimiter);

  // ── Application routes ───────────────────────────────────────────────────────
  app.use('/health', healthRoutes);
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/campuses', campusRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/posts', postsRoutes);
  app.use('/api/v1', commentsRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);
  app.use('/api/v1/moderation',       moderationRoutes);
  app.use('/api/v1/writer-upgrade',   writerUpgradeRoutes);
  app.use('/api/v1/announcements',   announcementsRoutes);
  app.use('/api/v1/search',          searchRoutes);
  app.use('/api/v1/analytics',       analyticsRoutes);
  // ── 404 + error handlers ────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
