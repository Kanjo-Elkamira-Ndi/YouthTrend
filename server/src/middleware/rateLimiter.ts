import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Default rate limiter — applied globally to all API routes.
 * 100 requests per 15 minutes per IP.
 */
export const defaultLimiter = rateLimit({
  windowMs:         env.RATE_LIMIT_WINDOW_MS,
  max:              env.RATE_LIMIT_MAX,
  standardHeaders:  true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders:    false,
  message: {
    success: false,
    error: {
      code:    'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Please try again later.',
    },
  },
  skip: () => env.NODE_ENV === 'test',
});

/**
 * Strict limiter for auth endpoints (login, register, forgot-password).
 * 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             env.NODE_ENV === 'development' ? 100 : 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: {
      code:    'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
  },
  skip: () => env.NODE_ENV === 'test',
});

/**
 * Search limiter — 20 requests per minute.
 */
export const searchLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    error: {
      code:    'TOO_MANY_REQUESTS',
      message: 'Search rate limit exceeded. Please slow down.',
    },
  },
  skip: () => env.NODE_ENV === 'test',
});