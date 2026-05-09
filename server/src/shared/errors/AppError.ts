// ── Base application error ────────────────────────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code:       string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code      = 'INTERNAL_ERROR',
    isOperational = true,
  ) {
    super(message);
    this.name          = this.constructor.name;
    this.statusCode    = statusCode;
    this.code          = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── 400 ───────────────────────────────────────────────────────────────────────
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;
  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

// ── 401 ───────────────────────────────────────────────────────────────────────
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// ── 403 ───────────────────────────────────────────────────────────────────────
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

// ── 404 ───────────────────────────────────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// ── 409 ───────────────────────────────────────────────────────────────────────
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

// ── 429 ───────────────────────────────────────────────────────────────────────
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

// ── 500 ───────────────────────────────────────────────────────────────────────
export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, 'INTERNAL_ERROR', false);
  }
}