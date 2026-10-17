import { Request, Response, NextFunction } from 'express';
import { resumesService } from './resumes.service';
import { sendSuccess } from '../../utils/api-response';

export class ResumesController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resume = await resumesService.processAndSaveResume(
        req.user!.userId,
        req.file!,
      );
      sendSuccess(res, resume, 'Resume uploaded and parsed successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resumes = await resumesService.getResumesByUserId(req.user!.userId);
      sendSuccess(res, resumes, 'Resumes retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resume = await resumesService.getResumeById(
        req.user!.userId,
        req.params.id,
        req.user?.role,
      );
      sendSuccess(res, resume, 'Resume retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await resumesService.deleteResume(
        req.user!.userId,
        req.params.id,
        req.user?.role,
      );
      sendSuccess(res, result, 'Resume deleted successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async applySkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const skillIds: string[] = req.body?.skillIds || req.body?.canonicalSkillIds;
      const result = await resumesService.applySkillsToProfile(
        req.user!.userId,
        req.params.id,
        skillIds,
        req.user?.role,
      );
      sendSuccess(res, result, 'Selected skills imported to profile successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const resumesController = new ResumesController();
export default resumesController;
