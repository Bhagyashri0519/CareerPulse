import { Router, Request, Response, NextFunction } from 'express';
import { profilesController } from './profiles.controller';
import {
  updateProfileValidation,
  updateSkillsValidation,
} from './profiles.validation';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const profilesRouter = Router();

profilesRouter.get(
  '/me',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    profilesController.getMe(req, res, next);
  },
);

profilesRouter.put(
  '/me',
  authenticate,
  updateProfileValidation,
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    profilesController.updateMe(req, res, next);
  },
);

profilesRouter.patch(
  '/me/skills',
  authenticate,
  updateSkillsValidation,
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    profilesController.updateSkills(req, res, next);
  },
);

export default profilesRouter;
