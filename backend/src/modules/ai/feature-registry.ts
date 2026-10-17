/**
 * feature-registry.ts
 * Verified registry of all implemented frontend pages, workflows, and routes in CareerPulse.
 * Used by CareerPulse AI to provide accurate, step-by-step guidance and safe navigation actions.
 */

export interface PlatformFeature {
  id: string;
  name: string;
  path: string;
  description: string;
  howToUse: string[];
  prerequisites: string[];
  commonTroubleshooting: string[];
}

export const ALLOWLISTED_INTERNAL_ROUTES = [
  '/',
  '/login',
  '/dashboard',
  '/profile',
  '/resume',
  '/assessment',
  '/assessment/result',
  '/skills',
  '/learning-gap',
  '/career-fit',
  '/courses',
  '/roadmap',
  '/progress',
  '/analytics',
  '/opportunities',
];

export const PLATFORM_FEATURES: Record<string, PlatformFeature> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    description:
      'Central career command center showing career readiness, career fit score, evidence audit, tracked skills, weekly learning hours, and active learning goals.',
    howToUse: [
      'View your Career Readiness and Career Fit based on verified skill benchmarks.',
      'Check the Evidence Source-of-Truth audit cards to see resume claims vs profile skills.',
      'Click "Verify Skills" to take assessments that convert unverified claims into verified proficiency.',
      'Review your target pace and weekly study schedule.',
    ],
    prerequisites: ['Set target career in Profile', 'Import skills from Resume Analysis or add in Profile'],
    commonTroubleshooting: [
      'If Career Fit shows "Not evaluated", you have unverified skills imported from your resume. Complete skill quizzes to verify them.',
      'If metrics show "Select Target Career", visit My Profile to choose your target role.',
    ],
  },
  profile: {
    id: 'profile',
    name: 'Student Profile',
    path: '/profile',
    description:
      'Manage your academic credentials (degree, branch, year, CGPA), target career goal, weekly study hours, bio, and tracked skill proficiencies.',
    howToUse: [
      'Update your academic details (degree, branch, year) and click Save.',
      'Select your Target Career Role (e.g. Full Stack Developer, UI/UX Designer, Data Analyst).',
      'Set your planned Weekly Learning Hours (1 to 60 hours).',
      'Review your tracked skills, levels, and verification badges.',
    ],
    prerequisites: ['Signed in with student account'],
    commonTroubleshooting: [
      'Ensure you click "Save Profile" after selecting your target career so dashboard benchmarks update.',
    ],
  },
  resume: {
    id: 'resume',
    name: 'Resume Analysis & Ingestion',
    path: '/resume',
    description:
      'Upload PDF or DOCX resumes to extract education, work experience, projects, and canonical skill claims, then selectively import them into your profile.',
    howToUse: [
      'Drag and drop or browse to select your PDF or DOCX resume (max 5MB).',
      'Wait for the parser to extract structured education, experience, and skill claims.',
      'Review the extracted skill claims in the Clean Skill Cards view.',
      'Check the boxes for skills you want to track, then click "Import Selected Skills to Profile".',
    ],
    prerequisites: ['Valid PDF or Word DOCX document with text (not scanned images)'],
    commonTroubleshooting: [
      'Skills are NOT automatically placed in your profile upon upload; you must click "Import Selected Skills".',
      'Imported resume skills start as "unverified" evidence until verified through assessments.',
      'If parsing fails, ensure your PDF contains selectable text rather than flattened raster images.',
    ],
  },
  assessment: {
    id: 'assessment',
    name: 'Skill Assessments',
    path: '/assessment',
    description:
      'Interactive quizzes designed to assess, confirm, and verify your technical proficiencies according to academic integrity standards.',
    howToUse: [
      'Navigate to Career Assessment from the sidebar or click "Take Assessment" on unverified skill banners.',
      'Answer the multiple-choice questions for your chosen skill domain.',
      'Submit the assessment to view your results and verified score.',
    ],
    prerequisites: ['Skills tracked in profile'],
    commonTroubleshooting: [
      'Passing an assessment upgrades skill evidence from "unverified" to "verified", which unlocks your Career Readiness score on the Dashboard.',
    ],
  },
  skills: {
    id: 'skills',
    name: 'My Skill Profile',
    path: '/skills',
    description:
      'Comprehensive breakdown of all tracked skills by category (Design, Frontend, Backend, Data, AI/ML, Soft Skills) with proficiency bars and evidence badges.',
    howToUse: [
      'Browse skills categorized by domain.',
      'Inspect proficiency tiers: Beginner (0-25%), Developing (26-50%), Proficient (51-75%), Advanced (76-100%).',
      'Review evidence sources (Resume Extracted, Quiz Assessment, Project Evaluated).',
    ],
    prerequisites: ['Skills imported from Resume Analysis or added manually'],
    commonTroubleshooting: [
      'If a skill is missing, upload your resume or import it from Resume Analysis.',
    ],
  },
  learningGap: {
    id: 'learningGap',
    name: 'Learning Gaps',
    path: '/learning-gap',
    description:
      'Direct comparison between your current skill proficiency and the minimum required benchmarks for your selected target career.',
    howToUse: [
      'Examine the gap percentage for each required skill.',
      'Identify high-priority critical gaps vs small gaps.',
      'Click recommended courses to address the largest skill deficits.',
    ],
    prerequisites: ['Target Career selected in Profile', 'Skills tracked in Profile'],
    commonTroubleshooting: [
      'If no gaps appear, check if your Target Career is set in My Profile.',
    ],
  },
  careerFit: {
    id: 'careerFit',
    name: 'Career Fit',
    path: '/career-fit',
    description:
      'AI matching matrix analyzing how your verified skill profile aligns with multiple industry career paths.',
    howToUse: [
      'Compare Career Fit percentages across roles like Full Stack Developer, UI/UX Designer, Data Analyst, and DevOps Engineer.',
      'Click on any career card to view detailed role benchmarks and learning paths.',
    ],
    prerequisites: ['Skills verified through assessment'],
    commonTroubleshooting: [
      'Fit percentages require verified skill assessments to ensure trustworthy alignment.',
    ],
  },
  roadmap: {
    id: 'roadmap',
    name: 'My Learning Roadmap',
    path: '/roadmap',
    description:
      'Sequenced, milestone-based curriculum designed to bridge skill gaps for your target career.',
    howToUse: [
      'Follow monthly and weekly learning modules.',
      'Review milestone deliverables and portfolio projects.',
      'Track hours spent toward your weekly study commitment.',
    ],
    prerequisites: ['Target Career selected in Profile'],
    commonTroubleshooting: [
      'Roadmap milestones are personalized to your weekly learning hours configured in My Profile.',
    ],
  },
  courses: {
    id: 'courses',
    name: 'Course Hub',
    path: '/courses',
    description:
      'Curated library of courses, tutorials, and certifications matched to high-demand skills.',
    howToUse: [
      'Search courses by skill name or category.',
      'Enroll in courses to bridge identified learning gaps.',
    ],
    prerequisites: ['None'],
    commonTroubleshooting: [],
  },
  opportunities: {
    id: 'opportunities',
    name: 'Opportunities & Jobs',
    path: '/opportunities',
    description:
      'Internship and job postings tailored to your skill match score and career readiness.',
    howToUse: [
      'Browse opportunities filtered by readiness and matching skills.',
      'Review required qualifications vs your verified profile.',
    ],
    prerequisites: ['Target Career and skills tracked'],
    commonTroubleshooting: [],
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    path: '/analytics',
    description:
      'Visual performance charts tracking weekly learning pace, skill progression velocity, and assessment history.',
    howToUse: [
      'Monitor weekly learning hours vs target commitment.',
      'Track month-over-month skill growth.',
    ],
    prerequisites: ['Active learning activity'],
    commonTroubleshooting: [],
  },
};
