import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * validate — run after express-validator chain.
 * Returns 422 with error details if any validation rule failed.
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  next();
}
