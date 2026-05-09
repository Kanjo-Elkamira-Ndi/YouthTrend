import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express route handler so any thrown error
 * is automatically forwarded to next() — no try/catch needed
 * in every controller.
 *
 * Usage:
 *   router.get('/me', asyncHandler(async (req, res) => {
 *     const user = await UserService.findById(req.user.id);
 *     sendSuccess(res, user);
 *   }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>,
): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };