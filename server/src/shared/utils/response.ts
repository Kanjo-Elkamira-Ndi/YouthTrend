import { Response } from 'express';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  ApiError;
  meta?:   PaginationMeta;
}

export interface ApiError {
  code:    string;
  message: string;
  errors?: Record<string, string[]>;  // field-level validation errors
}

export interface PaginationMeta {
  page:        number;
  perPage:     number;
  total:       number;
  totalPages:  number;
  hasNext:     boolean;
  hasPrev:     boolean;
}

// ── Success responses ─────────────────────────────────────────────────────────
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
  } satisfies ApiResponse<T>);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

// ── Paginated response ────────────────────────────────────────────────────────
export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
): Response {
  // Also set headers so clients can read them without parsing the body
  res.setHeader('X-Total-Count', meta.total);
  res.setHeader('X-Page',        meta.page);
  res.setHeader('X-Per-Page',    meta.perPage);

  return res.status(200).json({
    success: true,
    data,
    meta,
  } satisfies ApiResponse<T[]>);
}

// ── Pagination helpers ────────────────────────────────────────────────────────
export function parsePagination(
  query: Record<string, unknown>,
  maxPerPage = 50,
): { page: number; perPage: number; offset: number } {
  const page    = Math.max(1, parseInt(String(query.page    ?? 1),  10));
  const perPage = Math.min(
    maxPerPage,
    Math.max(1, parseInt(String(query.perPage ?? 20), 10)),
  );
  return { page, perPage, offset: (page - 1) * perPage };
}

export function buildMeta(
  page: number,
  perPage: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / perPage);
  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ── Error response ────────────────────────────────────────────────────────────
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  errors?: Record<string, string[]>,
): Response {
  return res.status(statusCode).json({
    success: false,
    error: { code, message, ...(errors ? { errors } : {}) },
  } satisfies ApiResponse);
}