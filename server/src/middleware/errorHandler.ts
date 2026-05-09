import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../shared/errors/AppError';
import { sendError } from '../shared/utils/response';
import { env } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  // ── AppError ─────────────────────────────────────────────────────────────────
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      return sendError(res, err.statusCode, err.code, err.message, err.errors);
    }
    if (!err.isOperational && env.NODE_ENV !== 'production') {
      console.error('[Unhandled Error]', err);
    }
    return sendError(res, err.statusCode, err.code, err.message);
  }

  // ── Plain objects thrown by validate() ────────────────────────────────────────
  if (err instanceof Error && 'statusCode' in err && 'code' in err) {
    const e = err as Error & { statusCode: number; code: string; errors?: Record<string, string[]> };
    return sendError(res, e.statusCode, e.code, e.message, e.errors);
  }

  // ── Zod errors ────────────────────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.issues.forEach((issue) => {
      const key = issue.path.map(String).join('.') || 'root';
      if (!errors[key]) errors[key] = [];
      errors[key].push(issue.message);
    });
    return sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', errors);
  }

  // ── PostgreSQL errors ─────────────────────────────────────────────────────────
  if (err instanceof Error && 'code' in err) {
    const pgErr = err as Error & { code: string };
    if (pgErr.code === '23505') return sendError(res, 409, 'CONFLICT', 'A record with this value already exists.');
    if (pgErr.code === '23503') return sendError(res, 400, 'FOREIGN_KEY_VIOLATION', 'Referenced resource does not exist.');
    if (pgErr.code === '23502') return sendError(res, 400, 'NOT_NULL_VIOLATION', 'A required field is missing.');
  }

  // ── CORS errors ───────────────────────────────────────────────────────────────
  if (err instanceof Error && err.message.startsWith('CORS:')) {
    return sendError(res, 403, 'CORS_ERROR', err.message);
  }

  // ── Fallback ──────────────────────────────────────────────────────────────────
  if (err instanceof Error && env.NODE_ENV !== 'production') {
    console.error('[Unexpected Error]', err);
  }

  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : (err instanceof Error ? err.message : 'An unexpected error occurred.'),
  );
}