import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { param, body } from 'express-validator';
import { sendError } from '../../utils/api-response';
import { isPdfSignature } from './extractors/pdf.extractor';
import { isDocxSignature } from './extractors/docx.extractor';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const memoryStorage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF and DOCX files are supported.'));
    }
  },
}).single('file');

/**
 * Wraps multer execution with uniform error formatting.
 */
export function handleUpload(req: Request, res: Response, next: NextFunction): void {
  uploadMiddleware(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        sendError(res, 'File size exceeds maximum allowed limit of 10MB', 422);
        return;
      }
      sendError(res, `Upload error: ${err.message}`, 400);
      return;
    } else if (err instanceof Error) {
      sendError(res, err.message, 422);
      return;
    }

    if (!req.file) {
      sendError(res, "No resume file provided. Field 'file' is required.", 400);
      return;
    }

    // Enforce non-empty buffer check
    if (!req.file.buffer || req.file.buffer.length === 0) {
      sendError(res, 'Uploaded file is empty (0 bytes)', 422);
      return;
    }

    // Validate binary magic bytes
    const isPdf = isPdfSignature(req.file.buffer);
    const isDocx = isDocxSignature(req.file.buffer);

    if (!isPdf && !isDocx) {
      sendError(
        res,
        'Invalid file signature. The file content does not match supported PDF or DOCX binary formats.',
        422,
      );
      return;
    }

    next();
  });
}

export const resumeIdParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid resume ID format'),
];

export const applySkillsValidation = [
  ...resumeIdParamValidation,
  body().custom((reqBody) => {
    const list = reqBody?.skillIds !== undefined ? reqBody.skillIds : reqBody?.canonicalSkillIds;
    if (!Array.isArray(list) || list.length === 0) {
      throw new Error('skillIds must be a non-empty array of canonical skill identifiers');
    }
    for (const item of list) {
      if (typeof item !== 'string' || item.trim() === '') {
        throw new Error('Each skillId must be a non-empty string');
      }
    }
    return true;
  }),
];
