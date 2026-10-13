import { Response } from 'express';
import { ApiResponse } from '../types/common.types';

/**
 * Send standard successful JSON response.
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  meta?: Record<string, unknown>,
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(payload);
}

/**
 * Send standard error JSON response.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown[],
): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
  };
  return res.status(statusCode).json(payload);
}
