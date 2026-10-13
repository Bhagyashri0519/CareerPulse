import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/api-response';

/**
 * validate — run after express-validator chain.
 * Returns 422 with formatted errors if any validation rule failed.
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'Validation failed', 422, errors.array());
    return;
  }
  next();
}
