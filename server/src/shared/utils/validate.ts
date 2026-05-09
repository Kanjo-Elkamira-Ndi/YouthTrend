import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type Target = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (result.success) {
      (req as unknown as Record<string, unknown>)[target] = result.data;
      next();
      return;
    }

    const errors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path.map(String).join('.') || 'root';
      if (!errors[key]) errors[key] = [];
      errors[key].push(issue.message);
    });

    const err = Object.assign(new Error('Validation failed'), {
      statusCode: 400,
      code:       'VALIDATION_ERROR',
      errors,
      isOperational: true,
    });
    next(err);
  };
}