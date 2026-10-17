import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type SkillTier = 'beginner' | 'developing' | 'proficient' | 'advanced';
export type EvidenceSource =
  | 'self_report'
  | 'resume_extracted'
  | 'quiz_assessment'
  | 'project_evaluated'
  | 'course_completed';
export type VerifiedStatus =
  | 'unverified'
  | 'pending_verification'
  | 'verified'
  | 'disputed';

export interface ISkillAssessmentEvidence {
  source: EvidenceSource;
  sourceId?: string | null;
  score: number;
  verifiedStatus: VerifiedStatus;
  recordedAt: Date;
}

export interface IUserSkill {
  canonicalId: string;
  name: string;
  category: string;
  level: number;
  tier: SkillTier;
  lastAssessedAt?: Date | null;
  evidence: ISkillAssessmentEvidence[];
}

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  degree: string;
  branch: string;
  year: number;
  cgpa?: number | null;
  bio?: string;
  targetRoleId?: string | null;
  weeklyLearningHours: number;
  skills: IUserSkill[];
  createdAt: Date;
  updatedAt: Date;
}

export function computeTier(level: number): SkillTier {
  if (level <= 25) return 'beginner';
  if (level <= 50) return 'developing';
  if (level <= 75) return 'proficient';
  return 'advanced';
}

const SkillAssessmentEvidenceSchema = new Schema<ISkillAssessmentEvidence>(
  {
    source: {
      type: String,
      required: true,
      enum: [
        'self_report',
        'resume_extracted',
        'quiz_assessment',
        'project_evaluated',
        'course_completed',
      ],
    },
    sourceId: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    verifiedStatus: {
      type: String,
      enum: ['unverified', 'pending_verification', 'verified', 'disputed'],
      default: 'unverified',
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const UserSkillSchema = new Schema<IUserSkill>(
  {
    canonicalId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['beginner', 'developing', 'proficient', 'advanced'],
      default: 'beginner',
    },
    lastAssessedAt: {
      type: Date,
      default: null,
    },
    evidence: {
      type: [SkillAssessmentEvidenceSchema],
      default: [],
    },
  },
  { _id: false },
);

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    degree: {
      type: String,
      required: true,
      default: 'B.Tech',
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      default: 'Computer Science',
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 1,
    },
    cgpa: {
      type: Number,
      min: 0.0,
      max: 10.0,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
      trim: true,
    },
    targetRoleId: {
      type: String,
      default: null,
      trim: true,
    },
    weeklyLearningHours: {
      type: Number,
      required: true,
      min: 1,
      max: 60,
      default: 10,
    },
    skills: {
      type: [UserSkillSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'student_profiles',
  },
);

StudentProfileSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const StudentProfile: Model<IStudentProfile> = mongoose.model<IStudentProfile>(
  'StudentProfile',
  StudentProfileSchema,
);
export default StudentProfile;
