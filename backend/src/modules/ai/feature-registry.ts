/**
 * feature-registry.ts
 * Verified registry of all implemented frontend pages, workflows, and routes in CareerPulse.
 * Single source of truth for CareerPulse AI navigation and website question answering.
 */

export interface PlatformFeature {
  id: string;
  name: string;
  path: string;
  sidebarLabel: string;
  sidebarIcon: string;
  pageTitle: string;
  purpose: string;
  description: string;
  howToUse: string[];
  prerequisites: string[];
  commonTroubleshooting: string[];
  isImplemented: boolean;
  keywords: string[];
}

export const ALLOWLISTED_INTERNAL_ROUTES: string[] = [
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
    sidebarLabel: 'Dashboard',
    sidebarIcon: '🏠',
    pageTitle: 'Dashboard',
    purpose:
      'Central career command center showing career readiness, career fit, verified evidence audit cards, tracked skills, weekly learning commitment, and active learning goals.',
    description:
      'Aggregates your verified skills, compares them to target industry benchmarks, and provides evidence source-of-truth tracking.',
    howToUse: [
      'Open CareerPulse and navigate to the Dashboard (sidebar: "🏠 Dashboard").',
      'Check your dynamic greeting and recommended next step banner at the top.',
      'Review Career Readiness: shows your percentage of verified skills required for your target role. Note: displays "Not evaluated" if imported skills are unverified.',
      'Review Career Fit: shows how well your strengths align with your target role and other industry positions.',
      'Inspect the Evidence Source-of-Truth audit cards (A through E): A. Resume Claims, B. Profile Skills, C. Unverified Claims, D. Verified Skills, and E. Career Required Skills.',
      'Click "Verify Skills" to take skill assessments and convert unverified claims into verified proficiency.',
      'Monitor your weekly learning hours progress and active study roadmap.',
    ],
    prerequisites: [
      'Signed in with student account',
      'Select a Target Career in My Profile to populate role-specific readiness benchmarks',
      'Import skills from Resume Analysis or add them manually in Profile',
    ],
    commonTroubleshooting: [
      'If Career Readiness or Career Fit shows "Not evaluated", you have unverified skills imported from your resume. Complete assessments on the Career Assessment page to verify them.',
      'If a banner says "No Target Career Selected", click "Choose Target Career" or visit My Profile to select your desired role.',
      'If resume claims do not appear on the dashboard, ensure you have uploaded a resume on the Resume Analysis page.',
    ],
    isImplemented: true,
    keywords: [
      'dashboard',
      'command center',
      'home screen',
      'readiness',
      'career fit score',
      'evidence audit',
      'not evaluated',
      'metrics',
      'overview',
      'audit cards',
    ],
  },

  profile: {
    id: 'profile',
    name: 'Student Profile',
    path: '/profile',
    sidebarLabel: 'My Profile',
    sidebarIcon: '👤',
    pageTitle: 'Student Profile',
    purpose:
      'Manage academic credentials, target career goals, weekly learning commitment, bio, and tracked skill proficiencies.',
    description:
      'Allows students to set their degree, branch, year, CGPA, target career role, planned weekly study hours, and manage self-reported skills.',
    howToUse: [
      'Navigate to My Profile from the sidebar ("👤 My Profile") or click the student pill at the top of the sidebar.',
      'Update academic details: Degree (e.g. B.Tech), Branch (e.g. Computer Science), Graduation Year, CGPA, and personal Bio.',
      'Select your Target Career Role (e.g., Full Stack Developer, UI/UX Designer, Data Analyst, Frontend Developer, Backend Developer, DevOps Engineer, AI Engineer).',
      'Set your planned Weekly Learning Hours (between 1 and 60 hours/week).',
      'Click "Save Profile" to apply and persist your changes.',
      'Optionally use the "Add New Skill" form at the bottom to add self-reported skills with category and proficiency level.',
    ],
    prerequisites: ['Signed in with student account'],
    commonTroubleshooting: [
      'Always click "Save Profile" after selecting your target career so dashboard benchmarks and roadmap milestones update.',
      'If a skill was added here, it is marked as self-reported evidence and requires quiz assessment for verified status.',
    ],
    isImplemented: true,
    keywords: [
      'profile',
      'my profile',
      'student profile',
      'target career',
      'career goal',
      'degree',
      'branch',
      'cgpa',
      'study hours',
      'weekly hours',
      'change career',
      'academic details',
    ],
  },

  resume: {
    id: 'resume',
    name: 'Resume Analysis & Ingestion',
    path: '/resume',
    sidebarLabel: 'Resume Analysis',
    sidebarIcon: '📄',
    pageTitle: 'Resume Analysis & Ingestion',
    purpose:
      'Upload and parse PDF or Word DOCX resumes, extract education, experience, projects, and canonical skill claims, and selectively import chosen skills into your profile.',
    description:
      'Deterministic resume parser supporting text-based PDF and DOCX files up to 10MB. Extracts structured sections and canonical skills without automatically injecting unreviewed claims into your profile.',
    howToUse: [
      'Open CareerPulse and look at the sidebar.',
      'Select Resume Analysis ("📄 Resume Analysis", route: /resume).',
      'Click the upload area or Browse button (or drag and drop your file into the dashed upload container).',
      'Select your PDF (.pdf) or Word DOCX (.docx) resume within the 10MB file-size limit.',
      'Wait for the parser to extract sections (Education, Work Experience, Projects, Certifications) and skill claims.',
      'Review the extracted sections and Clean Skill Cards view.',
      'Check the checkboxes for the skills you want to import into your profile.',
      'Click "Import Selected Skills to Profile" and confirm the import dialog.',
    ],
    prerequisites: [
      'Text-based PDF (.pdf) or Microsoft Word (.docx) file',
      'Maximum file size: 10MB',
      'File must contain selectable text (not scanned images, bitmap PDFs, or empty files)',
    ],
    commonTroubleshooting: [
      'Uploading a resume extracts claims; it does NOT automatically import skills into your profile or mark them as verified.',
      'Skills only appear in your profile after you check their boxes and click "Import Selected Skills to Profile".',
      'Imported resume skills start as "unverified" evidence until verified through assessments on the Career Assessment page.',
      'If upload fails with "File size exceeds maximum allowed limit", ensure your document is under 10MB.',
      'If parsing detects 0 skills, make sure your PDF contains selectable text rather than flattened raster images.',
    ],
    isImplemented: true,
    keywords: [
      'resume',
      'cv',
      'biodata',
      'upload resume',
      'upload cv',
      'add cv',
      'put resume',
      'parse resume',
      'resume ingestion',
      'extract skills',
      'import resume',
      'resume analysis',
    ],
  },

  resume_import: {
    id: 'resume_import',
    name: 'Selective Skill Import',
    path: '/resume',
    sidebarLabel: 'Resume Analysis',
    sidebarIcon: '⚡',
    pageTitle: 'Resume Analysis & Ingestion — Clean Skill Cards',
    purpose:
      'Selectively import extracted resume skill claims into your student profile with user consent and evidence tagging.',
    description:
      'Allows students to review all skills parsed from their resume, select specific skills via checkboxes, and import them into their profile as unverified claims.',
    howToUse: [
      'Navigate to Resume Analysis in the sidebar ("📄 Resume Analysis").',
      'If you have already uploaded a resume, select it from the uploaded resumes list to view details.',
      'Click on the "Skills" tab under Extracted Sections to view Clean Skill Cards.',
      'Review the detected skills, categories, and confidence scores.',
      'Select the checkboxes next to the skills you wish to import (or click "Select All" to choose all detected claims).',
      'Click the purple button: "Import Selected Skills to Profile".',
      'Confirm the import modal. The imported skills will now be visible in My Skills and My Profile.',
    ],
    prerequisites: ['A parsed resume with extracted skill claims'],
    commonTroubleshooting: [
      'Why are my resume skills not showing in my profile? Uploading a resume only parses the document into claims. You must explicitly select them and click "Import Selected Skills to Profile" to add them to your profile.',
      'Imported skills are marked as "unverified" until you take skill assessment quizzes to confirm proficiency.',
    ],
    isImplemented: true,
    keywords: [
      'import skills',
      'import resume skills',
      'selective import',
      'skills not showing',
      'why skills not in profile',
      'transfer skills',
      'apply skills',
      'add skills from resume',
    ],
  },

  assessment: {
    id: 'assessment',
    name: 'Career Assessment',
    path: '/assessment',
    sidebarLabel: 'Career Assessment',
    sidebarIcon: '🧠',
    pageTitle: 'Career Assessment',
    purpose:
      'Interactive technical quizzes designed to test, verify, and validate skill proficiencies to academic integrity standards.',
    description:
      'Provides multiple-choice quizzes that elevate unverified resume claims into verified profile evidence, unlocking Dashboard Career Readiness scores.',
    howToUse: [
      'Navigate to Career Assessment from the sidebar ("🧠 Career Assessment") or click "Verify Skills" on the Dashboard.',
      'Select the skill or domain you wish to assess.',
      'Answer the multiple-choice questions within the allotted time.',
      'Submit the assessment to view your score, breakdown, and verified credentials.',
      'Passing upgrades your skill evidence from "unverified" to "verified" across the platform.',
    ],
    prerequisites: ['Tracked skills in your profile (imported from resume or added manually)'],
    commonTroubleshooting: [
      'Career Readiness and Career Fit on the Dashboard remain "Not evaluated" until you pass assessments for key skills required by your target career.',
    ],
    isImplemented: true,
    keywords: [
      'assessment',
      'quiz',
      'test',
      'verify skills',
      'skill verification',
      'mcq',
      'take assessment',
      'exam',
      'prove proficiency',
    ],
  },

  assessment_result: {
    id: 'assessment_result',
    name: 'Assessment Result',
    path: '/assessment/result',
    sidebarLabel: 'Career Assessment',
    sidebarIcon: '🧠',
    pageTitle: 'Assessment Result',
    purpose: 'View detailed performance breakdown, score, and verified badge from a completed skill assessment.',
    description: 'Displays percentage score, correct answers, topic strengths, and updated verified skill status.',
    howToUse: [
      'Complete an assessment quiz on the Career Assessment page.',
      'Review your score and verified skill badge.',
      'Return to Dashboard or My Skills to see your updated verified proficiency.',
    ],
    prerequisites: ['Completed skill assessment quiz'],
    commonTroubleshooting: [],
    isImplemented: true,
    keywords: ['assessment result', 'quiz score', 'test results', 'verified badge'],
  },

  skills: {
    id: 'skills',
    name: 'My Skill Profile',
    path: '/skills',
    sidebarLabel: 'My Skills',
    sidebarIcon: '📊',
    pageTitle: 'My Skills',
    purpose:
      'Comprehensive catalog of all tracked skills categorized by domain with proficiency levels and evidence source badges.',
    description:
      'Displays all student skills grouped by category (Frontend, Backend, Design/UX, Data/AI, Cloud/DevOps, Soft Skills) with percentage levels, tiers, and audit badges.',
    howToUse: [
      'Navigate to My Skills from the sidebar ("📊 My Skills").',
      'Filter skills by category tabs (All, Frontend, Backend, Design & UX, Data & AI, Cloud & DevOps, Soft Skills).',
      'Inspect proficiency tiers: Beginner (0-25%), Developing (26-50%), Proficient (51-75%), Advanced (76-100%).',
      'Review the evidence tag on each card: "Resume Extracted" (unverified), "Quiz Assessment" (verified), or "Self Report".',
      'Click "Verify Skill" on any unverified card to launch a verification quiz.',
    ],
    prerequisites: ['Skills imported from Resume Analysis or added in Profile'],
    commonTroubleshooting: [
      'Where can I see my skills? Visit the My Skills page (/skills) from the sidebar.',
      'If a skill you have is missing, upload your resume in Resume Analysis and import it, or add it manually in My Profile.',
    ],
    isImplemented: true,
    keywords: [
      'my skills',
      'skills page',
      'see my skills',
      'view skills',
      'skill profile',
      'skill levels',
      'skill breakdown',
      'evidence badges',
      'where are my skills',
    ],
  },

  learning_gap: {
    id: 'learning_gap',
    name: 'Learning Gaps',
    path: '/learning-gap',
    sidebarLabel: 'Learning Gaps',
    sidebarIcon: '⚠️',
    pageTitle: 'Learning Gaps',
    purpose:
      'Direct comparison between current student skill proficiencies and required benchmarks for the selected target career.',
    description:
      'Identifies critical deficits and moderate gaps between current skills and industry benchmarks for the chosen career role.',
    howToUse: [
      'Navigate to Learning Gaps from the sidebar ("⚠️ Learning Gaps").',
      'Review the gap analysis comparing your current skill level against required role benchmarks.',
      'Identify High Priority gaps (critical deficits) vs Moderate gaps.',
      'Click recommended courses or roadmaps to begin bridging the highest-priority deficits.',
    ],
    prerequisites: ['Target Career selected in Profile', 'Skills tracked in Profile'],
    commonTroubleshooting: [
      'If no gap analysis is displayed, ensure you have chosen a Target Career in My Profile.',
    ],
    isImplemented: true,
    keywords: ['learning gaps', 'skill gaps', 'gap analysis', 'deficits', 'what to learn', 'benchmark comparison'],
  },

  career_fit: {
    id: 'career_fit',
    name: 'Career Fit',
    path: '/career-fit',
    sidebarLabel: 'Career Fit',
    sidebarIcon: '🎯',
    pageTitle: 'Career Fit',
    purpose:
      'AI matching matrix analyzing how your verified skill profile aligns with multiple industry career paths.',
    description:
      'Calculates match percentages across roles such as Full Stack Developer, UI/UX Designer, Data Analyst, Frontend Developer, Backend Developer, and DevOps Engineer.',
    howToUse: [
      'Navigate to Career Fit from the sidebar ("🎯 Career Fit").',
      'Compare your alignment percentage across multiple industry roles.',
      'Click on any role card to view detailed required benchmarks and role descriptions.',
      'Use the comparison to decide if you want to switch or refine your target career in My Profile.',
    ],
    prerequisites: ['Skills tracked and verified through assessments'],
    commonTroubleshooting: [
      'Career Fit requires verified skills for trustworthy calculations. If skills are unverified, complete assessments first.',
    ],
    isImplemented: true,
    keywords: ['career fit', 'role match', 'career matching', 'job fit', 'suitable roles', 'career paths'],
  },

  roadmap: {
    id: 'roadmap',
    name: 'My Learning Roadmap',
    path: '/roadmap',
    sidebarLabel: 'My Roadmap',
    sidebarIcon: '🗺️',
    pageTitle: 'My Roadmap',
    purpose:
      'Sequenced, milestone-based curriculum designed to bridge skill gaps tailored to your target career and weekly study commitment.',
    description:
      'Presents a structured, month-by-month and week-by-week learning trajectory with milestone deliverables and projects.',
    howToUse: [
      'Navigate to My Roadmap from the sidebar ("🗺️ My Roadmap").',
      'Follow the sequenced phases and monthly milestones for your target role.',
      'Check off completed topics and review recommended project deliverables.',
      'Adjust your planned pace by updating Weekly Learning Hours in My Profile.',
    ],
    prerequisites: ['Target Career selected in Profile'],
    commonTroubleshooting: [
      'Roadmap milestones are personalized to your weekly learning hours configured in My Profile.',
    ],
    isImplemented: true,
    keywords: ['roadmap', 'learning roadmap', 'study plan', 'curriculum', 'milestones', 'weekly plan', 'learning trajectory'],
  },

  courses: {
    id: 'courses',
    name: 'Course Hub',
    path: '/courses',
    sidebarLabel: 'Courses',
    sidebarIcon: '📚',
    pageTitle: 'Course Hub',
    purpose: 'Curated library of tutorials, courses, and certifications mapped to high-demand technical skills.',
    description:
      'Allows students to browse and filter courses by skill category and target career gaps.',
    howToUse: [
      'Navigate to Courses from the sidebar ("📚 Courses").',
      'Search courses by skill name or filter by domain (Frontend, Backend, Data, Cloud).',
      'Enroll in recommended courses to close skill gaps identified in your Learning Gaps view.',
    ],
    prerequisites: ['None'],
    commonTroubleshooting: [],
    isImplemented: true,
    keywords: ['courses', 'course hub', 'tutorials', 'certifications', 'learning material', 'classes'],
  },

  progress: {
    id: 'progress',
    name: 'Learning Progress',
    path: '/progress',
    sidebarLabel: 'Learning Progress',
    sidebarIcon: '📊',
    pageTitle: 'Learning Progress',
    purpose: 'Track ongoing course completion, hours logged, and milestone achievements.',
    description: 'Provides tracking of study hours logged against weekly commitments and completed curriculum milestones.',
    howToUse: [
      'Navigate to Learning Progress (/progress).',
      'Review hours completed this week vs your target study commitment.',
      'Check completed and in-progress milestone deliverables.',
    ],
    prerequisites: ['Active study activity'],
    commonTroubleshooting: [],
    isImplemented: true,
    keywords: ['progress', 'study hours', 'logged hours', 'milestone completion'],
  },

  analytics: {
    id: 'analytics',
    name: 'Analytics',
    path: '/analytics',
    sidebarLabel: 'Analytics',
    sidebarIcon: '📈',
    pageTitle: 'Analytics',
    purpose: 'Visual performance metrics tracking learning velocity, skill growth, and assessment scores over time.',
    description:
      'Displays charts of weekly study hours, skill progression over time, and assessment performance history.',
    howToUse: [
      'Navigate to Analytics from the sidebar ("📈 Analytics").',
      'Monitor weekly learning hours vs your planned weekly commitment.',
      'Track month-over-month skill growth velocity.',
      'Review your historical assessment performance.',
    ],
    prerequisites: ['Tracked student activity and profile data'],
    commonTroubleshooting: [],
    isImplemented: true,
    keywords: ['analytics', 'charts', 'performance', 'learning pace', 'velocity', 'study statistics'],
  },

  opportunities: {
    id: 'opportunities',
    name: 'Opportunities',
    path: '/opportunities',
    sidebarLabel: 'Opportunities',
    sidebarIcon: '🚀',
    pageTitle: 'Opportunities',
    purpose: 'Internship and entry-level job postings matched to your verified readiness and skill profile.',
    description:
      'Lists industry opportunities filtered by skill readiness scores, required benchmarks, and location preferences.',
    howToUse: [
      'Navigate to Opportunities from the sidebar ("🚀 Opportunities").',
      'Browse postings filtered by your career readiness and matching skills.',
      'Review required qualifications against your verified skill profile.',
      'Follow external listing links to apply.',
    ],
    prerequisites: ['Target Career and skills tracked in profile'],
    commonTroubleshooting: [],
    isImplemented: true,
    keywords: ['opportunities', 'jobs', 'internships', 'placements', 'hiring', 'openings', 'work'],
  },

  login: {
    id: 'login',
    name: 'Login / Sign In',
    path: '/login',
    sidebarLabel: 'Sign In',
    sidebarIcon: '🔑',
    pageTitle: 'Sign In to CareerPulse',
    purpose: 'Authenticate as a student to access your personalized career twin, profile, and tools.',
    description: 'Secure JWT authentication for students.',
    howToUse: ['Enter your registered email and password to log in.'],
    prerequisites: ['Registered student account'],
    commonTroubleshooting: ['If login fails, verify your credentials or check your connection.'],
    isImplemented: true,
    keywords: ['login', 'sign in', 'authenticate', 'password', 'logout', 'account'],
  },

  home: {
    id: 'home',
    name: 'Home / Landing Page',
    path: '/',
    sidebarLabel: 'Home',
    sidebarIcon: '🌐',
    pageTitle: 'CareerPulse — Discover, Plan, Skill, Grow',
    purpose: 'Welcome landing page explaining the CareerPulse career development platform.',
    description: 'Introduction to CareerPulse platform features, AI career twins, and student onboarding.',
    howToUse: ['Visit the home page to learn about platform capabilities or click "Get Started" to sign in.'],
    prerequisites: ['None'],
    commonTroubleshooting: [],
    isImplemented: true,
    keywords: ['home', 'landing page', 'about careerpulse', 'welcome'],
  },
};

/**
 * Registry of features that are frequently asked about but are explicitly NOT supported/implemented.
 * The AI uses this to give honest, transparent answers and prevent hallucinations.
 */
export interface NonexistentFeature {
  id: string;
  name: string;
  keywords: string[];
  explanation: string;
  recommendedAlternative: {
    name: string;
    path: string;
  };
}

export const NONEXISTENT_FEATURES: NonexistentFeature[] = [
  {
    id: 'campus_events',
    name: 'Campus Events & Calendar',
    keywords: ['campus event', 'campus events', 'event calendar', 'college fest', 'hackathon meetup', 'campus schedule'],
    explanation:
      'CareerPulse does not host or manage campus event calendars, college fests, or extracurricular event registrations.',
    recommendedAlternative: {
      name: 'Opportunities & Roadmaps',
      path: '/opportunities',
    },
  },
  {
    id: 'financial_aid',
    name: 'Financial Aid & Scholarships',
    keywords: ['financial aid', 'scholarship', 'scholarships', 'tuition', 'fee payment', 'fees', 'tuition grant', 'student loan'],
    explanation:
      'CareerPulse does not provide tuition payment processing, student loans, or financial aid / scholarship management.',
    recommendedAlternative: {
      name: 'Course Hub',
      path: '/courses',
    },
  },
  {
    id: 'direct_messaging',
    name: 'Direct Recruiter Messaging & In-App Job Applications',
    keywords: ['message recruiter', 'chat with hr', 'direct apply', 'in-app application', 'send message to employer'],
    explanation:
      'CareerPulse provides skill matching for job and internship postings on the Opportunities page, but does not support direct in-app messaging with recruiters or in-app job submissions.',
    recommendedAlternative: {
      name: 'Opportunities',
      path: '/opportunities',
    },
  },
  {
    id: 'tutor_video_calls',
    name: 'Live 1-on-1 Tutor Video Calls',
    keywords: ['video call', 'tutor call', '1 on 1 tutor', 'live tutor', 'zoom mentor', 'call mentor', 'book call'],
    explanation:
      'CareerPulse does not provide live 1-on-1 human video tutoring or teleconferencing. Guidance is provided directly by CareerPulse AI and structured learning roadmaps.',
    recommendedAlternative: {
      name: 'My Learning Roadmap',
      path: '/roadmap',
    },
  },
  {
    id: 'alumni_social_network',
    name: 'Alumni Directory & Peer Social Chat',
    keywords: ['alumni', 'alumni network', 'peer chat', 'student chat', 'direct message student', 'friends list', 'social network'],
    explanation:
      'CareerPulse is a career analytics and skill progression platform, not a social network or peer messaging service.',
    recommendedAlternative: {
      name: 'My Skill Profile',
      path: '/skills',
    },
  },
  {
    id: 'hostel_housing',
    name: 'Hostel & Housing Management',
    keywords: ['hostel', 'dorm', 'dormitory', 'room allotment', 'campus housing'],
    explanation:
      'CareerPulse does not handle college accommodation, hostel room booking, or campus housing.',
    recommendedAlternative: {
      name: 'Dashboard',
      path: '/dashboard',
    },
  },
];

/**
 * Checks if a given internal route is on the strict allowlist.
 */
export function isRouteAllowlisted(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  const cleanPath = path.trim().split('?')[0].split('#')[0];
  return ALLOWLISTED_INTERNAL_ROUTES.includes(cleanPath);
}

/**
 * Finds a platform feature by path.
 */
export function getFeatureByPath(path: string): PlatformFeature | undefined {
  const cleanPath = path.trim().split('?')[0].split('#')[0];
  return Object.values(PLATFORM_FEATURES).find((f) => f.path === cleanPath);
}

/**
 * Checks if a user's query refers to a known nonexistent feature.
 */
export function detectNonexistentFeature(query: string): NonexistentFeature | undefined {
  const q = query.toLowerCase();
  return NONEXISTENT_FEATURES.find((item) =>
    item.keywords.some((kw) => q.includes(kw.toLowerCase())),
  );
}
