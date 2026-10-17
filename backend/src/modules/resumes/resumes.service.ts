import path from 'path';
import mongoose from 'mongoose';
import { Resume, IResume } from './resume.model';
import { StudentProfile, IUserSkill } from '../profiles/profile.model';
import { extractTextFromPdf, isPdfSignature } from './extractors/pdf.extractor';
import { extractTextFromDocx, isDocxSignature } from './extractors/docx.extractor';
import { detectSections } from './extractors/section.detector';
import { normalizeSkillsFromText } from './normalizer/skill.normalizer';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors';

export class ResumesService {
  /**
   * Parses an uploaded resume buffer and persists metadata and extracted claims.
   */
  async processAndSaveResume(
    userId: string,
    file: Express.Multer.File,
  ): Promise<IResume> {
    const isPdf = isPdfSignature(file.buffer);
    const isDocx = isDocxSignature(file.buffer);

    let rawText = '';
    try {
      if (isPdf) {
        rawText = await extractTextFromPdf(file.buffer);
      } else if (isDocx) {
        rawText = await extractTextFromDocx(file.buffer);
      } else {
        throw new ValidationError('Unsupported file signature. Only PDF and DOCX documents are accepted.');
      }
    } catch (err: unknown) {
      if (err instanceof ValidationError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw new ValidationError(`Document text extraction failed: ${msg}`);
    }

    if (!rawText.trim()) {
      throw new ValidationError('Could not extract readable text from document. Document is empty or unreadable.');
    }

    // Detect resume sections
    const extractedSections = detectSections(rawText);

    // Deterministically normalize claims against canonical taxonomy
    const claimedSkills = normalizeSkillsFromText(rawText, extractedSections);

    // Sanitize file name to prevent path traversal or special characters
    const sanitizedFileName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');

    const resume = await Resume.create({
      userId: new mongoose.Types.ObjectId(userId),
      fileName: sanitizedFileName,
      fileSize: file.buffer.length,
      mimeType: isPdf
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      parseStatus: 'completed',
      rawTextLength: rawText.length,
      extractedSections,
      claimedSkills,
    });

    return resume;
  }

  /**
   * Retrieves all resumes owned by the authenticated student.
   * Deduplicates claimedSkills by canonicalId to guarantee unique canonical claims.
   */
  async getResumesByUserId(userId: string): Promise<IResume[]> {
    const resumes = await Resume.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
    for (const r of resumes) {
      if (Array.isArray(r.claimedSkills) && r.claimedSkills.length > 0) {
        const uniqueClaimsMap = new Map<string, any>();
        for (const claim of r.claimedSkills) {
          if (claim.canonicalId && !uniqueClaimsMap.has(claim.canonicalId)) {
            uniqueClaimsMap.set(claim.canonicalId, claim);
          }
        }
        r.claimedSkills = Array.from(uniqueClaimsMap.values());
      }
    }
    return resumes;
  }

  /**
   * Retrieves a specific resume with strict owner authorization.
   * Deduplicates claimedSkills by canonicalId to guarantee unique canonical claims.
   */
  async getResumeById(userId: string, resumeId: string, role?: string): Promise<IResume> {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (resume.userId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('You do not have permission to view this resume');
    }

    if (Array.isArray(resume.claimedSkills) && resume.claimedSkills.length > 0) {
      const uniqueClaimsMap = new Map<string, any>();
      for (const claim of resume.claimedSkills) {
        if (claim.canonicalId && !uniqueClaimsMap.has(claim.canonicalId)) {
          uniqueClaimsMap.set(claim.canonicalId, claim);
        }
      }
      resume.claimedSkills = Array.from(uniqueClaimsMap.values());
    }

    // Synchronize isImported status with actual student profile evidence for integrity when DB connected
    if (mongoose.connection.readyState === 1) {
      try {
        const profile = await StudentProfile.findOne({ userId: resume.userId });
        if (profile) {
          let claimUpdated = false;
          for (const claim of resume.claimedSkills || []) {
            const hasEvidence = profile.skills.some(
              (s) =>
                s.canonicalId === claim.canonicalId &&
                s.evidence.some((e) => e.source === 'resume_extracted' && e.sourceId === resume._id.toString()),
            );
            if (claim.isImported !== hasEvidence) {
              claim.isImported = hasEvidence;
              claimUpdated = true;
            }
          }
          if (claimUpdated && typeof resume.save === 'function') {
            await resume.save();
          }
        }
      } catch {
        // Non-blocking sync
      }
    }

    return resume;
  }

  /**
   * Deletes a resume with strict owner authorization.
   */
  async deleteResume(userId: string, resumeId: string, role?: string): Promise<{ id: string; deleted: boolean }> {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (resume.userId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('You do not have permission to delete this resume');
    }

    await Resume.findByIdAndDelete(resumeId);
    return { id: resumeId, deleted: true };
  }

  /**
   * Selectively imports canonical skills from a resume into the student's profile.
   * Links evidence with source: 'resume_extracted' and verifiedStatus: 'unverified'.
   * Ensures idempotency: duplicate imports for the same resume do not duplicate evidence.
   */
  async applySkillsToProfile(
    userId: string,
    resumeId: string,
    selectedSkillIds: string[],
    role?: string,
  ): Promise<{ resumeId: string; importedCount: number; skills: IUserSkill[] }> {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    if (resume.userId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('You do not have permission to import skills from this resume');
    }

    if (!Array.isArray(selectedSkillIds) || selectedSkillIds.length === 0) {
      throw new ValidationError('skillIds must be a non-empty array of canonical skill identifiers');
    }

    // Deduplicate requested skill IDs to handle repeated IDs within a single request
    const uniqueSkillIds = [...new Set(selectedSkillIds)];

    // Validate that all requested canonical IDs exist in the resume's claimedSkills
    const availableClaimsMap = new Map(
      resume.claimedSkills.map((c) => [c.canonicalId, c]),
    );

    for (const skillId of uniqueSkillIds) {
      if (!availableClaimsMap.has(skillId)) {
        throw new ValidationError(`Skill '${skillId}' is not present in this resume's extracted claims.`);
      }
    }

    // Find student profile
    const profile = await StudentProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    // Selectively and idempotently import each chosen skill
    for (const skillId of uniqueSkillIds) {
      const claim = availableClaimsMap.get(skillId)!;

      const existingSkill = profile.skills.find((s) => s.canonicalId === skillId);

      if (existingSkill) {
        // Skill already exists: check if this resume is already recorded in evidence
        const hasEvidence = existingSkill.evidence.some(
          (e) => e.source === 'resume_extracted' && e.sourceId === resume._id.toString(),
        );

        if (!hasEvidence) {
          existingSkill.evidence.push({
            source: 'resume_extracted',
            sourceId: resume._id.toString(),
            score: 0,
            verifiedStatus: 'unverified',
            recordedAt: new Date(),
          });
        }
      } else {
        // Skill does not yet exist: initialize with 0 level and unverified evidence
        const newSkill: IUserSkill = {
          canonicalId: claim.canonicalId,
          name: claim.name,
          category: claim.category,
          level: 0,
          tier: 'beginner',
          lastAssessedAt: null,
          evidence: [
            {
              source: 'resume_extracted',
              sourceId: resume._id.toString(),
              score: 0,
              verifiedStatus: 'unverified',
              recordedAt: new Date(),
            },
          ],
        };
        profile.skills.push(newSkill);
      }

      // Mark claim as imported on the resume document
      claim.isImported = true;
    }

    // Attempt MongoDB replica-set transaction only when connected and supported
    let session: mongoose.ClientSession | null = null;
    if (mongoose.connection.readyState === 1) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch {
        session = null;
      }
    }

    try {
      if (session) {
        await profile.save({ session });
        await resume.save({ session });
        await session.commitTransaction();
      } else {
        await profile.save();
        await resume.save();
      }
    } catch (saveErr) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch {}
      }
      throw saveErr;
    } finally {
      if (session) {
        session.endSession();
      }
    }

    return {
      resumeId: resume._id.toString(),
      importedCount: uniqueSkillIds.length,
      skills: profile.skills,
    };
  }
}

export const resumesService = new ResumesService();
export default resumesService;
