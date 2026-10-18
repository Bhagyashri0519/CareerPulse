import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { User } from '../../src/modules/users/user.model';
import { StudentProfile } from '../../src/modules/profiles/profile.model';
import { Resume } from '../../src/modules/resumes/resume.model';
import { aiProviderService } from '../../src/modules/ai/ai.provider.service';
import { ALLOWLISTED_INTERNAL_ROUTES } from '../../src/modules/ai/feature-registry';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_careerpulse_2026';

describe('CareerPulse AI — Mentor & Website Guide Regression Suite', () => {
  const studentAId = '660c1f2e8f1b2c001a123456';
  const studentBId = '660c1f2e8f1b2c001a999999';

  const tokenStudentA = jwt.sign(
    { userId: studentAId, role: 'student' },
    JWT_SECRET,
    { expiresIn: '7d' },
  );

  const tokenStudentB = jwt.sign(
    { userId: studentBId, role: 'student' },
    JWT_SECRET,
    { expiresIn: '7d' },
  );

  const mockUserA = {
    _id: studentAId,
    email: 'shraddha@university.edu',
    name: 'Shraddha Bhosale',
    role: 'student',
    createdAt: new Date(),
  };

  const mockProfileA = {
    _id: '660c1f2e8f1b2c001a123457',
    userId: studentAId,
    degree: 'B.Tech',
    branch: 'Computer Science',
    year: 3,
    cgpa: 8.8,
    weeklyLearningHours: 12,
    targetRoleId: 'role_fullstack_dev',
    skills: [
      {
        canonicalId: 'skill_fe_react',
        name: 'React',
        category: 'frontend',
        level: 80,
        tier: 'advanced',
        evidence: [{ source: 'quiz_assessment', score: 85, verifiedStatus: 'verified', recordedAt: new Date() }],
      },
      {
        canonicalId: 'skill_be_nodejs',
        name: 'Node.js',
        category: 'backend',
        level: 70,
        tier: 'proficient',
        evidence: [{ source: 'resume_extracted', score: 70, verifiedStatus: 'unverified', recordedAt: new Date() }],
      },
    ],
  };

  const mockResumeA = {
    _id: '660c1f2e8f1b2c001a123458',
    userId: studentAId,
    fileName: 'Shraddha_Bhosale_Resume.pdf',
    parseStatus: 'completed',
    uploadedAt: new Date(),
    claimedSkills: [
      { canonicalId: 'skill_fe_react', name: 'React', category: 'frontend', confidence: 0.95, isImported: true },
      { canonicalId: 'skill_be_nodejs', name: 'Node.js', category: 'backend', confidence: 0.9, isImported: true },
      { canonicalId: 'skill_data_sql', name: 'SQL', category: 'database', confidence: 0.85, isImported: false },
    ],
  };

  const mockUserB = {
    _id: studentBId,
    email: 'rahul@university.edu',
    name: 'Rahul Verma',
    role: 'student',
    createdAt: new Date(),
  };

  const mockProfileB = {
    _id: '660c1f2e8f1b2c001a999998',
    userId: studentBId,
    degree: 'B.Sc',
    branch: 'Data Science',
    year: 2,
    cgpa: 9.1,
    weeklyLearningHours: 15,
    targetRoleId: 'role_data_analyst',
    skills: [
      {
        canonicalId: 'skill_data_python',
        name: 'Python',
        category: 'data_ai',
        level: 85,
        tier: 'advanced',
        evidence: [{ source: 'quiz_assessment', score: 90, verifiedStatus: 'verified', recordedAt: new Date() }],
      },
    ],
  };

  const mockResumeB = {
    _id: '660c1f2e8f1b2c001a999997',
    userId: studentBId,
    fileName: 'Rahul_Verma_Resume.docx',
    parseStatus: 'completed',
    uploadedAt: new Date(),
    claimedSkills: [
      { canonicalId: 'skill_data_python', name: 'Python', category: 'data_ai', confidence: 0.92, isImported: true },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation to route to Student A or B based on ID
    jest.spyOn(User, 'findById').mockImplementation((id: any) => {
      const idStr = id?.toString();
      const user = idStr === studentBId ? mockUserB : mockUserA;
      return {
        select: jest.fn().mockResolvedValue(user),
      } as any;
    });

    jest.spyOn(StudentProfile, 'findOne').mockImplementation((query: any) => {
      const idStr = query?.userId?.toString();
      const profile = idStr === studentBId ? mockProfileB : mockProfileA;
      return Promise.resolve(profile) as any;
    });

    jest.spyOn(Resume, 'findOne').mockImplementation((query: any) => {
      const idStr = query?.userId?.toString();
      const resume = idStr === studentBId ? mockResumeB : mockResumeA;
      return {
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(resume),
        }),
      } as any;
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 1: "Where should I upload my resume?"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 1: "Where should I upload my resume?"', () => {
    it('should provide the exact page, navigation steps, file constraints, and selective-import caveat', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'Where should I upload my resume?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      // 1. Direct answer with exact page name and route
      expect(reply).toContain('Resume Analysis');
      expect(reply).toContain('/resume');
      // 2. Actionable numbered instructions
      expect(reply).toMatch(/1\.\s+.*sidebar/i);
      expect(reply).toMatch(/2\.\s+.*Resume Analysis/i);
      expect(reply).toMatch(/3\.\s+.*(upload|browse)/i);
      // 3. Supported file formats and limits
      expect(reply).toMatch(/PDF/i);
      expect(reply).toMatch(/DOCX/i);
      expect(reply).toMatch(/10MB/i);
      // 4. Distinction between claims and imported profile skills
      expect(reply).toMatch(/extracts claims.*not automatically import/i);
      // 5. Actionable navigation link/button
      expect(res.body.data.actions).toBeDefined();
      const hasResumeAction = res.body.data.actions.some((a: any) => a.path === '/resume');
      expect(hasResumeAction).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 2: "How can I add my CV?"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 2: "How can I add my CV?"', () => {
    it('should understand CV as resume and return the exact same accurate workflow', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'How can I add my CV?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      expect(reply).toContain('Resume Analysis');
      expect(reply).toContain('/resume');
      expect(reply).toMatch(/PDF.*DOCX/i);
      expect(reply).toMatch(/10MB/i);
      expect(reply).toMatch(/extracts claims/i);
      expect(res.body.data.actions.some((a: any) => a.path === '/resume')).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 3: "How do I import skills from my resume?"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 3: "How do I import skills from my resume?"', () => {
    it('should explain the Clean Skill Cards view and selective import workflow', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'How do I import skills from my resume?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      expect(reply).toContain('Resume Analysis');
      expect(reply).toMatch(/Skills.*tab|Clean Skill Cards/i);
      expect(reply).toMatch(/checkbox(es)?/i);
      expect(reply).toMatch(/Import Selected Skills to Profile/i);
      expect(res.body.data.actions.some((a: any) => a.path === '/resume')).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 4: "Why are my resume skills not showing in my profile?"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 4: "Why are my resume skills not showing in my profile?"', () => {
    it('should explain the difference between extracted claims and imported skills without falsely claiming import failure', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'Why are my resume skills not showing in my profile?', currentPage: '/skills' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      expect(reply).toMatch(/selective import|not appear.*automatically/i);
      expect(reply).toContain('Resume Analysis');
      expect(reply).toMatch(/Import Selected Skills to Profile/i);
      expect(reply).not.toContain('Import failed unexpectedly');
      expect(res.body.data.actions.some((a: any) => a.path === '/resume')).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 5: "Where can I see my profile?"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 5: "Where can I see my profile?"', () => {
    it('should direct user to Student Profile and explain its fields', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'Where can I see my profile?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      expect(reply).toContain('Student Profile');
      expect(reply).toContain('/profile');
      expect(reply).toMatch(/Target Career Role|academic credentials/i);
      expect(res.body.data.actions.some((a: any) => a.path === '/profile')).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 6: "What does my dashboard mean?"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 6: "What does my dashboard mean?"', () => {
    it('should explain Career Readiness, Career Fit, and Audit Cards A-E', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'What does my dashboard mean?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      expect(reply).toContain('Career Readiness');
      expect(reply).toContain('Career Fit');
      expect(reply).toMatch(/A\.\s+Resume Claims/i);
      expect(reply).toMatch(/B\.\s+Profile Skills/i);
      expect(reply).toMatch(/C\.\s+Unverified Claims/i);
      expect(reply).toMatch(/D\.\s+Verified Skills/i);
      expect(reply).toMatch(/E\.\s+Career Required/i);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 7: "How do I get started as a new user?"
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 7: "How do I get started as a new user?"', () => {
    it('should provide the 5-step onboarding workflow with routes', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'How do I get started as a new user?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      expect(reply).toContain('My Profile');
      expect(reply).toContain('Resume Analysis');
      expect(reply).toContain('Career Assessment');
      expect(reply).toContain('My Roadmap');
      expect(res.body.data.actions.length).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 8: Question about a nonexistent feature
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 8: Question about a nonexistent feature', () => {
    it('should admit when a feature does not exist and recommend real alternatives', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'Where can I see campus events and sports calendar?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      expect(reply).toMatch(/does not (currently )?(have|offer|host).*Campus Events/i);
      expect(reply).toMatch(/Features available on CareerPulse/i);
      expect(res.body.data.actions).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 9: Follow-up question referring to previous answer
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 9: Follow-up question referring to previous answer', () => {
    it('should maintain context and answer follow-up questions accurately', async () => {
      const history = [
        { role: 'user' as const, content: 'Where should I upload my resume?' },
        {
          role: 'assistant' as const,
          content: 'You can upload your resume on [Resume Analysis](/resume). Select skills to import under the Skills tab.',
        },
      ];

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({
          message: 'How do I do step 6 and select the skills?',
          history,
          currentPage: '/resume',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reply = res.body.data.reply;
      expect(reply).toMatch(/resume|skill|import/i);
      expect(reply).toContain('/resume');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 10: Provider not configured
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 10: Provider not configured', () => {
    it('should use guided_navigator transparently without pretending to be a live model', async () => {
      // Ensure provider keys are undefined
      const origGemini = process.env.GEMINI_API_KEY;
      const origOpenai = process.env.OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.GROQ_API_KEY;

      try {
        const res = await request(app)
          .post('/api/v1/ai/chat')
          .set('Authorization', `Bearer ${tokenStudentA}`)
          .send({ message: 'Where can I see my skills?', currentPage: '/dashboard' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.meta.isLiveAI).toBe(false);
        expect(res.body.data.meta.provider).toBe('guided_navigator');
        expect(res.body.data.reply).toContain('My Skills');
        expect(res.body.data.reply).toContain('/skills');
      } finally {
        if (origGemini) process.env.GEMINI_API_KEY = origGemini;
        if (origOpenai) process.env.OPENAI_API_KEY = origOpenai;
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 11: Provider timeout or failure
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 11: Provider timeout or failure', () => {
    it('should fall back gracefully to verified website guidance when provider errors', async () => {
      // Mock callExternalLLM to throw an error
      jest.spyOn(aiProviderService, 'getProviderConfig').mockReturnValue({
        type: 'gemini',
        key: 'fake_test_key',
      });

      jest.spyOn(aiProviderService, 'callExternalLLM').mockRejectedValue(new Error('Simulated Gemini 503 Timeout'));

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${tokenStudentA}`)
        .send({ message: 'Where should I upload my resume?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.meta.isLiveAI).toBe(false);
      expect(res.body.data.meta.provider).toBe('guided_navigator');
      expect(res.body.data.reply).toContain('Resume Analysis');
      expect(res.body.data.reply).toContain('/resume');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 12: Invalid or unregistered navigation destination
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 12: Invalid or unregistered navigation destination', () => {
    it('should filter out arbitrary external URLs or unknown routes from navigation actions', () => {
      const maliciousText = `
        Check out [Evil Site](http://evil.com/phish) and [Invalid Path](/secret-admin-hack).
        Also visit [Resume Analysis](/resume) and [My Skills](/skills).
      `;

      const actions = aiProviderService.extractNavigationActions(maliciousText, '/dashboard');

      for (const action of actions) {
        expect(ALLOWLISTED_INTERNAL_ROUTES.includes(action.path)).toBe(true);
        expect(action.path.startsWith('/')).toBe(true);
        expect(action.path).not.toContain('http');
        expect(action.path).not.toContain('evil');
        expect(action.path).not.toContain('secret');
      }

      const paths = actions.map((a) => a.path);
      expect(paths).toContain('/resume');
      expect(paths).toContain('/skills');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 13: Unauthorized access to student-specific context
  // ──────────────────────────────────────────────────────────────────────────
  describe('Case 13: Unauthorized access to student-specific context', () => {
    it('POST /api/v1/ai/chat — should reject unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .send({ message: 'Where should I upload my resume?' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/ai/context — should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/ai/context');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // CASE 14: Two students must not receive each other's private context
  // ──────────────────────────────────────────────────────────────────────────
  describe("Case 14: Two students must not receive each other's private context", () => {
    it('should isolate context so Student A and Student B never see each other data', async () => {
      // 1. Query as Student A (Shraddha)
      const resA = await request(app)
        .get('/api/v1/ai/context')
        .set('Authorization', `Bearer ${tokenStudentA}`);

      expect(resA.status).toBe(200);
      expect(resA.body.data.studentName).toBe('Shraddha Bhosale');
      expect(resA.body.data.targetCareer.title).toBe('Full Stack Developer');
      expect(resA.body.data.resume.fileName).toBe('Shraddha_Bhosale_Resume.pdf');
      // Must not contain Student B's data
      expect(resA.body.data.studentName).not.toContain('Rahul');
      expect(resA.body.data.resume.fileName).not.toContain('Rahul');

      // 2. Query as Student B (Rahul)
      const resB = await request(app)
        .get('/api/v1/ai/context')
        .set('Authorization', `Bearer ${tokenStudentB}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.studentName).toBe('Rahul Verma');
      expect(resB.body.data.targetCareer.title).toBe('Data Analyst');
      expect(resB.body.data.resume.fileName).toBe('Rahul_Verma_Resume.docx');
      // Must not contain Student A's data
      expect(resB.body.data.studentName).not.toContain('Shraddha');
      expect(resB.body.data.resume.fileName).not.toContain('Shraddha');
    });
  });
});
