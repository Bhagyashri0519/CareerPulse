import { Request, Response, NextFunction } from 'express';
import { profilesService } from './profiles.service';
import { sendSuccess } from '../../utils/api-response';

export class ProfilesController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await profilesService.getProfileByUserId(req.user!.userId);
      sendSuccess(res, profile, 'Profile retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await profilesService.updateProfileByUserId(
        req.user!.userId,
        req.body,
      );
      sendSuccess(res, updated, 'Profile updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  async updateSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const skills = await profilesService.updateUserSkills(
        req.user!.userId,
        req.body.skills,
      );
      sendSuccess(res, skills, 'Skills updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const profilesController = new ProfilesController();
export default profilesController;
