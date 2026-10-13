// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  createdAt: string;
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export interface StudentProfile {
  userId: string;
  degree: string;
  branch: string;
  year: number;
  cgpa?: number;
  bio?: string;
  skills: UserSkill[];
  careerGoal?: string;
  weeklyLearningHours: number;
}

export interface UserSkill {
  skillId: string;
  name: string;
  level: number; // 0-100
  lastAssessedAt?: string;
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
