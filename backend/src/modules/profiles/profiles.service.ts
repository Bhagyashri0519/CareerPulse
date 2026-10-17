import { Types } from 'mongoose';
import {
  StudentProfile,
  IStudentProfile,
  IUserSkill,
  ISkillAssessmentEvidence,
  computeTier,
} from './profile.model';
import { NotFoundError } from '../../utils/errors';

export interface UpdateProfileDTO {
  degree?: string;
  branch?: string;
  year?: number;
  cgpa?: number | null;
  bio?: string;
  targetRoleId?: string | null;
  weeklyLearningHours?: number;
}

export interface SkillUpdateInput {
  canonicalId: string;
  level: number;
  name?: string;
  category?: string;
}

function formatSkillName(canonicalId: string): string {
  const parts = canonicalId.replace(/^skill_([a-z0-9]+_)?/, '').split(/[-_]/);
  return parts
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export class ProfilesService {
  async getProfileByUserId(userId: string): Promise<IStudentProfile> {
    const profile = await StudentProfile.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!profile) {
      // Auto-create initial profile if not found
      return StudentProfile.create({
        userId: new Types.ObjectId(userId),
        degree: 'B.Tech',
        branch: 'Computer Science',
        year: 1,
        weeklyLearningHours: 10,
        skills: [],
      });
    }

    return profile;
  }

  async updateProfileByUserId(
    userId: string,
    updateData: UpdateProfileDTO,
  ): Promise<IStudentProfile> {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true, runValidators: true, upsert: true },
    );

    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    return profile;
  }

  async updateUserSkills(
    userId: string,
    skillsInput: SkillUpdateInput[],
  ): Promise<IUserSkill[]> {
    const profile = await this.getProfileByUserId(userId);

    for (const input of skillsInput) {
      const tier = computeTier(input.level);
      const evidenceRecord: ISkillAssessmentEvidence = {
        source: 'self_report',
        score: input.level,
        verifiedStatus: 'unverified',
        recordedAt: new Date(),
      };

      const existingSkill = profile.skills.find(
        (s) => s.canonicalId === input.canonicalId,
      );

      if (existingSkill) {
        existingSkill.level = input.level;
        existingSkill.tier = tier;
        existingSkill.lastAssessedAt = new Date();
        if (input.name) existingSkill.name = input.name;
        if (input.category) existingSkill.category = input.category;
        existingSkill.evidence.push(evidenceRecord);
      } else {
        const newSkill: IUserSkill = {
          canonicalId: input.canonicalId,
          name: input.name || formatSkillName(input.canonicalId),
          category: input.category || 'general',
          level: input.level,
          tier,
          lastAssessedAt: new Date(),
          evidence: [evidenceRecord],
        };
        profile.skills.push(newSkill);
      }
    }

    await profile.save();
    return profile.skills;
  }
}

export const profilesService = new ProfilesService();
export default profilesService;
