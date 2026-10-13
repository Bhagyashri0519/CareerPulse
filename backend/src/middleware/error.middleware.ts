import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/api-response';

/**
 * Global Express Error Handling Middleware.
 * Catches operational and unhandled exceptions and returns uniform JSON responses.
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Operational AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const mongooseErrors = Object.values((err as unknown as { errors: Record<string, { message: string }> }).errors || {}).map(
      (e) => e.message,
    );
    sendError(res, 'Database validation failed', 422, mongooseErrors);
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if ((err as unknown as { code?: number }).code === 11000) {
    sendError(res, 'Duplicate key error: resource already exists', 409);
    return;
  }

  // JSON parse error (malformed request body)
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 'Malformed JSON in request body', 400);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token. Authorization denied.', 401);
    return;
  }
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token has expired. Please log in again.', 401);
    return;
  }

  // Unhandled / server errors
  console.error('[Unhandled Server Error]', err);
  const isDev = process.env.NODE_ENV === 'development';
  sendError(
    res,
    isDev ? err.message : 'Internal server error',
    500,
    isDev && err.stack ? [err.stack] : undefined,
  );
}
