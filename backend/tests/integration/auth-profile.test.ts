import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { User } from '../../src/modules/users/user.model';
import { StudentProfile } from '../../src/modules/profiles/profile.model';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_careerpulse_2026';

describe('Phase 1: Authentication & Student Profile Integration Tests', () => {
  const fakeUserId = '660c1f2e8f1b2c001a123456';
  const validToken = jwt.sign(
    { userId: fakeUserId, role: 'student' },
    JWT_SECRET,
    { expiresIn: '7d' },
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Authentication Module (/api/v1/auth)', () => {
    const validStudent = {
      email: 'student@university.edu',
      password: 'SecurePassword123!',
      name: 'Arjun Ghuge',
      role: 'student',
    };

    it('POST /api/v1/auth/register — should register a student and initialize profile (201)', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: fakeUserId,
        email: validStudent.email,
        name: validStudent.name,
        role: 'student',
        createdAt: new Date(),
      } as any);
      jest.spyOn(StudentProfile, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validStudent);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.data.user.email).toBe(validStudent.email);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('POST /api/v1/auth/register — should reject duplicate email with 409 Conflict', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ _id: fakeUserId } as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validStudent);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already registered');
    });

    it('POST /api/v1/auth/register — should reject weak password with 422 Validation Error', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Short Pass',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/v1/auth/login — should log in successfully with valid credentials (200)', async () => {
      const mockUser = {
        _id: fakeUserId,
        email: validStudent.email,
        name: validStudent.name,
        role: 'student',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validStudent.email,
          password: validStudent.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(validStudent.email);
    });

    it('POST /api/v1/auth/login — should reject invalid password with 401 Unauthorized', async () => {
      const mockUser = {
        _id: fakeUserId,
        email: validStudent.email,
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validStudent.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('POST /api/v1/auth/login — should reject non-existent email with 401 Unauthorized', async () => {
      jest.spyOn(User, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@university.edu',
          password: 'SomePassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('GET /api/v1/auth/me — should return current user when authenticated (200)', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue({
        id: fakeUserId,
        email: validStudent.email,
        name: validStudent.name,
        role: 'student',
      } as any);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(validStudent.email);
    });

    it('GET /api/v1/auth/me — should reject request without token with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('2. Student Profile Module (/api/v1/profiles)', () => {
    it('GET /api/v1/profiles/me — should return student profile (200)', async () => {
      const mockProfile = {
        userId: fakeUserId,
        degree: 'B.Tech',
        branch: 'Computer Science',
        year: 3,
        cgpa: 8.5,
        skills: [],
      };

      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfile as any);

      const res = await request(app)
        .get('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.degree).toBe('B.Tech');
      expect(res.body.data.year).toBe(3);
    });

    it('PUT /api/v1/profiles/me — should update profile details (200)', async () => {
      const updateData = {
        degree: 'B.Tech',
        branch: 'Computer Science',
        year: 4,
        cgpa: 9.1,
        bio: 'Updated bio',
        weeklyLearningHours: 14,
      };

      jest.spyOn(StudentProfile, 'findOneAndUpdate').mockResolvedValue({
        userId: fakeUserId,
        ...updateData,
      } as any);

      const res = await request(app)
        .put('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cgpa).toBe(9.1);
      expect(res.body.data.year).toBe(4);
    });

    it('PUT /api/v1/profiles/me — should reject invalid year with 422', async () => {
      const res = await request(app)
        .put('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ year: 10 }); // year must be 1..5

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('PATCH /api/v1/profiles/me/skills — should update self-reported skills with evidence & computed tier (200)', async () => {
      const mockProfileDoc = {
        userId: fakeUserId,
        skills: [] as any[],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfileDoc as any);

      const res = await request(app)
        .patch('/api/v1/profiles/me/skills')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          skills: [
            {
              canonicalId: 'skill_design_figma',
              name: 'Figma',
              category: 'design_ux',
              level: 82,
            },
            {
              canonicalId: 'skill_prog_python',
              name: 'Python',
              category: 'data_ai',
              level: 40,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);

      const figma = res.body.data.find(
        (s: { canonicalId: string }) => s.canonicalId === 'skill_design_figma',
      );
      expect(figma.tier).toBe('advanced'); // 82 > 75 -> advanced
      expect(figma.evidence).toHaveLength(1);
      expect(figma.evidence[0].source).toBe('self_report');
      expect(figma.evidence[0].score).toBe(82);

      const python = res.body.data.find(
        (s: { canonicalId: string }) => s.canonicalId === 'skill_prog_python',
      );
      expect(python.tier).toBe('developing'); // 40 -> developing
      expect(python.evidence[0].source).toBe('self_report');
    });

    it('PATCH /api/v1/profiles/me/skills — should reject invalid level with 422', async () => {
      const res = await request(app)
        .patch('/api/v1/profiles/me/skills')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          skills: [{ canonicalId: 'skill_test', level: 150 }], // level must be 0..100
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
