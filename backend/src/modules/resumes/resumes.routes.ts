import { Router, Request, Response, NextFunction } from 'express';
import { resumesController } from './resumes.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { handleUpload, resumeIdParamValidation, applySkillsValidation } from './resumes.validation';
import { validate } from '../../middleware/validate.middleware';

const router = Router();

// ─── POST /api/v1/resumes/upload ──────────────────────────────────────────────
router.post(
  '/upload',
  authenticate,
  handleUpload,
  (req: Request, res: Response, next: NextFunction) => resumesController.upload(req, res, next),
);

// ─── GET /api/v1/resumes ──────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => resumesController.list(req, res, next),
);

// ─── GET /api/v1/resumes/:id ──────────────────────────────────────────────────
router.get(
  '/:id',
  authenticate,
  ...resumeIdParamValidation,
  validate,
  (req: Request, res: Response, next: NextFunction) => resumesController.getById(req, res, next),
);

// ─── POST /api/v1/resumes/:id/apply-skills ────────────────────────────────────
router.post(
  '/:id/apply-skills',
  authenticate,
  ...applySkillsValidation,
  validate,
  (req: Request, res: Response, next: NextFunction) => resumesController.applySkills(req, res, next),
);

// ─── DELETE /api/v1/resumes/:id ───────────────────────────────────────────────
router.delete(
  '/:id',
  authenticate,
  ...resumeIdParamValidation,
  validate,
  (req: Request, res: Response, next: NextFunction) => resumesController.delete(req, res, next),
);

export default router;
