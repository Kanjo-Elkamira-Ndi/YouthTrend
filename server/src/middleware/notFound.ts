import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../shared/errors/AppError';

/**
 * Catch-all middleware for routes that don't match any handler.
 * Must be registered after all routes, before errorHandler.
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(new NotFoundError(`Route '${req.method} ${req.originalUrl}'`));
}