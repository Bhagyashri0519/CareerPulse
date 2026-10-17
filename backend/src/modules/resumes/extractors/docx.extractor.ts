import mammoth from 'mammoth';
import { ValidationError } from '../../../utils/errors';

/**
 * Validates that the buffer starts with the standard ZIP magic header (PK\x03\x04),
 * which is the container format for DOCX (Office Open XML) documents.
 */
export function isDocxSignature(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x50 && // P
    buffer[1] === 0x4b && // K
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  );
}

/**
 * Extracts raw text from a DOCX Buffer.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  if (!isDocxSignature(buffer)) {
    throw new ValidationError('Invalid DOCX file signature. The file does not appear to be a valid Word document.');
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value ? result.value.trim() : '';

    if (!rawText) {
      throw new ValidationError('Could not extract readable text from DOCX. The document may be empty or corrupted.');
    }

    // Bounded text length (max 150,000 characters)
    return rawText.slice(0, 150000);
  } catch (err: unknown) {
    if (err instanceof ValidationError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new ValidationError(`Failed to parse DOCX document: ${msg}`);
  }
}
