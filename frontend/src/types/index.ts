// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  createdAt?: string;
}

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

export interface SkillAssessmentEvidence {
  source: EvidenceSource;
  sourceId?: string | null;
  score: number;
  verifiedStatus: VerifiedStatus;
  recordedAt: string;
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export interface StudentProfile {
  id?: string;
  userId: string;
  degree: string;
  branch: string;
  year: number;
  cgpa?: number | null;
  bio?: string;
  targetRoleId?: string | null;
  careerGoal?: string;
  weeklyLearningHours: number;
  skills: UserSkill[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSkill {
  skillId?: string;
  canonicalId?: string;
  name: string;
  category?: string;
  level: number; // 0-100
  tier?: SkillTier;
  lastAssessedAt?: string | null;
  evidence?: SkillAssessmentEvidence[];
}

// ─── Skills & Taxonomy ───────────────────────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  tags: string[];
}

// ─── Assessment ──────────────────────────────────────────────────────────────

export interface AssessmentQuestion {
  id: string;
  text: string;
  options: string[];
  category: string;
}

export interface AssessmentResult {
  attemptId: string;
  userId: string;
  score: number;
  skillScores: Record<string, number>;
  completedAt: string;
}

// ─── Career ──────────────────────────────────────────────────────────────────

export interface CareerRole {
  id: string;
  title: string;
  description: string;
  requiredSkills: Array<{ skillId: string; name: string; minLevel: number }>;
  averageSalary?: string;
  demandLevel?: 'low' | 'medium' | 'high';
}

export interface CareerMatch {
  role: CareerRole;
  fitScore: number; // 0-100
  missingSkills: UserSkill[];
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resourceIds: string[];
  dueDate?: string;
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  careerGoal: string;
  milestones: RoadmapMilestone[];
  createdAt: string;
}

// ─── Learning Resources ───────────────────────────────────────────────────────

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  type: 'course' | 'video' | 'article' | 'project' | 'book';
  skillIds: string[];
  durationHours?: number;
  isFree: boolean;
  rating?: number;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Resume & Analysis ────────────────────────────────────────────────────────

export interface ClaimedSkill {
  canonicalId: string;
  name: string;
  category: string;
  matchedAlias: string;
  confidence: number;
  contextSnippet: string;
  isImported: boolean;
}

export interface WorkExperienceEntry {
  role?: string;
  organization?: string;
  employmentType?: 'full-time' | 'internship' | 'contract' | 'part-time' | 'unknown';
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  rawText: string;
  confidence: number;
}

export interface EducationEntry {
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string;
  grade?: string;
  currentStatus?: string;
  rawText: string;
  confidence: number;
}

export interface ExtractedSections {
  education: string[];
  experience: string[];
  projects: string[];
  skills: string[];
  certifications: string[];
  structuredExperience?: WorkExperienceEntry[];
  structuredEducation?: EducationEntry[];
}

export interface ResumeDocument {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  parseStatus: 'pending' | 'processing' | 'completed' | 'failed';
  rawTextLength: number;
  extractedSections: ExtractedSections;
  claimedSkills: ClaimedSkill[];
  errorMessage?: string | null;
  uploadedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplySkillsResult {
  resumeId: string;
  importedCount: number;
  skills: UserSkill[];
}

