import { StudentProfile, UserSkill, ResumeDocument } from '../types';

export interface RoleBenchmark {
  roleId: string;
  title: string;
  requiredSkills: Array<{
    canonicalId: string;
    name: string;
    minLevel: number;
    weight: number;
  }>;
}

export const ROLE_BENCHMARKS: Record<string, RoleBenchmark> = {
  role_ui_ux_designer: {
    roleId: 'role_ui_ux_designer',
    title: 'UI/UX Designer',
    requiredSkills: [
      { canonicalId: 'skill_design_ui_ux', name: 'UI/UX Design', minLevel: 85, weight: 0.25 },
      { canonicalId: 'skill_design_figma', name: 'Figma', minLevel: 85, weight: 0.25 },
      { canonicalId: 'skill_design_user_research', name: 'User Research', minLevel: 80, weight: 0.20 },
      { canonicalId: 'skill_design_prototyping', name: 'Prototyping', minLevel: 85, weight: 0.15 },
      { canonicalId: 'skill_fe_html_css', name: 'HTML/CSS', minLevel: 75, weight: 0.10 },
      { canonicalId: 'skill_soft_communication', name: 'Communication', minLevel: 80, weight: 0.05 },
    ],
  },
  role_fullstack_dev: {
    roleId: 'role_fullstack_dev',
    title: 'Full Stack Developer',
    requiredSkills: [
      { canonicalId: 'skill_fe_javascript', name: 'JavaScript', minLevel: 85, weight: 0.20 },
      { canonicalId: 'skill_fe_typescript', name: 'TypeScript', minLevel: 80, weight: 0.20 },
      { canonicalId: 'skill_fe_react', name: 'React', minLevel: 80, weight: 0.20 },
      { canonicalId: 'skill_be_nodejs', name: 'Node.js', minLevel: 80, weight: 0.15 },
      { canonicalId: 'skill_be_mongodb', name: 'MongoDB', minLevel: 75, weight: 0.15 },
      { canonicalId: 'skill_soft_problem_solving', name: 'Problem Solving', minLevel: 80, weight: 0.10 },
    ],
  },
  role_fe_developer: {
    roleId: 'role_fe_developer',
    title: 'Frontend Developer',
    requiredSkills: [
      { canonicalId: 'skill_fe_html_css', name: 'HTML/CSS', minLevel: 85, weight: 0.25 },
      { canonicalId: 'skill_fe_javascript', name: 'JavaScript', minLevel: 85, weight: 0.25 },
      { canonicalId: 'skill_fe_react', name: 'React', minLevel: 80, weight: 0.25 },
      { canonicalId: 'skill_fe_typescript', name: 'TypeScript', minLevel: 75, weight: 0.15 },
      { canonicalId: 'skill_design_figma', name: 'Figma', minLevel: 65, weight: 0.10 },
    ],
  },
  role_data_analyst: {
    roleId: 'role_data_analyst',
    title: 'Data Analyst',
    requiredSkills: [
      { canonicalId: 'skill_data_sql', name: 'SQL', minLevel: 85, weight: 0.30 },
      { canonicalId: 'skill_ai_python', name: 'Python', minLevel: 80, weight: 0.30 },
      { canonicalId: 'skill_ai_machine_learning', name: 'Machine Learning', minLevel: 70, weight: 0.20 },
      { canonicalId: 'skill_soft_problem_solving', name: 'Problem Solving', minLevel: 80, weight: 0.20 },
    ],
  },
  role_data_scientist: {
    roleId: 'role_data_scientist',
    title: 'Data Scientist',
    requiredSkills: [
      { canonicalId: 'skill_ai_python', name: 'Python', minLevel: 85, weight: 0.30 },
      { canonicalId: 'skill_ai_machine_learning', name: 'Machine Learning', minLevel: 85, weight: 0.30 },
      { canonicalId: 'skill_data_sql', name: 'SQL', minLevel: 75, weight: 0.20 },
      { canonicalId: 'skill_soft_problem_solving', name: 'Problem Solving', minLevel: 80, weight: 0.20 },
    ],
  },
  role_be_developer: {
    roleId: 'role_be_developer',
    title: 'Backend Developer',
    requiredSkills: [
      { canonicalId: 'skill_be_nodejs', name: 'Node.js', minLevel: 85, weight: 0.30 },
      { canonicalId: 'skill_be_mongodb', name: 'MongoDB / Databases', minLevel: 80, weight: 0.25 },
      { canonicalId: 'skill_fe_javascript', name: 'JavaScript / TypeScript', minLevel: 80, weight: 0.25 },
      { canonicalId: 'skill_soft_problem_solving', name: 'Problem Solving', minLevel: 80, weight: 0.20 },
    ],
  },
  role_ai_ml_engineer: {
    roleId: 'role_ai_ml_engineer',
    title: 'AI / Machine Learning Engineer',
    requiredSkills: [
      { canonicalId: 'skill_ai_python', name: 'Python', minLevel: 85, weight: 0.30 },
      { canonicalId: 'skill_ai_machine_learning', name: 'Machine Learning', minLevel: 80, weight: 0.30 },
      { canonicalId: 'skill_data_pandas', name: 'Data Analysis (Pandas)', minLevel: 80, weight: 0.20 },
      { canonicalId: 'skill_data_sql', name: 'SQL', minLevel: 75, weight: 0.10 },
      { canonicalId: 'skill_soft_problem_solving', name: 'Problem Solving', minLevel: 80, weight: 0.10 },
    ],
  },
};

export type DashboardEvidenceState =
  | 'new_student'          // No resumes uploaded, 0 skills
  | 'resume_uploaded'      // Resume uploaded, but no skills imported yet
  | 'skills_unverified'    // Skills imported, but level: 0 or unverified
  | 'student_assessed';    // Valid assessed skills with level > 0

/**
 * Explicit separate metrics contract matching requirements:
 * A. Extracted canonical claims: unique canonical IDs in selected resume
 * B. Imported profile skills: unique canonical IDs in student profile
 * C. Unverified imported skills: unique profile skills without verified evidence
 * D. Verified skills: unique profile skills with verified evidence
 * E. Career-required skills: unique required canonical IDs for selected career
 * F. Career-fit & skills-ready: derived strictly from genuine assessment evidence
 */
export interface CalculatedCareerMetrics {
  dashboardState: DashboardEvidenceState;
  hasTargetRole: boolean;
  targetRoleTitle: string;
  targetRoleId: string | null;
  hasAssessedSkills: boolean;

  // Explicit Metric Definitions:
  extractedClaimsCount: number;         // A: Unique canonical claims in selected resume
  importedSkillsCount: number;          // B: Unique canonical skills in student profile
  unverifiedSkillsCount: number;        // C: Unique profile skills without verified evidence
  verifiedSkillsCount: number;          // D: Unique profile skills with verified assessment evidence
  careerRequiredSkillsCount: number;    // E: Unique required skills for target career (0 if none)

  // Backward-compatible aliases for existing component references
  totalSkillsCount: number;             // Same as importedSkillsCount
  assessedSkillsCount: number;          // Same as verifiedSkillsCount

  // F: Career-fit and readiness metrics derived from genuine evidence:
  readinessScore: number;
  readinessDisplay: string;
  readinessTrend: string;
  careerFitPercentage: number;
  careerFitDisplay: string;
  skillsReadyRatio: string;
  gapsCount: number;
  estimatedTimeline: string;
  learningProgressPercentage: number;

  // Detailed skill lists
  topSkills: UserSkill[];
  verifiedSkills: UserSkill[];
  unverifiedSkills: UserSkill[];

  // Resumes context
  activeResume: ResumeDocument | null;
  resumesCount: number;
  allResumesUniqueClaimsCount: number;  // Total unique canonical claims across all student resumes
}

/**
 * Server-side verification policy check:
 * A skill is verified if and only if it has at least one verified assessment/evaluation
 * evidence entry (verifiedStatus === 'verified' and score > 0) and level > 0.
 * Profile presence alone or resume extraction alone NEVER counts as verified.
 */
export function isSkillVerified(skill: UserSkill): boolean {
  if (!skill.evidence || skill.evidence.length === 0) return false;
  const hasVerifiedEvidence = skill.evidence.some(
    (e) => e.verifiedStatus === 'verified' && typeof e.score === 'number' && e.score > 0,
  );
  return hasVerifiedEvidence && skill.level > 0;
}

/**
 * Metric A: Extracted canonical claims
 * Counts unique canonical skill IDs in the given resume document.
 * Deduplicates repeated mentions of the same canonical skill.
 */
export function countExtractedClaims(resume: ResumeDocument | null): number {
  if (!resume || !Array.isArray(resume.claimedSkills)) return 0;
  const uniqueCanonicalIds = new Set(
    resume.claimedSkills
      .map((s) => s.canonicalId?.trim())
      .filter((id): id is string => Boolean(id)),
  );
  return uniqueCanonicalIds.size;
}

/**
 * Metric B: Imported profile skills
 * Counts unique canonical skill IDs actually present in the student's profile.
 */
export function countImportedSkills(profile: StudentProfile | null): number {
  if (!profile || !Array.isArray(profile.skills)) return 0;
  const uniqueCanonicalIds = new Set(
    profile.skills
      .map((s) => s.canonicalId?.trim())
      .filter((id): id is string => Boolean(id)),
  );
  return uniqueCanonicalIds.size;
}

/**
 * Metric C: Unverified imported skills
 * Counts unique profile skills whose applicable evidence remains unverified.
 * Duplicate evidence records for the same skill do not inflate this count.
 */
export function countUnverifiedSkills(profile: StudentProfile | null): number {
  if (!profile || !Array.isArray(profile.skills)) return 0;
  const uniqueMap = new Map<string, UserSkill>();
  for (const s of profile.skills) {
    if (s.canonicalId && !uniqueMap.has(s.canonicalId)) {
      uniqueMap.set(s.canonicalId, s);
    }
  }
  return Array.from(uniqueMap.values()).filter((s) => !isSkillVerified(s)).length;
}

/**
 * Metric D: Verified skills
 * Counts unique profile skills meeting the server-side verification policy.
 */
export function countVerifiedSkills(profile: StudentProfile | null): number {
  if (!profile || !Array.isArray(profile.skills)) return 0;
  const uniqueMap = new Map<string, UserSkill>();
  for (const s of profile.skills) {
    if (s.canonicalId && !uniqueMap.has(s.canonicalId)) {
      uniqueMap.set(s.canonicalId, s);
    }
  }
  return Array.from(uniqueMap.values()).filter(isSkillVerified).length;
}

/**
 * Metric E: Career-required skills
 * Counts unique required canonical skill IDs for the selected target career.
 * Returns 0 if no target career is selected.
 */
export function countCareerRequiredSkills(targetRoleId?: string | null): number {
  if (!targetRoleId) return 0;
  const benchmark = ROLE_BENCHMARKS[targetRoleId.trim()];
  return benchmark ? benchmark.requiredSkills.length : 0;
}

export function getRoleTitle(roleId?: string | null): string {
  if (!roleId) return 'No Target Career Selected';
  return ROLE_BENCHMARKS[roleId]?.title || roleId;
}

/**
 * Evidence-based calculation of student metrics based on MongoDB profile and uploaded resumes.
 *
 * Strict source-of-truth rules:
 * - Extracted claims come from the active/selected resume (deduplicated by canonicalId).
 * - Imported skills come from student profile (deduplicated by canonicalId).
 * - Verified skills require genuine verified assessment evidence (level > 0).
 * - Career requirements come strictly from selected target career's benchmark.
 * - If no target career is selected, career-fit and readiness show prompt to choose one.
 * - Never substitutes resume claim count for career-required skill count or vice-versa.
 */
export function calculateCareerMetrics(
  profile: StudentProfile | null,
  resumes: ResumeDocument[] = [],
  selectedResumeId?: string | null,
): CalculatedCareerMetrics {
  // 1. Target Role & Authoritative Benchmark
  const rawRoleId = profile?.targetRoleId ? profile.targetRoleId.trim() : null;
  const benchmark = rawRoleId && ROLE_BENCHMARKS[rawRoleId] ? ROLE_BENCHMARKS[rawRoleId] : null;
  const hasTargetRole = Boolean(benchmark);
  const targetRoleId = hasTargetRole && rawRoleId ? rawRoleId : null;
  const targetRoleTitle = benchmark ? benchmark.title : (rawRoleId ? rawRoleId : 'No Target Career Selected');
  const careerRequiredSkillsCount = benchmark ? benchmark.requiredSkills.length : 0;

  // 2. Profile Skills (Deduplicated by canonicalId)
  const rawSkills: UserSkill[] = profile?.skills || [];
  const uniqueSkillsMap = new Map<string, UserSkill>();
  for (const s of rawSkills) {
    if (s.canonicalId && !uniqueSkillsMap.has(s.canonicalId)) {
      uniqueSkillsMap.set(s.canonicalId, s);
    }
  }
  const uniqueProfileSkills = Array.from(uniqueSkillsMap.values());
  const importedSkillsCount = uniqueProfileSkills.length;

  // 3. Verified vs Unverified Skills
  const verifiedSkills = uniqueProfileSkills.filter(isSkillVerified);
  const unverifiedSkills = uniqueProfileSkills.filter((s) => !isSkillVerified(s));
  const verifiedSkillsCount = verifiedSkills.length;
  const unverifiedSkillsCount = unverifiedSkills.length;
  const hasAssessedSkills = verifiedSkillsCount > 0;

  // 4. Resumes Context & Active Resume Claims
  const resumesCount = resumes.length;
  let activeResume: ResumeDocument | null = null;
  if (selectedResumeId) {
    activeResume = resumes.find((r) => r.id === selectedResumeId || (r as any)._id === selectedResumeId) || null;
  }
  if (!activeResume && resumes.length > 0) {
    activeResume = resumes[0];
  }

  const extractedClaimsCount = countExtractedClaims(activeResume);

  // Deduplicated unique claims across all student resumes for aggregate insights
  const allClaimIds = new Set(
    resumes.flatMap((r) => (r.claimedSkills || []).map((s) => s.canonicalId).filter(Boolean)),
  );
  const allResumesUniqueClaimsCount = allClaimIds.size;

  // 5. Dashboard Evidence State Machine
  let dashboardState: DashboardEvidenceState = 'new_student';
  if (importedSkillsCount === 0 && resumesCount === 0) {
    dashboardState = 'new_student';
  } else if (resumesCount > 0 && importedSkillsCount === 0) {
    dashboardState = 'resume_uploaded';
  } else if (importedSkillsCount > 0 && !hasAssessedSkills) {
    dashboardState = 'skills_unverified';
  } else {
    dashboardState = 'student_assessed';
  }

  // 6. Career Readiness Score (Formula: sum(w_i * min(1.0, current/minLevel)))
  let readinessScore = 0;
  if (hasAssessedSkills && benchmark) {
    let weightedSum = 0;
    for (const req of benchmark.requiredSkills) {
      const studentSkill = verifiedSkills.find((s) => s.canonicalId === req.canonicalId);
      const currentLevel = studentSkill ? studentSkill.level : 0;
      const satisfaction = Math.min(1.0, currentLevel / req.minLevel);
      weightedSum += req.weight * satisfaction;
    }
    readinessScore = Math.round(weightedSum * 100);
  }

  // Readiness display string
  let readinessDisplay = 'Not Assessed';
  let readinessTrend = 'Assessment required';
  if (dashboardState === 'student_assessed') {
    if (hasTargetRole) {
      readinessDisplay = `${readinessScore}%`;
      readinessTrend = readinessScore >= 75 ? 'Job-Ready' : 'In Progress';
    } else {
      readinessDisplay = 'Select Target Role';
      readinessTrend = 'Target role needed';
    }
  } else if (dashboardState === 'skills_unverified') {
    readinessDisplay = '0%';
    readinessTrend = 'Pending assessment';
  } else if (dashboardState === 'resume_uploaded') {
    readinessDisplay = 'Not Assessed';
    readinessTrend = 'Import skills to begin';
  } else {
    readinessDisplay = 'Not Assessed';
    readinessTrend = 'Upload resume to start';
  }

  // 7. Career Fit Metric
  // When no verified assessment evidence exists, show "Not evaluated" instead of misleading counts.
  let careerFitPercentage = 0;
  let careerFitDisplay = 'Not evaluated';

  if (!hasTargetRole) {
    careerFitDisplay = 'No Target Role';
    careerFitPercentage = 0;
  } else if (dashboardState === 'student_assessed' && benchmark) {
    const matchingCount = benchmark.requiredSkills.filter((req) =>
      verifiedSkills.some((s) => s.canonicalId === req.canonicalId && s.level > 0),
    ).length;
    careerFitPercentage = Math.round((matchingCount / careerRequiredSkillsCount) * 100);
    careerFitDisplay = `${careerFitPercentage}%`;
  } else {
    // Unverified claims or unassessed: genuine evaluation cannot be computed
    careerFitPercentage = 0;
    careerFitDisplay = 'Not evaluated';
  }

  // 8. Skills Ready vs Gaps
  // Ready skills require verified evidence meeting benchmark minLevel.
  let skillsReadyRatio = '—';
  let gapsCount = 0;

  if (!hasTargetRole) {
    skillsReadyRatio = '—';
    gapsCount = 0;
  } else if (hasAssessedSkills && benchmark) {
    const readySkills = benchmark.requiredSkills.filter((req) => {
      const s = verifiedSkills.find((skill) => skill.canonicalId === req.canonicalId);
      return s && s.level >= req.minLevel;
    });
    const skillsReadyCount = readySkills.length;
    skillsReadyRatio = `${skillsReadyCount}/${careerRequiredSkillsCount}`;
    gapsCount = careerRequiredSkillsCount - skillsReadyCount;
  } else {
    // When not assessed or unverified, show "Not evaluated"
    skillsReadyRatio = 'Not evaluated';
    gapsCount = careerRequiredSkillsCount;
  }

  // 9. Estimated Timeline
  const weeklyHours = profile?.weeklyLearningHours || 10;
  let estimatedTimeline = 'Not estimated';
  if (!hasTargetRole) {
    estimatedTimeline = 'Select a target career';
  } else if (benchmark && hasAssessedSkills) {
    if (gapsCount === 0) {
      estimatedTimeline = 'Benchmark met! 🎉';
    } else {
      const totalGapPoints = benchmark.requiredSkills.reduce((acc, req) => {
        const s = verifiedSkills.find((skill) => skill.canonicalId === req.canonicalId);
        const curr = s ? s.level : 0;
        return acc + Math.max(0, req.minLevel - curr);
      }, 0);
      const hoursNeeded = totalGapPoints * 2;
      const weeksNeeded = Math.ceil(hoursNeeded / weeklyHours);
      const months = Math.max(1, Math.round(weeksNeeded / 4.3));
      estimatedTimeline = `~${months} month${months > 1 ? 's' : ''}`;
    }
  } else if (dashboardState === 'skills_unverified') {
    estimatedTimeline = 'Assessment required';
  } else {
    estimatedTimeline = 'Add data to estimate';
  }

  // 10. Learning Progress Percentage
  const learningProgressPercentage = hasAssessedSkills && benchmark && careerRequiredSkillsCount > 0
    ? Math.min(100, Math.round((verifiedSkillsCount / careerRequiredSkillsCount) * 100))
    : 0;

  // 11. Top Skills (Sorted by level descending)
  const sortedSkills = [...uniqueProfileSkills].sort((a, b) => b.level - a.level);

  return {
    dashboardState,
    hasTargetRole,
    targetRoleTitle,
    targetRoleId,
    hasAssessedSkills,

    extractedClaimsCount,
    importedSkillsCount,
    unverifiedSkillsCount,
    verifiedSkillsCount,
    careerRequiredSkillsCount,

    totalSkillsCount: importedSkillsCount,
    assessedSkillsCount: verifiedSkillsCount,

    readinessScore,
    readinessDisplay,
    readinessTrend,
    careerFitPercentage,
    careerFitDisplay,
    skillsReadyRatio,
    gapsCount,
    estimatedTimeline,
    learningProgressPercentage,

    topSkills: sortedSkills,
    verifiedSkills,
    unverifiedSkills,

    activeResume,
    resumesCount,
    allResumesUniqueClaimsCount,
  };
}
