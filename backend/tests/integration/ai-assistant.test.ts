import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { User } from '../../src/modules/users/user.model';
import { StudentProfile } from '../../src/modules/profiles/profile.model';
import { Resume } from '../../src/modules/resumes/resume.model';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_careerpulse_2026';

describe('CareerPulse AI — Mentor & Website Guide Integration Tests', () => {
  const fakeUserId = '660c1f2e8f1b2c001a123456';
  const validToken = jwt.sign(
    { userId: fakeUserId, role: 'student' },
    JWT_SECRET,
    { expiresIn: '7d' },
  );

  const mockUser = {
    _id: fakeUserId,
    email: 'shraddha@university.edu',
    name: 'Shraddha Bhosale',
    role: 'student',
    createdAt: new Date(),
  };

  const mockProfile = {
    _id: '660c1f2e8f1b2c001a123457',
    userId: fakeUserId,
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

  const mockResume = {
    _id: '660c1f2e8f1b2c001a123458',
    userId: fakeUserId,
    fileName: 'Shraddha_Bhosale_Resume.pdf',
    parseStatus: 'completed',
    uploadedAt: new Date(),
    claimedSkills: [
      { canonicalId: 'skill_fe_react', name: 'React', category: 'frontend', confidence: 0.95, isImported: true },
      { canonicalId: 'skill_be_nodejs', name: 'Node.js', category: 'backend', confidence: 0.9, isImported: true },
      { canonicalId: 'skill_data_sql', name: 'SQL', category: 'database', confidence: 0.85, isImported: false },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Route Authentication & Validation', () => {
    it('POST /api/v1/ai/chat — should require authentication (401)', async () => {
      const res = await request(app).post('/api/v1/ai/chat').send({ message: 'Hello' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/ai/chat — should reject empty message (422)', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: '   ' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Message is required and cannot be empty');
    });

    it('POST /api/v1/ai/chat — should reject message exceeding 2000 characters (422)', async () => {
      const longMessage = 'A'.repeat(2001);
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: longMessage });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds maximum length');
    });
  });

  describe('2. Personalized Context & Conversation Responses', () => {
    beforeEach(() => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      } as any);
      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(Resume, 'findOne').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockResume),
        }),
      } as any);
    });

    it('POST /api/v1/ai/chat — should return personalized onboarding guidance with student name and actions', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: 'How do I get started?', currentPage: '/dashboard' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toContain('Shraddha Bhosale');
      expect(res.body.data.reply).toContain('Full Stack Developer');
      expect(res.body.data.suggestions).toBeDefined();
      expect(Array.isArray(res.body.data.suggestions)).toBe(true);
      expect(res.body.data.meta.studentName).toBe('Shraddha Bhosale');
    });

    it('POST /api/v1/ai/chat — should answer resume questions using real resume claims vs profile status', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: 'What is my resume status?', currentPage: '/resume' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toContain('Shraddha_Bhosale_Resume.pdf');
      expect(res.body.data.reply).toContain('3 total skills');
      expect(res.body.data.actions).toBeDefined();
    });

    it('POST /api/v1/ai/chat — should explain skill evidence lifecycle and unverified claims', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ message: 'Why is my skill unverified?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toContain('CareerPulse Skill Evidence');
      expect(res.body.data.reply).toContain('1 unverified skills');
      expect(res.body.data.reply).toContain('1 verified skills');
    });

    it('GET /api/v1/ai/context — should return sanitized student context and onboarding checklist', async () => {
      const res = await request(app)
        .get('/api/v1/ai/context')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentName).toBe('Shraddha Bhosale');
      expect(res.body.data.academic.degree).toBe('B.Tech');
      expect(res.body.data.onboarding.hasResume).toBe(true);
      expect(res.body.data.onboarding.hasTargetCareer).toBe(true);
      expect(res.body.data.onboarding.targetCareerTitle).toBe('Full Stack Developer');
      expect(res.body.data.skills.totalTracked).toBe(2);
      expect(res.body.data.skills.verifiedCount).toBe(1);
    });

    it('GET /api/v1/ai/suggestions — should return page-tailored suggestion chips', async () => {
      const res = await request(app)
        .get('/api/v1/ai/suggestions?page=/resume')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
      expect(res.body.data.studentName).toBe('Shraddha Bhosale');
    });
  });
});
