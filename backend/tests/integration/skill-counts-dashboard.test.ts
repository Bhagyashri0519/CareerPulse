import request from 'supertest';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import app from '../../src/app';
import { Resume } from '../../src/modules/resumes/resume.model';
import { StudentProfile } from '../../src/modules/profiles/profile.model';
import { normalizeSkillsFromText } from '../../src/modules/resumes/normalizer/skill.normalizer';
import { detectSections } from '../../src/modules/resumes/extractors/section.detector';
import {
  ROLE_BENCHMARKS,
  countExtractedClaims,
  countImportedSkills,
  countUnverifiedSkills,
  countVerifiedSkills,
  countCareerRequiredSkills,
  calculateCareerMetrics,
  isSkillVerified,
} from '../../../frontend/src/utils/careerMetrics';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_careerpulse_2026';

describe('Skill Counts & Dashboard Data Consistency Regression Suite', () => {
  const userAId = '660c1f2e8f1b2c001a111111';
  const userBId = '660c1f2e8f1b2c001a222222';

  const tokenUserA = jwt.sign({ userId: userAId, role: 'student' }, JWT_SECRET, { expiresIn: '1d' });
  const tokenUserB = jwt.sign({ userId: userBId, role: 'student' }, JWT_SECRET, { expiresIn: '1d' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Resume Extracted Claims & Duplicate Deduplication', () => {
    it('should extract exactly 11 unique canonical claims from a resume mentioning 11 canonical skills', () => {
      // Resume text mentioning 11 distinct canonical skills from taxonomy:
      // 1. JavaScript, 2. TypeScript, 3. React, 4. HTML/CSS, 5. Node.js,
      // 6. MongoDB, 7. Python, 8. SQL, 9. Machine Learning, 10. Communication, 11. Problem Solving
      const resumeWith11Skills = `
        TECHNICAL SKILLS
        Languages: JavaScript, TypeScript, Python, SQL
        Frontend: React, HTML/CSS
        Backend: Node.js, MongoDB
        AI & Data: Machine Learning
        Soft Skills: Communication, Problem Solving
      `;

      const sections = detectSections(resumeWith11Skills);
      const claims = normalizeSkillsFromText(resumeWith11Skills, sections);

      expect(claims.length).toBe(11);
      const canonicalIds = new Set(claims.map((c) => c.canonicalId));
      expect(canonicalIds.size).toBe(11);
      expect(canonicalIds).toContain('skill_fe_javascript');
      expect(canonicalIds).toContain('skill_fe_typescript');
      expect(canonicalIds).toContain('skill_fe_react');
      expect(canonicalIds).toContain('skill_fe_html_css');
      expect(canonicalIds).toContain('skill_be_nodejs');
      expect(canonicalIds).toContain('skill_be_mongodb');
      expect(canonicalIds).toContain('skill_ai_python');
      expect(canonicalIds).toContain('skill_data_sql');
      expect(canonicalIds).toContain('skill_ai_machine_learning');
      expect(canonicalIds).toContain('skill_soft_communication');
      expect(canonicalIds).toContain('skill_soft_problem_solving');
    });

    it('should deduplicate repeated mentions of the same canonical skill (e.g. React, React.js, ReactJS)', () => {
      const resumeWithDuplicates = `
        Skills: React, React.js, ReactJS, Node.js, Node, Server-side JS, Python, Python3.
        Projects: Built app using React 18 and Node runtime.
      `;

      const sections = detectSections(resumeWithDuplicates);
      const claims = normalizeSkillsFromText(resumeWithDuplicates, sections);

      // React mentions -> exactly 1 canonical claim
      const reactClaims = claims.filter((c) => c.canonicalId === 'skill_fe_react');
      expect(reactClaims.length).toBe(1);

      // Node mentions -> exactly 1 canonical claim
      const nodeClaims = claims.filter((c) => c.canonicalId === 'skill_be_nodejs');
      expect(nodeClaims.length).toBe(1);

      // Python mentions -> exactly 1 canonical claim
      const pythonClaims = claims.filter((c) => c.canonicalId === 'skill_ai_python');
      expect(pythonClaims.length).toBe(1);

      // Total claims should be exactly 4 unique canonical skills (React, Node, Python, JavaScript)
      expect(claims.length).toBe(4);
      const canonicalIds = claims.map((c) => c.canonicalId);
      expect(canonicalIds).toContain('skill_fe_react');
      expect(canonicalIds).toContain('skill_be_nodejs');
      expect(canonicalIds).toContain('skill_ai_python');
      expect(canonicalIds).toContain('skill_fe_javascript');
    });

    it('countExtractedClaims helper should deduplicate repeated canonicalId entries in resume claimedSkills', () => {
      const mockResumeWithDuplicates: any = {
        id: 'res_1',
        fileName: 'resume.pdf',
        claimedSkills: [
          { canonicalId: 'skill_fe_react', name: 'React', category: 'frontend', isImported: false },
          { canonicalId: 'skill_fe_react', name: 'React.js', category: 'frontend', isImported: false },
          { canonicalId: 'skill_be_nodejs', name: 'Node.js', category: 'backend', isImported: false },
        ],
      };

      const count = countExtractedClaims(mockResumeWithDuplicates);
      expect(count).toBe(2);
    });
  });

  describe('2. Profile Skills, Verification Integrity, and Evidence Lifecycle', () => {
    it('should report importedSkillsCount === 2 for a profile with 2 imported skills', () => {
      const mockProfile: any = {
        userId: userAId,
        skills: [
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            level: 0,
            tier: 'beginner',
            evidence: [{ source: 'resume_extracted', sourceId: 'res_1', score: 0, verifiedStatus: 'unverified' }],
          },
          {
            canonicalId: 'skill_be_nodejs',
            name: 'Node.js',
            level: 0,
            tier: 'beginner',
            evidence: [{ source: 'resume_extracted', sourceId: 'res_1', score: 0, verifiedStatus: 'unverified' }],
          },
        ],
      };

      expect(countImportedSkills(mockProfile)).toBe(2);
      expect(countUnverifiedSkills(mockProfile)).toBe(2);
      expect(countVerifiedSkills(mockProfile)).toBe(0);
    });

    it('should distinguish verified from unverified skills and not inflate counts from duplicate evidence records', () => {
      const mockProfile: any = {
        userId: userAId,
        skills: [
          // Skill 1: Verified via assessment quiz
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            level: 80,
            tier: 'proficient',
            evidence: [
              { source: 'resume_extracted', sourceId: 'res_1', score: 0, verifiedStatus: 'unverified' },
              { source: 'quiz_assessment', sourceId: 'quiz_101', score: 85, verifiedStatus: 'verified' },
            ],
          },
          // Skill 2: Unverified with multiple resume references (should count as 1 unverified skill)
          {
            canonicalId: 'skill_be_nodejs',
            name: 'Node.js',
            level: 0,
            tier: 'beginner',
            evidence: [
              { source: 'resume_extracted', sourceId: 'res_1', score: 0, verifiedStatus: 'unverified' },
              { source: 'resume_extracted', sourceId: 'res_2', score: 0, verifiedStatus: 'unverified' },
            ],
          },
        ],
      };

      expect(countImportedSkills(mockProfile)).toBe(2);
      expect(countVerifiedSkills(mockProfile)).toBe(1);
      expect(countUnverifiedSkills(mockProfile)).toBe(1);

      expect(isSkillVerified(mockProfile.skills[0])).toBe(true);
      expect(isSkillVerified(mockProfile.skills[1])).toBe(false);
    });

    it('should not infer verification from profile presence or resume extraction alone', () => {
      const selfReportedSkill: any = {
        canonicalId: 'skill_ai_python',
        name: 'Python',
        level: 80,
        tier: 'advanced',
        evidence: [{ source: 'self_report', score: 80, verifiedStatus: 'unverified' }],
      };

      const resumeExtractedSkill: any = {
        canonicalId: 'skill_data_sql',
        name: 'SQL',
        level: 0,
        tier: 'beginner',
        evidence: [{ source: 'resume_extracted', score: 0, verifiedStatus: 'unverified' }],
      };

      expect(isSkillVerified(selfReportedSkill)).toBe(false);
      expect(isSkillVerified(resumeExtractedSkill)).toBe(false);
    });
  });

  describe('3. Target Career Taxonomy & Required Skill Denominators', () => {
    it('should return careerRequiredSkillsCount === 6 for role_fullstack_dev', () => {
      const benchmark = ROLE_BENCHMARKS['role_fullstack_dev'];
      expect(benchmark).toBeDefined();
      expect(benchmark.requiredSkills.length).toBe(6);
      expect(countCareerRequiredSkills('role_fullstack_dev')).toBe(6);
    });

    it('should return careerRequiredSkillsCount === 0 and hasTargetRole === false when no target career is selected', () => {
      expect(countCareerRequiredSkills(null)).toBe(0);
      expect(countCareerRequiredSkills(undefined)).toBe(0);
      expect(countCareerRequiredSkills('')).toBe(0);

      const metrics = calculateCareerMetrics(
        { userId: userAId, targetRoleId: null, skills: [] } as any,
        [],
      );

      expect(metrics.hasTargetRole).toBe(false);
      expect(metrics.careerRequiredSkillsCount).toBe(0);
      expect(metrics.targetRoleTitle).toBe('No Target Career Selected');
      expect(metrics.careerFitDisplay).toBe('No Target Role');
      expect(metrics.skillsReadyRatio).toBe('—');
    });

    it('should not assume Full Stack Developer or UI/UX Designer when targetRoleId is null', () => {
      const metrics = calculateCareerMetrics(
        { userId: userAId, targetRoleId: undefined, skills: [] } as any,
        [],
      );
      expect(metrics.hasTargetRole).toBe(false);
      expect(metrics.targetRoleTitle).not.toBe('Full Stack Developer');
      expect(metrics.targetRoleTitle).not.toBe('UI/UX Designer');
    });
  });

  describe('4. Comprehensive Dashboard Metrics Consistency (Expected Example)', () => {
    it('should separately calculate: Resume claims = 11, Profile skills = 2, Career required = 6, Verified = 0', () => {
      // 1. Resume with 11 canonical skills
      const resume11Claims = [
        'skill_fe_javascript',
        'skill_fe_typescript',
        'skill_fe_react',
        'skill_fe_html_css',
        'skill_be_nodejs',
        'skill_be_mongodb',
        'skill_ai_python',
        'skill_data_sql',
        'skill_ai_machine_learning',
        'skill_soft_communication',
        'skill_soft_problem_solving',
      ].map((id) => ({
        canonicalId: id,
        name: id,
        category: 'tech',
        confidence: 0.9,
        contextSnippet: 'test snippet',
        isImported: false,
      }));

      const mockResume: any = {
        id: 'res_11_skills',
        fileName: 'full_resume.pdf',
        claimedSkills: resume11Claims,
      };

      // 2. Profile with 2 imported unverified skills
      const mockProfile: any = {
        userId: userAId,
        targetRoleId: 'role_fullstack_dev', // Target career requires 6 skills
        skills: [
          {
            canonicalId: 'skill_fe_javascript',
            name: 'JavaScript',
            level: 0,
            tier: 'beginner',
            evidence: [{ source: 'resume_extracted', sourceId: 'res_11_skills', score: 0, verifiedStatus: 'unverified' }],
          },
          {
            canonicalId: 'skill_ai_python',
            name: 'Python',
            level: 0,
            tier: 'beginner',
            evidence: [{ source: 'resume_extracted', sourceId: 'res_11_skills', score: 0, verifiedStatus: 'unverified' }],
          },
        ],
      };

      const metrics = calculateCareerMetrics(mockProfile, [mockResume]);

      // Assert explicit metric definitions
      expect(metrics.extractedClaimsCount).toBe(11);          // Metric A: 11 canonical claims from resume
      expect(metrics.importedSkillsCount).toBe(2);             // Metric B: 2 skills in profile
      expect(metrics.unverifiedSkillsCount).toBe(2);           // Metric C: 2 unverified claims
      expect(metrics.verifiedSkillsCount).toBe(0);             // Metric D: 0 verified skills
      expect(metrics.careerRequiredSkillsCount).toBe(6);       // Metric E: 6 required skills for role_fullstack_dev

      // Assert that values are NOT forced to match
      expect(metrics.extractedClaimsCount).not.toBe(metrics.importedSkillsCount);
      expect(metrics.extractedClaimsCount).not.toBe(metrics.careerRequiredSkillsCount);
      expect(metrics.importedSkillsCount).not.toBe(metrics.careerRequiredSkillsCount);

      // Metric F: When only unverified claims exist, careerFitDisplay and skillsReadyRatio show "Not evaluated"
      expect(metrics.careerFitDisplay).toBe('Not evaluated');
      expect(metrics.skillsReadyRatio).toBe('Not evaluated');
      expect(metrics.readinessDisplay).toBe('0%');
    });

    it('should correctly calculate verified career-fit and readiness when genuine assessment evidence exists', () => {
      const mockProfile: any = {
        userId: userAId,
        targetRoleId: 'role_fullstack_dev', // Requires 6 skills: JS, TS, React, Node, Mongo, Problem Solving
        skills: [
          // 1. JS: verified at level 85 (satisfies 85 minLevel, weight 0.20)
          {
            canonicalId: 'skill_fe_javascript',
            name: 'JavaScript',
            level: 85,
            tier: 'advanced',
            evidence: [{ source: 'quiz_assessment', score: 90, verifiedStatus: 'verified' }],
          },
          // 2. React: verified at level 80 (satisfies 80 minLevel, weight 0.20)
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            level: 80,
            tier: 'advanced',
            evidence: [{ source: 'quiz_assessment', score: 85, verifiedStatus: 'verified' }],
          },
          // 3. Node.js: unverified
          {
            canonicalId: 'skill_be_nodejs',
            name: 'Node.js',
            level: 0,
            tier: 'beginner',
            evidence: [{ source: 'resume_extracted', score: 0, verifiedStatus: 'unverified' }],
          },
        ],
      };

      const metrics = calculateCareerMetrics(mockProfile, []);

      expect(metrics.importedSkillsCount).toBe(3);
      expect(metrics.verifiedSkillsCount).toBe(2);
      expect(metrics.unverifiedSkillsCount).toBe(1);
      expect(metrics.careerRequiredSkillsCount).toBe(6);

      // 2 out of 6 required skills matched with verified proficiency -> round(2/6 * 100) = 33%
      expect(metrics.careerFitPercentage).toBe(33);
      expect(metrics.careerFitDisplay).toBe('33%');

      // 2 skills meet or exceed benchmark minLevel
      expect(metrics.skillsReadyRatio).toBe('2/6');
      expect(metrics.gapsCount).toBe(4); // 6 - 2 = 4
    });
  });

  describe('5. Multiple Resumes Handling & Isolation', () => {
    it('should isolate extracted claims to the selected resume and not sum all historical claims into one count', () => {
      const resume1: any = {
        id: 'res_1',
        fileName: 'resume_frontend.pdf',
        claimedSkills: [
          { canonicalId: 'skill_fe_react', name: 'React' },
          { canonicalId: 'skill_fe_typescript', name: 'TypeScript' },
        ],
      };

      const resume2: any = {
        id: 'res_2',
        fileName: 'resume_backend.pdf',
        claimedSkills: [
          { canonicalId: 'skill_be_nodejs', name: 'Node.js' },
          { canonicalId: 'skill_be_mongodb', name: 'MongoDB' },
          { canonicalId: 'skill_data_sql', name: 'SQL' },
        ],
      };

      // By default, latest resume (resume1) is selected
      const metricsResume1 = calculateCareerMetrics(null, [resume1, resume2]);
      expect(metricsResume1.extractedClaimsCount).toBe(2);
      expect(metricsResume1.activeResume?.id).toBe('res_1');
      expect(metricsResume1.allResumesUniqueClaimsCount).toBe(5); // Deduplicated across all

      // When resume2 is explicitly selected
      const metricsResume2 = calculateCareerMetrics(null, [resume1, resume2], 'res_2');
      expect(metricsResume2.extractedClaimsCount).toBe(3);
      expect(metricsResume2.activeResume?.id).toBe('res_2');
    });
  });

  describe('6. API Endpoints, Idempotency, and Multi-User Isolation', () => {
    it('GET /api/v1/resumes should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/resumes');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/resumes/:id should reject invalid ObjectId with 422', async () => {
      const res = await request(app)
        .get('/api/v1/resumes/not-a-valid-id')
        .set('Authorization', `Bearer ${tokenUserA}`);
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/resumes/:id should return 404 for non-existent resume', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/resumes/670c1f2e8f1b2c001a999999')
        .set('Authorization', `Bearer ${tokenUserA}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/resumes/:id should enforce strict user isolation (403 when User B accesses User A resume)', async () => {
      const fakeResume = {
        _id: '670c1f2e8f1b2c001a999001',
        userId: userAId,
        fileName: 'user_a_resume.pdf',
        claimedSkills: [],
      };

      jest.spyOn(Resume, 'findById').mockResolvedValue(fakeResume as any);

      const res = await request(app)
        .get('/api/v1/resumes/670c1f2e8f1b2c001a999001')
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });

    it('POST /api/v1/resumes/:id/apply-skills should idempotently import skills and preserve existing assessed proficiency', async () => {
      const resumeId = '670c1f2e8f1b2c001a999001';

      const mockResumeDoc: any = {
        _id: new mongoose.Types.ObjectId(resumeId),
        userId: userAId,
        claimedSkills: [
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            category: 'frontend',
            confidence: 0.9,
            contextSnippet: 'React',
            isImported: false,
          },
          {
            canonicalId: 'skill_fe_typescript',
            name: 'TypeScript',
            category: 'frontend',
            confidence: 0.85,
            contextSnippet: 'TypeScript',
            isImported: false,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      // Existing profile already has React assessed at level 80 with verified evidence
      const mockProfileDoc: any = {
        userId: new mongoose.Types.ObjectId(userAId),
        skills: [
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            category: 'frontend',
            level: 80,
            tier: 'proficient',
            lastAssessedAt: new Date(),
            evidence: [
              { source: 'quiz_assessment', sourceId: 'quiz_11', score: 85, verifiedStatus: 'verified' },
            ],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResumeDoc);
      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfileDoc);

      const res = await request(app)
        .post(`/api/v1/resumes/${resumeId}/apply-skills`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react', 'skill_fe_typescript'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify that React preserved its level 80 and tier 'proficient'
      const reactSkill = mockProfileDoc.skills.find((s: any) => s.canonicalId === 'skill_fe_react');
      expect(reactSkill.level).toBe(80);
      expect(reactSkill.tier).toBe('proficient');

      // Verify React has 2 evidence records now (quiz + new unverified resume evidence)
      expect(reactSkill.evidence.length).toBe(2);
      expect(reactSkill.evidence[0].verifiedStatus).toBe('verified');
      expect(reactSkill.evidence[1].verifiedStatus).toBe('unverified');

      // Verify TypeScript was added with level 0 and unverified evidence
      const tsSkill = mockProfileDoc.skills.find((s: any) => s.canonicalId === 'skill_fe_typescript');
      expect(tsSkill).toBeDefined();
      expect(tsSkill.level).toBe(0);
      expect(tsSkill.evidence[0].verifiedStatus).toBe('unverified');

      // REPEATED IMPORT (Idempotency test)
      // Importing the exact same skills again should NOT duplicate evidence or create duplicate skills
      await request(app)
        .post(`/api/v1/resumes/${resumeId}/apply-skills`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react', 'skill_fe_typescript'] });

      expect(mockProfileDoc.skills.filter((s: any) => s.canonicalId === 'skill_fe_react').length).toBe(1);
      expect(reactSkill.evidence.length).toBe(2); // Still 2, not 3
      expect(tsSkill.evidence.length).toBe(1);    // Still 1, not 2
    });
  });
});
