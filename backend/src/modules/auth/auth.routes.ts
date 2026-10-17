import { Router, Request, Response, NextFunction } from 'express';
import { authController } from './auth.controller';
import { registerValidation, loginValidation } from './auth.validation';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const authRouter = Router();

authRouter.post(
  '/register',
  registerValidation,
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    authController.register(req, res, next);
  },
);

authRouter.post(
  '/login',
  loginValidation,
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    authController.login(req, res, next);
  },
);

authRouter.get(
  '/me',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    authController.getMe(req, res, next);
  },
);

export default authRouter;
