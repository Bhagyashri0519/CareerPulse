import mongoose, { Document, Schema, Model } from 'mongoose';
import { IEducationEntry, IWorkExperienceEntry } from './extractors/structured.extractor';

export interface IClaimedSkill {
  canonicalId: string;
  name: string;
  category: string;
  matchedAlias: string;
  confidence: number;
  contextSnippet: string;
  isImported: boolean;
}

export interface IExtractedSections {
  education: string[];
  experience: string[];
  projects: string[];
  skills: string[];
  certifications: string[];
  structuredExperience?: IWorkExperienceEntry[];
  structuredEducation?: IEducationEntry[];
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileSize: number;
  mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  parseStatus: 'pending' | 'processing' | 'completed' | 'failed';
  rawTextLength: number;
  extractedSections: IExtractedSections;
  claimedSkills: IClaimedSkill[];
  errorMessage?: string | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimedSkillSchema = new Schema<IClaimedSkill>(
  {
    canonicalId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    matchedAlias: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    contextSnippet: { type: String, required: true, maxlength: 500 },
    isImported: { type: Boolean, default: false },
  },
  { _id: false },
);

const WorkExperienceEntrySchema = new Schema<IWorkExperienceEntry>(
  {
    role: { type: String, trim: true },
    organization: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ['full-time', 'internship', 'contract', 'part-time', 'unknown'],
      default: 'unknown',
    },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true },
    rawText: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const EducationEntrySchema = new Schema<IEducationEntry>(
  {
    degree: { type: String, trim: true },
    institution: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: String, trim: true },
    endYear: { type: String, trim: true },
    grade: { type: String, trim: true },
    currentStatus: { type: String, trim: true },
    rawText: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const ExtractedSectionsSchema = new Schema<IExtractedSections>(
  {
    education: { type: [String], default: [] },
    experience: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    structuredExperience: { type: [WorkExperienceEntrySchema], default: [] },
    structuredEducation: { type: [EducationEntrySchema], default: [] },
  },
  { _id: false },
);

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
      max: 10 * 1024 * 1024, // 10MB maximum
    },
    mimeType: {
      type: String,
      required: true,
      enum: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    parseStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
    },
    rawTextLength: {
      type: Number,
      required: true,
      default: 0,
    },
    extractedSections: {
      type: ExtractedSectionsSchema,
      default: () => ({
        education: [],
        experience: [],
        projects: [],
        skills: [],
        certifications: [],
      }),
    },
    claimedSkills: {
      type: [ClaimedSkillSchema],
      default: [],
    },
    errorMessage: {
      type: String,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'resumes',
  },
);

ResumeSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id ? ret._id.toString() : undefined;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Resume: Model<IResume> = mongoose.model<IResume>('Resume', ResumeSchema);
export default Resume;
