import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { Resume } from '../../src/modules/resumes/resume.model';
import { StudentProfile } from '../../src/modules/profiles/profile.model';
import * as pdfExtractor from '../../src/modules/resumes/extractors/pdf.extractor';
import * as docxExtractor from '../../src/modules/resumes/extractors/docx.extractor';
import { normalizeSkillsFromText } from '../../src/modules/resumes/normalizer/skill.normalizer';
import { detectSections } from '../../src/modules/resumes/extractors/section.detector';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_careerpulse_2026';

describe('Phase 2A: Resume Ingestion & Deterministic Parsing Tests', () => {
  const userAId = '660c1f2e8f1b2c001a111111';
  const userBId = '660c1f2e8f1b2c001a222222';

  const tokenUserA = jwt.sign({ userId: userAId, role: 'student' }, JWT_SECRET, { expiresIn: '1d' });
  const tokenUserB = jwt.sign({ userId: userBId, role: 'student' }, JWT_SECRET, { expiresIn: '1d' });

  // Minimal valid PDF header buffer (%PDF)
  const validPdfBuffer = Buffer.from('%PDF-1.4\nTest PDF content with React.js and Figma\n%%EOF');
  // Minimal valid DOCX header buffer (PK\x03\x04)
  const validDocxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Deterministic Normalizer & Section Detector Unit Tests', () => {
    it('should correctly segment resume sections', () => {
      const sampleText = `
        Arjun Ghuge
        Email: arjun@university.edu

        Education
        B.Tech Computer Science Engineering 2023-2027

        Experience
        Frontend Developer Intern at TechCorp. Worked on React.js applications.

        Projects
        CareerPulse: Built AI platform using Figma and Node.js.

        Skills
        HTML/CSS, JavaScript, TypeScript, React, Figma, Python, Communication
      `;

      const sections = detectSections(sampleText);
      expect(sections.education.length).toBeGreaterThan(0);
      expect(sections.experience.length).toBeGreaterThan(0);
      expect(sections.projects.length).toBeGreaterThan(0);
      expect(sections.skills.length).toBeGreaterThan(0);
      expect(sections.skills.join(' ')).toContain('HTML/CSS');
    });

    it('should match canonical aliases including React.js, Figma, and de-duplicate multiple mentions', () => {
      const resumeText = `
        Technical Skills: React.js, React, Figma, TypeScript, UnknownSkill123.
        Projects: Developed interactive prototypes in Figma and built web apps using React.js and Node.js.
        Experience: 2 years building React frontends.
      `;

      const sections = detectSections(resumeText);
      const claims = normalizeSkillsFromText(resumeText, sections);

      const canonicalIds = claims.map((c) => c.canonicalId);
      expect(canonicalIds).toContain('skill_fe_react');
      expect(canonicalIds).toContain('skill_design_figma');
      expect(canonicalIds).toContain('skill_fe_typescript');
      expect(canonicalIds).toContain('skill_be_nodejs');

      // Verify de-duplication: React and React.js should result in a single claim for skill_fe_react
      const reactClaims = claims.filter((c) => c.canonicalId === 'skill_fe_react');
      expect(reactClaims.length).toBe(1);
      expect(reactClaims[0].name).toBe('React');
      expect(reactClaims[0].contextSnippet).toBeDefined();
      expect(reactClaims[0].isImported).toBe(false);

      // Verify unknown skills are omitted
      const unknownClaims = claims.filter((c) => c.name.includes('UnknownSkill'));
      expect(unknownClaims.length).toBe(0);
    });

    it('should extract context snippets bounded strictly within section lines without crossing headings or section boundaries', () => {
      const resumeSample = `
        EDUCATION
        B.Tech in Computer Science
        College of Engineering, 2020-2024

        TECHNICAL SKILLS
        Languages: Python, JavaScript, SQL
        Frontend: React, Tailwind CSS

        ACADEMIC PROJECTS
        Online Store: Built with Node.js and MongoDB
      `;

      const sections = detectSections(resumeSample);
      const claims = normalizeSkillsFromText(resumeSample, sections);

      const pythonClaim = claims.find((c) => c.canonicalId === 'skill_ai_python');
      expect(pythonClaim).toBeDefined();
      expect(pythonClaim?.contextSnippet).toContain('Python');
      expect(pythonClaim?.contextSnippet).not.toContain('EDUCATION');
      expect(pythonClaim?.contextSnippet).not.toContain('B.Tech');
      expect(pythonClaim?.contextSnippet).not.toContain('PROJECTS');
      expect(pythonClaim?.contextSnippet).not.toContain('\n');

      const reactClaim = claims.find((c) => c.canonicalId === 'skill_fe_react');
      expect(reactClaim).toBeDefined();
      expect(reactClaim?.contextSnippet).toContain('React');
      expect(reactClaim?.contextSnippet).not.toContain('EDUCATION');
      expect(reactClaim?.contextSnippet).not.toContain('PROJECTS');
      expect(reactClaim?.contextSnippet).not.toContain('\n');
    });

    it('should handle headings with markdown, bullets, numbers, and mixed case', () => {
      const markdownResume = `
        # Bhagyashri Bhosale
        bhagyashri@example.com

        ## 1. EDUCATION & ACADEMIC BACKGROUND
        Bachelor of Engineering in Information Technology | CGPA: 9.15
        Finolex Academy of Management and Technology, 2021-2025

        • PROFESSIONAL EXPERIENCE & INTERNSHIPS
        Web Development Intern at Oasis Infobyte (June 2024 - July 2024)
        Designed responsive user interfaces using HTML5, CSS3, and JavaScript.

        ### KEY PROJECTS
        E-Commerce Web Portal: Developed full-stack marketplace using React and Node.js.

        * CERTIFICATIONS & LICENSES
        AWS Certified Cloud Practitioner (2024)
      `;

      const sections = detectSections(markdownResume);
      expect(sections.education.length).toBe(2);
      expect(sections.education[0]).toContain('Bachelor of Engineering');
      expect(sections.experience.length).toBe(2);
      expect(sections.experience[0]).toContain('Oasis Infobyte');
      expect(sections.projects.length).toBe(1);
      expect(sections.projects[0]).toContain('E-Commerce Web Portal');
      expect(sections.certifications.length).toBe(1);
      expect(sections.certifications[0]).toContain('AWS Certified');
    });

    it('should prevent downstream boundary sections like summary and additional info from leaking into education', () => {
      const textWithBoundaries = `
        EDUCATION
        B.Tech Computer Science, 2020-2024
        XYZ Institute of Technology, GPA: 8.8

        ADDITIONAL INFORMATION
        Languages: English, Hindi, Marathi
        Interests: Competitive Programming, Chess
        Volunteer: Code For Good Hackathon mentor

        SUMMARY
        Passionate software engineer focused on building resilient systems.
      `;

      const sections = detectSections(textWithBoundaries);
      expect(sections.education.length).toBe(2);
      expect(sections.education[0]).toContain('B.Tech Computer Science');
      expect(sections.education[1]).toContain('XYZ Institute');
      // Verify boundary items did not get swallowed into education
      const educationText = sections.education.join(' ');
      expect(educationText).not.toContain('Competitive Programming');
      expect(educationText).not.toContain('Code For Good');
      expect(educationText).not.toContain('Passionate software engineer');
    });

    it('should handle multi-column consecutive header stream with semantic line classification', () => {
      // In multi-column ATS resumes, all section headers can appear on consecutive lines
      const multiColumnStream = `
        SKILLS
        SUMMARY
        PROJECTS
        EDUCATION
        EXPERIENCE

        Technical Skills: React, TypeScript, Python
        CareerPulse Platform: Built career guidance dashboard in React
        Bachelor of Engineering in IT, GPA 9.0
        Software Developer Intern at GlobalTech, worked with REST APIs
      `;

      const sections = detectSections(multiColumnStream);
      expect(sections.education.length).toBeGreaterThanOrEqual(1);
      expect(sections.education.join(' ')).toContain('Bachelor of Engineering');
      expect(sections.experience.length).toBeGreaterThanOrEqual(1);
      expect(sections.experience.join(' ')).toContain('GlobalTech');
      expect(sections.projects.length).toBeGreaterThanOrEqual(1);
      expect(sections.projects.join(' ')).toContain('CareerPulse Platform');
    });

    it('should return empty arrays gracefully for empty text or missing sections without fabricating data', () => {
      const emptySections = detectSections('');
      expect(emptySections.education).toEqual([]);
      expect(emptySections.experience).toEqual([]);
      expect(emptySections.projects).toEqual([]);
      expect(emptySections.skills).toEqual([]);
      expect(emptySections.certifications).toEqual([]);

      const whitespaceSections = detectSections('   \n\t   \n  ');
      expect(whitespaceSections.education).toEqual([]);

      // Resume with only Education
      const onlyEdu = `
        EDUCATION
        Master of Science in Data Science, Stanford University
      `;
      const partialSections = detectSections(onlyEdu);
      expect(partialSections.education.length).toBe(1);
      expect(partialSections.experience).toEqual([]);
      expect(partialSections.projects).toEqual([]);
      expect(partialSections.skills).toEqual([]);
      expect(partialSections.certifications).toEqual([]);
    });

    it('should not classify generic personal statements as experience or education', () => {
      const genericText = `
        John Doe
        Email: john.doe@example.com | Phone: +1-555-0100 | City: Seattle, WA
        Looking for new opportunities in software. Dedicated, hardworking, and team-oriented.
      `;

      const sections = detectSections(genericText);
      expect(sections.education).toEqual([]);
      expect(sections.experience).toEqual([]);
      expect(sections.projects).toEqual([]);
      expect(sections.certifications).toEqual([]);
    });
  });

  describe('2. POST /api/v1/resumes/upload Endpoint Tests', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .attach('file', validPdfBuffer, 'resume.pdf');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request when no file is attached with 400', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("No resume file provided. Field 'file' is required.");
    });

    it('should reject unsupported file types (.png) with 422', async () => {
      const fakeImage = Buffer.from('fake image content');
      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .attach('file', fakeImage, 'avatar.png');

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only PDF and DOCX files are supported');
    });

    it('should reject empty files (0 bytes) with 422', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .attach('file', emptyBuffer, 'empty.pdf');

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('empty');
    });

    it('should reject file with pdf extension but invalid signature with 422', async () => {
      const fakePdf = Buffer.from('NOT_A_REAL_PDF_HEADER_JUST_TEXT');
      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .attach('file', fakePdf, 'fake.pdf');

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('file signature');
    });

    it('should successfully upload and parse a valid PDF resume (201)', async () => {
      const parsedSampleText = `
        Education
        B.Tech Computer Science

        Skills
        React.js, Figma, Python, Node.js

        Projects
        Designed UI in Figma and implemented React.js frontend.
      `;

      jest.spyOn(pdfExtractor, 'extractTextFromPdf').mockResolvedValue(parsedSampleText);

      const fakeResumeDoc = {
        _id: '670c1f2e8f1b2c001a999001',
        userId: userAId,
        fileName: 'my_resume.pdf',
        fileSize: validPdfBuffer.length,
        mimeType: 'application/pdf',
        parseStatus: 'completed',
        rawTextLength: parsedSampleText.length,
        extractedSections: detectSections(parsedSampleText),
        claimedSkills: normalizeSkillsFromText(parsedSampleText),
        uploadedAt: new Date(),
        toJSON: function () {
          return {
            id: '670c1f2e8f1b2c001a999001',
            userId: userAId,
            fileName: 'my_resume.pdf',
            fileSize: validPdfBuffer.length,
            mimeType: 'application/pdf',
            parseStatus: 'completed',
            rawTextLength: parsedSampleText.length,
            extractedSections: this.extractedSections,
            claimedSkills: this.claimedSkills,
            uploadedAt: this.uploadedAt,
          };
        },
      };

      jest.spyOn(Resume, 'create').mockResolvedValue(fakeResumeDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .attach('file', validPdfBuffer, 'my_resume.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Resume uploaded and parsed successfully');
      expect(res.body.data.fileName).toBe('my_resume.pdf');
      expect(res.body.data.claimedSkills.length).toBeGreaterThan(0);

      const skillIds = res.body.data.claimedSkills.map((s: any) => s.canonicalId);
      expect(skillIds).toContain('skill_fe_react');
      expect(skillIds).toContain('skill_design_figma');
    });

    it('should successfully upload and parse a valid DOCX resume (201)', async () => {
      const parsedSampleText = `
        Experience
        Full Stack Engineer using TypeScript, Express, and MongoDB.
        Skills
        TypeScript, Express, MongoDB
      `;

      jest.spyOn(docxExtractor, 'extractTextFromDocx').mockResolvedValue(parsedSampleText);

      const fakeResumeDoc = {
        _id: '670c1f2e8f1b2c001a999002',
        userId: userAId,
        fileName: 'resume.docx',
        fileSize: validDocxBuffer.length,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        parseStatus: 'completed',
        rawTextLength: parsedSampleText.length,
        extractedSections: detectSections(parsedSampleText),
        claimedSkills: normalizeSkillsFromText(parsedSampleText),
        uploadedAt: new Date(),
        toJSON: function () {
          return {
            id: '670c1f2e8f1b2c001a999002',
            userId: userAId,
            fileName: 'resume.docx',
            fileSize: validDocxBuffer.length,
            mimeType: this.mimeType,
            parseStatus: 'completed',
            extractedSections: this.extractedSections,
            claimedSkills: this.claimedSkills,
          };
        },
      };

      jest.spyOn(Resume, 'create').mockResolvedValue(fakeResumeDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .attach('file', validDocxBuffer, 'resume.docx');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileName).toBe('resume.docx');
    });

    it('should return 422 if text extraction fails', async () => {
      jest.spyOn(pdfExtractor, 'extractTextFromPdf').mockRejectedValue(new Error('Corrupt PDF catalog'));

      const res = await request(app)
        .post('/api/v1/resumes/upload')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .attach('file', validPdfBuffer, 'corrupt.pdf');

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('extraction failed');
    });
  });

  describe('3. GET /api/v1/resumes & GET /api/v1/resumes/:id Tests', () => {
    it('GET /api/v1/resumes — should list resumes for authenticated student only', async () => {
      const mockList = [
        { id: '670c1f2e8f1b2c001a999001', userId: userAId, fileName: 'resume1.pdf' },
      ];
      jest.spyOn(Resume, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockList),
      } as any);

      const res = await request(app)
        .get('/api/v1/resumes')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('GET /api/v1/resumes/:id — should return 400 for invalid mongo ID', async () => {
      const res = await request(app)
        .get('/api/v1/resumes/not-an-id')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/resumes/:id — should return 404 if resume does not exist', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/resumes/670c1f2e8f1b2c001a999999')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/resumes/:id — should reject User B accessing User A resume with 403 Forbidden', async () => {
      const resumeOfUserA = {
        _id: '670c1f2e8f1b2c001a999001',
        userId: userAId, // belongs to user A
        fileName: 'resumeA.pdf',
      };
      jest.spyOn(Resume, 'findById').mockResolvedValue(resumeOfUserA as any);

      const res = await request(app)
        .get('/api/v1/resumes/670c1f2e8f1b2c001a999001')
        .set('Authorization', `Bearer ${tokenUserB}`); // User B requesting

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });

    it('GET /api/v1/resumes/:id — should allow User A to access their own resume (200)', async () => {
      const resumeOfUserA = {
        _id: '670c1f2e8f1b2c001a999001',
        userId: userAId,
        fileName: 'resumeA.pdf',
        toJSON: () => ({ id: '670c1f2e8f1b2c001a999001', fileName: 'resumeA.pdf' }),
      };
      jest.spyOn(Resume, 'findById').mockResolvedValue(resumeOfUserA as any);

      const res = await request(app)
        .get('/api/v1/resumes/670c1f2e8f1b2c001a999001')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileName).toBe('resumeA.pdf');
    });
  });

  describe('4. DELETE /api/v1/resumes/:id Tests', () => {
    it('DELETE /api/v1/resumes/:id — should reject User B deleting User A resume with 403 Forbidden', async () => {
      const resumeOfUserA = {
        _id: '670c1f2e8f1b2c001a999001',
        userId: userAId,
      };
      jest.spyOn(Resume, 'findById').mockResolvedValue(resumeOfUserA as any);

      const res = await request(app)
        .delete('/api/v1/resumes/670c1f2e8f1b2c001a999001')
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('DELETE /api/v1/resumes/:id — should allow User A to delete their own resume (200)', async () => {
      const resumeOfUserA = {
        _id: '670c1f2e8f1b2c001a999001',
        userId: userAId,
      };
      jest.spyOn(Resume, 'findById').mockResolvedValue(resumeOfUserA as any);
      jest.spyOn(Resume, 'findByIdAndDelete').mockResolvedValue(resumeOfUserA as any);

      const res = await request(app)
        .delete('/api/v1/resumes/670c1f2e8f1b2c001a999001')
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });
  });

  describe('5. POST /api/v1/resumes/:id/apply-skills Tests', () => {
    const mockResumeDoc = {
      _id: '670c1f2e8f1b2c001a999001',
      userId: userAId,
      fileName: 'resumeA.pdf',
      claimedSkills: [
        {
          canonicalId: 'skill_fe_react',
          name: 'React',
          category: 'frontend',
          matchedAlias: 'React.js',
          confidence: 0.95,
          contextSnippet: '...built React apps...',
          isImported: false,
        },
        {
          canonicalId: 'skill_design_figma',
          name: 'Figma',
          category: 'design_ux',
          matchedAlias: 'Figma',
          confidence: 0.95,
          contextSnippet: '...designed in Figma...',
          isImported: false,
        },
      ],
      save: jest.fn().mockResolvedValue(true),
    };

    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .send({ skillIds: ['skill_fe_react'] });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid resume mongo ID with 422', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/invalid-id/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react'] });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should reject empty or invalid skillIds payload with 422', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: [] });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if resume does not exist', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999999/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react'] });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should reject cross-user access with 403 Forbidden', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResumeDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserB}`) // User B attempting User A's resume
        .send({ skillIds: ['skill_fe_react'] });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('permission');
    });

    it('should reject skill IDs that are not present in resume claimedSkills with 422', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResumeDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_ai_python'] }); // Not in claimedSkills

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not present in this resume');
    });

    it('should return 404 if student profile does not exist', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResumeDoc as any);
      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react'] });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Student profile not found');
    });

    it('should successfully selectively import chosen skills into profile (200)', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResumeDoc as any);

      const mockProfileDoc = {
        userId: userAId,
        skills: [] as any[],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfileDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.importedCount).toBe(1);
      expect(res.body.data.skills.length).toBe(1);

      const importedSkill = res.body.data.skills[0];
      expect(importedSkill.canonicalId).toBe('skill_fe_react');
      expect(importedSkill.level).toBe(0);
      expect(importedSkill.tier).toBe('beginner');
      expect(importedSkill.evidence.length).toBe(1);
      expect(importedSkill.evidence[0].source).toBe('resume_extracted');
      expect(importedSkill.evidence[0].sourceId).toBe('670c1f2e8f1b2c001a999001');
      expect(importedSkill.evidence[0].verifiedStatus).toBe('unverified');
      expect(importedSkill.evidence[0].score).toBe(0);
      expect(mockProfileDoc.save).toHaveBeenCalled();
    });

    it('should be idempotent and not duplicate evidence on repeated requests', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResumeDoc as any);

      // Profile already has this skill with evidence from this resume
      const mockProfileDoc = {
        userId: userAId,
        skills: [
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            category: 'frontend',
            level: 0,
            tier: 'beginner',
            evidence: [
              {
                source: 'resume_extracted',
                sourceId: '670c1f2e8f1b2c001a999001',
                score: 0,
                verifiedStatus: 'unverified',
                recordedAt: new Date(),
              },
            ],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfileDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const skill = res.body.data.skills.find((s: any) => s.canonicalId === 'skill_fe_react');
      // Evidence array should still have exactly 1 record, not 2
      expect(skill.evidence.length).toBe(1);
      expect(skill.level).toBe(0);
    });

    it('should handle repeated IDs within a single request payload idempotently and return accurate importedCount', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResumeDoc as any);

      const mockProfileDoc = {
        userId: userAId,
        skills: [] as any[],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfileDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react', 'skill_fe_react', 'skill_fe_react'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.importedCount).toBe(1);
      expect(res.body.data.skills.length).toBe(1);
      expect(res.body.data.skills[0].canonicalId).toBe('skill_fe_react');
      expect(res.body.data.skills[0].evidence.length).toBe(1);
    });

    it('should correctly handle a mixture of already-imported claims and newly selected claims', async () => {
      const mixedResumeDoc = {
        _id: '670c1f2e8f1b2c001a999001',
        userId: userAId,
        fileName: 'resumeA.pdf',
        claimedSkills: [
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            category: 'frontend',
            matchedAlias: 'React.js',
            confidence: 0.95,
            contextSnippet: '...built React apps...',
            isImported: true,
          },
          {
            canonicalId: 'skill_design_figma',
            name: 'Figma',
            category: 'design_ux',
            matchedAlias: 'Figma',
            confidence: 0.95,
            contextSnippet: '...designed in Figma...',
            isImported: false,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Resume, 'findById').mockResolvedValue(mixedResumeDoc as any);

      const mockProfileDoc = {
        userId: userAId,
        skills: [
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            category: 'frontend',
            level: 0,
            tier: 'beginner',
            evidence: [
              {
                source: 'resume_extracted',
                sourceId: '670c1f2e8f1b2c001a999001',
                score: 0,
                verifiedStatus: 'unverified',
                recordedAt: new Date(),
              },
            ],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfileDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react', 'skill_design_figma'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.importedCount).toBe(2);
      expect(res.body.data.skills.length).toBe(2);

      const reactSkill = res.body.data.skills.find((s: any) => s.canonicalId === 'skill_fe_react');
      expect(reactSkill.evidence.length).toBe(1);

      const figmaSkill = res.body.data.skills.find((s: any) => s.canonicalId === 'skill_design_figma');
      expect(figmaSkill).toBeDefined();
      expect(figmaSkill.evidence.length).toBe(1);
      expect(figmaSkill.level).toBe(0);
      expect(figmaSkill.evidence[0].verifiedStatus).toBe('unverified');

      expect(mixedResumeDoc.claimedSkills[0].isImported).toBe(true);
      expect(mixedResumeDoc.claimedSkills[1].isImported).toBe(true);
    });

    it('should preserve existing skill proficiency level and tier when importing resume evidence', async () => {
      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResumeDoc as any);

      const mockProfileDoc = {
        userId: userAId,
        skills: [
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            category: 'frontend',
            level: 60,
            tier: 'proficient',
            lastAssessedAt: new Date('2026-09-01'),
            evidence: [
              {
                source: 'quiz_assessment',
                sourceId: 'attempt_998877',
                score: 85,
                verifiedStatus: 'verified',
                recordedAt: new Date('2026-09-01'),
              },
            ],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfileDoc as any);

      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reactSkill = res.body.data.skills.find((s: any) => s.canonicalId === 'skill_fe_react');
      expect(reactSkill.level).toBe(60);
      expect(reactSkill.tier).toBe('proficient');
      expect(reactSkill.evidence.length).toBe(2);

      expect(reactSkill.evidence[0].source).toBe('quiz_assessment');
      expect(reactSkill.evidence[0].verifiedStatus).toBe('verified');

      expect(reactSkill.evidence[1].source).toBe('resume_extracted');
      expect(reactSkill.evidence[1].verifiedStatus).toBe('unverified');
      expect(reactSkill.evidence[1].score).toBe(0);
    });

    it('should reject empty body {} with 422', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should reject skillIds containing empty strings or whitespace with 422', async () => {
      const res = await request(app)
        .post('/api/v1/resumes/670c1f2e8f1b2c001a999001/apply-skills')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['   '] });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(JSON.stringify(res.body.errors)).toContain('Each skillId must be a non-empty string');
    });
  });

  describe('6. Phase 2B Part 3: Section Detection & Structured Extraction Regression Tests', () => {
    it('should correctly extract multiple work experience entries with internship and full-time roles', () => {
      const multiExpResume = `
        PROFESSIONAL EXPERIENCE & INTERNSHIPS
        Frontend Developer Intern at Oasis Infobyte (June 2024 - July 2024)
        Designed responsive user interfaces using HTML5, CSS3, and JavaScript.

        Software Engineer at TechCorp Inc. (August 2024 - Present)
        Developed scalable microservices using Node.js and TypeScript.
      `;

      const sections = detectSections(multiExpResume);
      expect(sections.experience.length).toBeGreaterThanOrEqual(2);
      expect(sections.structuredExperience).toBeDefined();
      expect(sections.structuredExperience!.length).toBe(2);

      const exp1 = sections.structuredExperience![0];
      expect(exp1.role).toContain('Frontend Developer Intern');
      expect(exp1.organization).toContain('Oasis Infobyte');
      expect(exp1.employmentType).toBe('internship');
      expect(exp1.startDate).toBe('June 2024');
      expect(exp1.endDate).toBe('July 2024');
      expect(exp1.isCurrent).toBe(false);
      expect(exp1.confidence).toBeGreaterThan(0.8);

      const exp2 = sections.structuredExperience![1];
      expect(exp2.role).toContain('Software Engineer');
      expect(exp2.organization).toContain('TechCorp Inc.');
      expect(exp2.employmentType).toBe('full-time');
      expect(exp2.isCurrent).toBe(true);
    });

    it('should NOT classify academic or personal projects as work experience even if they mention development and dates', () => {
      const projectOnlyResume = `
        ACADEMIC PROJECTS
        Smart Attendance System (January 2024 - March 2024)
        Developed full-stack web application using React, Node.js, and MongoDB.
        Technologies: React, Node.js, Express, MongoDB.

        Autonomous Rover Project (August 2023 - November 2023)
        Built robotic obstacle avoidance system using Python and OpenCV.
      `;

      const sections = detectSections(projectOnlyResume);
      // Experience section must remain completely empty!
      expect(sections.experience).toEqual([]);
      expect(sections.structuredExperience).toEqual([]);
      // Projects section must capture the project descriptions
      expect(sections.projects.length).toBeGreaterThanOrEqual(2);
      expect(sections.projects.join(' ')).toContain('Smart Attendance System');
      expect(sections.projects.join(' ')).toContain('Autonomous Rover Project');
    });

    it('should explicitly exclude test disclaimers, declarations, and contact info from experience and education', () => {
      const resumeWithDisclaimer = `
        Arjun Patil
        Email: arjun.patil@example.com | Phone: +91 9876543210
        LinkedIn: linkedin.com/in/arjunpatil | GitHub: github.com/arjunpatil

        EDUCATION
        B.Tech Computer Science, Finolex Academy of Management and Technology (2021 - 2025), CGPA: 8.9

        EXPERIENCE
        Web Developer Intern at StartUp Labs (May 2024 - July 2024)
        Built landing pages using React.

        DECLARATION
        I hereby declare that all the information stated above is true to the best of my knowledge and belief.

        TEST DISCLAIMER
        This resume was generated for testing purposes only and does not represent real personal data.
      `;

      const sections = detectSections(resumeWithDisclaimer);
      expect(sections.education.length).toBeGreaterThan(0);
      expect(sections.experience.length).toBeGreaterThan(0);

      // Verify disclaimers and declarations did NOT leak into experience or education
      const expText = sections.experience.join(' ');
      const eduText = sections.education.join(' ');
      expect(expText).not.toContain('DECLARATION');
      expect(expText).not.toContain('TEST DISCLAIMER');
      expect(expText).not.toContain('I hereby declare');
      expect(expText).not.toContain('testing purposes only');
      expect(expText).not.toContain('arjun.patil@example.com');

      expect(eduText).not.toContain('DECLARATION');
      expect(eduText).not.toContain('TEST DISCLAIMER');
      expect(eduText).not.toContain('testing purposes only');

      // Structured entries must also be free of disclaimers
      for (const exp of sections.structuredExperience || []) {
        expect(exp.role).not.toMatch(/disclaimer|declaration/i);
        expect(exp.organization).not.toMatch(/disclaimer|declaration/i);
      }
    });

    it('should correctly extract multiple education entries with degrees, institutions, CGPA, and years', () => {
      const multiEduResume = `
        EDUCATION & ACADEMIC BACKGROUND
        Bachelor of Engineering in Information Technology | CGPA: 9.15
        Finolex Academy of Management and Technology, 2021 - 2025

        Class 12th - HSC | Maharashtra State Board | Percentage: 88.5%
        Model Junior College, 2019 - 2021
      `;

      const sections = detectSections(multiEduResume);
      expect(sections.education.length).toBeGreaterThanOrEqual(2);
      expect(sections.structuredEducation).toBeDefined();
      expect(sections.structuredEducation!.length).toBeGreaterThanOrEqual(2);

      const edu1 = sections.structuredEducation![0];
      expect(edu1.degree).toBe('Bachelor of Engineering');
      expect(edu1.fieldOfStudy).toBe('Information Technology');
      expect(edu1.institution).toContain('Finolex Academy');
      expect(edu1.grade).toContain('9.15');
      expect(edu1.startYear).toBe('2021');
      expect(edu1.endYear).toBe('2025');

      const edu2 = sections.structuredEducation![1];
      expect(edu2.degree).toContain('Class 12th');
      expect(edu2.grade).toContain('88.5%');
      expect(edu2.startYear).toBe('2019');
      expect(edu2.endYear).toBe('2021');
    });

    it('should handle unusual headings and whitespace gracefully', () => {
      const unusualHeadingsResume = `
        == INDUSTRIAL TRAINING & INTERNSHIP EXPERIENCE ==
        Intern at CloudNine Technologies Pvt Ltd (Jan 2024 - Present)
        Assisted in cloud deployment pipelines.

        ** ACADEMIC QUALIFICATIONS & DEGREES **
        Diploma in Computer Engineering | 2018 - 2021 | GPA: 8.5
        Government Polytechnic
      `;

      const sections = detectSections(unusualHeadingsResume);
      expect(sections.experience.length).toBeGreaterThanOrEqual(1);
      expect(sections.structuredExperience!.length).toBe(1);
      expect(sections.structuredExperience![0].organization).toContain('CloudNine Technologies');
      expect(sections.structuredExperience![0].employmentType).toBe('internship');

      expect(sections.education.length).toBeGreaterThanOrEqual(1);
      expect(sections.structuredEducation!.length).toBe(1);
      expect(sections.structuredEducation![0].degree).toBe('Diploma');
    });

    it('should handle resumes with no experience or no education without errors or fabricating data', () => {
      const noExpResume = `
        EDUCATION
        B.Tech Computer Science, XYZ University, 2022 - 2026

        TECHNICAL SKILLS
        Python, JavaScript, React, SQL
      `;

      const sections = detectSections(noExpResume);
      expect(sections.experience).toEqual([]);
      expect(sections.structuredExperience).toEqual([]);
      expect(sections.education.length).toBe(1);
      expect(sections.structuredEducation!.length).toBe(1);
    });
  });

  describe('7. Phase 2B Part 3: Multiple Resume Uploads & Provenance Integrity Tests', () => {
    it('should preserve existing profile skills and record multiple resume evidence sources independently', async () => {
      const resume1Id = '670c1f2e8f1b2c001a999001';
      const resume2Id = '670c1f2e8f1b2c001a999002';

      const mockResume2Doc = {
        _id: resume2Id,
        userId: userAId,
        fileName: 'resume2_updated.pdf',
        claimedSkills: [
          {
            canonicalId: 'skill_fe_react', // Same canonical skill in 2nd resume
            name: 'React',
            category: 'frontend',
            matchedAlias: 'React',
            confidence: 0.95,
            contextSnippet: '...advanced React development...',
            isImported: false,
          },
          {
            canonicalId: 'skill_be_nodejs', // New skill in 2nd resume
            name: 'Node.js',
            category: 'backend',
            matchedAlias: 'Node.js',
            confidence: 0.90,
            contextSnippet: '...backend API in Node.js...',
            isImported: false,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Resume, 'findById').mockResolvedValue(mockResume2Doc as any);

      // Existing profile already has React with assessed score 85 from a quiz, and unverified evidence from Resume 1
      const mockProfileDoc = {
        userId: userAId,
        skills: [
          {
            canonicalId: 'skill_fe_react',
            name: 'React',
            category: 'frontend',
            level: 70,
            tier: 'proficient',
            lastAssessedAt: new Date('2026-09-15'),
            evidence: [
              {
                source: 'quiz_assessment',
                sourceId: 'quiz_attempt_111',
                score: 85,
                verifiedStatus: 'verified',
                recordedAt: new Date('2026-09-15'),
              },
              {
                source: 'resume_extracted',
                sourceId: resume1Id,
                score: 0,
                verifiedStatus: 'unverified',
                recordedAt: new Date('2026-10-01'),
              },
            ],
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(StudentProfile, 'findOne').mockResolvedValue(mockProfileDoc as any);

      const res = await request(app)
        .post(`/api/v1/resumes/${resume2Id}/apply-skills`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ skillIds: ['skill_fe_react', 'skill_be_nodejs'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.importedCount).toBe(2);

      // Verify that React skill was NOT duplicated in profile.skills
      const reactSkills = res.body.data.skills.filter((s: any) => s.canonicalId === 'skill_fe_react');
      expect(reactSkills.length).toBe(1);

      // Verify that React skill preserved its assessed proficiency level and tier
      const reactSkill = reactSkills[0];
      expect(reactSkill.level).toBe(70);
      expect(reactSkill.tier).toBe('proficient');

      // Verify React skill has 3 evidence records now: Quiz, Resume 1, and Resume 2
      expect(reactSkill.evidence.length).toBe(3);
      expect(reactSkill.evidence.some((e: any) => e.sourceId === 'quiz_attempt_111' && e.verifiedStatus === 'verified')).toBe(true);
      expect(reactSkill.evidence.some((e: any) => e.sourceId === resume1Id && e.verifiedStatus === 'unverified')).toBe(true);
      expect(reactSkill.evidence.some((e: any) => e.sourceId === resume2Id && e.verifiedStatus === 'unverified')).toBe(true);

      // Verify newly imported Node.js skill was added with level: 0, unverified evidence
      const nodeSkill = res.body.data.skills.find((s: any) => s.canonicalId === 'skill_be_nodejs');
      expect(nodeSkill).toBeDefined();
      expect(nodeSkill.level).toBe(0);
      expect(nodeSkill.tier).toBe('beginner');
      expect(nodeSkill.evidence.length).toBe(1);
      expect(nodeSkill.evidence[0].source).toBe('resume_extracted');
      expect(nodeSkill.evidence[0].sourceId).toBe(resume2Id);
      expect(nodeSkill.evidence[0].verifiedStatus).toBe('unverified');
    });
  });
});

