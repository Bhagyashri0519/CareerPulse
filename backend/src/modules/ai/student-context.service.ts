/**
 * student-context.service.ts
 * Builds fresh, authorized, and sanitized student context for CareerPulse AI.
 * Ensures student data isolation: identity is strictly derived from verified JWT middleware.
 * Never includes passwords, password hashes, JWTs, or sensitive credentials.
 */

import { Types } from 'mongoose';
import { User } from '../users/user.model';
import { StudentProfile, IStudentProfile } from '../profiles/profile.model';
import { Resume, IResume } from '../resumes/resume.model';

export interface StudentOnboardingStatus {
  hasProfile: boolean;
  hasResume: boolean;
  resumeFileName?: string;
  hasImportedSkills: boolean;
  importedSkillsCount: number;
  unimportedClaimsCount: number;
  hasTargetCareer: boolean;
  targetCareerTitle: string | null;
  hasVerifiedSkills: boolean;
  verifiedSkillsCount: number;
  unverifiedSkillsCount: number;
  nextRecommendedStep: string;
  nextRecommendedRoute: string;
}

export interface StudentContextSummary {
  userId: string;
  studentName: string;
  email: string;
  academic: {
    degree: string;
    branch: string;
    year: number;
    cgpa?: number | null;
    weeklyLearningHours: number;
    bio?: string;
  };
  targetCareer: {
    roleId: string | null;
    title: string;
  };
  skills: {
    totalTracked: number;
    verifiedCount: number;
    unverifiedCount: number;
    trackedList: Array<{
      name: string;
      level: number;
      tier: string;
      category: string;
      isVerified: boolean;
    }>;
  };
  resume: {
    hasUploadedResume: boolean;
    fileName?: string;
    uploadedAt?: Date;
    totalClaimsCount: number;
    importedClaimsCount: number;
    unimportedClaimsCount: number;
    sampleClaims: Array<{ name: string; category: string; confidence: number; isImported: boolean }>;
  };
  onboarding: StudentOnboardingStatus;
  contextText: string;
}

const ROLE_TITLES: Record<string, string> = {
  role_fullstack_dev: 'Full Stack Developer',
  role_ui_ux_designer: 'UI/UX Designer',
  role_fe_developer: 'Frontend Developer',
  role_be_developer: 'Backend Developer',
  role_data_analyst: 'Data Analyst',
  role_data_scientist: 'Data Scientist',
  role_devops_engineer: 'DevOps Engineer',
  role_mobile_developer: 'Mobile Developer',
  role_ai_engineer: 'AI Engineer',
};

export class StudentContextService {
  /**
   * Retrieves fresh, authorized student context from MongoDB.
   * Throws if user is not found.
   */
  async getStudentContext(userId: string): Promise<StudentContextSummary> {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Fetch user account
    const user = await User.findById(userObjectId).select('name email role createdAt');
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Fetch profile
    const profile = await StudentProfile.findOne({ userId: userObjectId });

    // 3. Fetch latest resume
    const latestResume = await Resume.findOne({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .select('fileName uploadedAt parseStatus claimedSkills');

    // 4. Compute skills summary
    const trackedSkills = profile?.skills || [];
    let verifiedCount = 0;
    let unverifiedCount = 0;

    const trackedList = trackedSkills.map((s) => {
      const hasVerifiedEvidence = (s.evidence || []).some(
        (e) => e.verifiedStatus === 'verified' || e.source === 'quiz_assessment',
      );
      if (hasVerifiedEvidence) {
        verifiedCount++;
      } else {
        unverifiedCount++;
      }
      return {
        name: s.name,
        level: s.level,
        tier: s.tier,
        category: s.category,
        isVerified: hasVerifiedEvidence,
      };
    });

    // 5. Compute resume summary
    const claimedSkills = latestResume?.claimedSkills || [];
    const totalClaimsCount = claimedSkills.length;
    let importedClaimsCount = 0;
    let unimportedClaimsCount = 0;

    claimedSkills.forEach((c) => {
      if (c.isImported) {
        importedClaimsCount++;
      } else {
        unimportedClaimsCount++;
      }
    });

    const sampleClaims = claimedSkills.slice(0, 15).map((c) => ({
      name: c.name,
      category: c.category,
      confidence: c.confidence,
      isImported: c.isImported,
    }));

    // 6. Target Career
    const targetRoleId = profile?.targetRoleId || null;
    const targetCareerTitle = targetRoleId ? (ROLE_TITLES[targetRoleId] || targetRoleId) : 'Not selected yet';

    // 7. Compute Onboarding State
    const hasProfile = Boolean(profile && profile.degree && profile.branch);
    const hasResume = Boolean(latestResume && latestResume.parseStatus === 'completed');
    const hasImportedSkills = trackedSkills.length > 0;
    const hasTargetCareer = Boolean(targetRoleId);
    const hasVerifiedSkills = verifiedCount > 0;

    let nextRecommendedStep = 'Review and complete your academic profile.';
    let nextRecommendedRoute = '/profile';

    if (!hasProfile) {
      nextRecommendedStep = 'Fill in your degree, branch, and graduation year in your profile.';
      nextRecommendedRoute = '/profile';
    } else if (!hasResume) {
      nextRecommendedStep = 'Upload your resume in Resume Analysis to automatically extract your skills and experience.';
      nextRecommendedRoute = '/resume';
    } else if (!hasImportedSkills || unimportedClaimsCount > 0) {
      nextRecommendedStep = `You have ${unimportedClaimsCount > 0 ? unimportedClaimsCount : totalClaimsCount} skill claims in your uploaded resume. Go to Resume Analysis and click "Import Selected Skills".`;
      nextRecommendedRoute = '/resume';
    } else if (!hasTargetCareer) {
      nextRecommendedStep = 'Select your target career goal in My Profile to generate personalized readiness benchmarks.';
      nextRecommendedRoute = '/profile';
    } else if (!hasVerifiedSkills && unverifiedCount > 0) {
      nextRecommendedStep = `You have ${unverifiedCount} unverified skills in your profile. Take a quick assessment to verify your proficiency and unlock Career Readiness on your Dashboard.`;
      nextRecommendedRoute = '/assessment';
    } else {
      nextRecommendedStep = 'Follow your personalized Learning Roadmap and review your weekly progress.';
      nextRecommendedRoute = '/roadmap';
    }

    const onboarding: StudentOnboardingStatus = {
      hasProfile,
      hasResume,
      resumeFileName: latestResume?.fileName,
      hasImportedSkills,
      importedSkillsCount: trackedSkills.length,
      unimportedClaimsCount,
      hasTargetCareer,
      targetCareerTitle: targetRoleId ? targetCareerTitle : null,
      hasVerifiedSkills,
      verifiedSkillsCount: verifiedCount,
      unverifiedSkillsCount: unverifiedCount,
      nextRecommendedStep,
      nextRecommendedRoute,
    };

    // 8. Generate Context Markdown for LLM prompt injection
    const contextText = [
      `### Authenticated Student Data`,
      `- **Name**: ${user.name}`,
      `- **Degree & Branch**: ${profile?.degree || 'B.Tech'} ${profile?.branch || 'Computer Science'}, Year ${profile?.year || 1}`,
      `- **CGPA**: ${profile?.cgpa ? profile.cgpa : 'Not provided'}`,
      `- **Target Career Goal**: ${targetCareerTitle} (ID: ${targetRoleId || 'none'})`,
      `- **Weekly Study Commitment**: ${profile?.weeklyLearningHours || 10} hours/week`,
      `- **Tracked Profile Skills (${trackedSkills.length} total)**:`,
      trackedSkills.length === 0
        ? `  * No skills imported into profile yet.`
        : trackedList
            .map(
              (s) =>
                `  * ${s.name} (${s.category}): Level ${s.level}%, Tier: ${s.tier}, Verification: ${
                  s.isVerified ? 'VERIFIED (via assessment)' : 'UNVERIFIED (imported claim)'
                }`,
            )
            .join('\n'),
      `- **Resume Evidence**:`,
      latestResume
        ? `  * Latest file: "${latestResume.fileName}" (uploaded ${latestResume.uploadedAt?.toISOString().split('T')[0] || 'recently'})`
        : `  * No resume uploaded yet.`,
      `  * Extracted Skill Claims: ${totalClaimsCount} total (${importedClaimsCount} imported to profile, ${unimportedClaimsCount} pending import)`,
      `- **Onboarding Checklist Status**:`,
      `  * Profile Details: ${hasProfile ? 'Complete' : 'Incomplete'}`,
      `  * Resume Uploaded: ${hasResume ? `Yes (${latestResume?.fileName})` : 'No'}`,
      `  * Skills In Profile: ${hasImportedSkills ? `Yes (${trackedSkills.length} skills)` : 'No'}`,
      `  * Target Career Selected: ${hasTargetCareer ? `Yes (${targetCareerTitle})` : 'No'}`,
      `  * Skills Verified: ${hasVerifiedSkills ? `Yes (${verifiedCount} verified)` : 'No verified skills yet'}`,
      `- **Recommended Next Action**: ${nextRecommendedStep} (Route: ${nextRecommendedRoute})`,
    ].join('\n');

    return {
      userId: user._id.toString(),
      studentName: user.name,
      email: user.email,
      academic: {
        degree: profile?.degree || 'B.Tech',
        branch: profile?.branch || 'Computer Science',
        year: profile?.year || 1,
        cgpa: profile?.cgpa,
        weeklyLearningHours: profile?.weeklyLearningHours || 10,
        bio: profile?.bio,
      },
      targetCareer: {
        roleId: targetRoleId,
        title: targetCareerTitle,
      },
      skills: {
        totalTracked: trackedSkills.length,
        verifiedCount,
        unverifiedCount,
        trackedList,
      },
      resume: {
        hasUploadedResume: Boolean(latestResume),
        fileName: latestResume?.fileName,
        uploadedAt: latestResume?.uploadedAt,
        totalClaimsCount,
        importedClaimsCount,
        unimportedClaimsCount,
        sampleClaims,
      },
      onboarding,
      contextText,
    };
  }
}

export const studentContextService = new StudentContextService();
export default studentContextService;
