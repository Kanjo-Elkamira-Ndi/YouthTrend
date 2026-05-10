import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { corsOptions }     from './config/cors';
import { requestLogger }   from './middleware/requestLogger';
import { defaultLimiter }  from './middleware/rateLimiter';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler }    from './middleware/errorHandler';

import healthRoutes from './modules/health/health.routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  // REMOVED: app.options('*', cors(corsOptions)); - This line was causing the path-to-regexp error
  // CORS preflight requests are automatically handled by the cors() middleware above

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use('/api', defaultLimiter);

  app.use('/health',    healthRoutes);
  app.use('/api/v1',    healthRoutes);

  // B3+ modules will be mounted here as they are built:
  // app.use('/api/v1/auth',     authRoutes);
  // app.use('/api/v1/campuses', campusRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}