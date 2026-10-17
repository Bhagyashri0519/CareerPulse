import pdfParse from 'pdf-parse';
import { ValidationError } from '../../../utils/errors';

/**
 * Validates that the buffer starts with the PDF magic header (%PDF).
 */
export function isPdfSignature(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46    // F
  );
}

/**
 * Extracts plain text from a PDF Buffer with size/page boundary enforcement.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!isPdfSignature(buffer)) {
    throw new ValidationError('Invalid PDF file signature. The file does not appear to be a valid PDF.');
  }

  try {
    const data = await pdfParse(buffer, {
      max: 50, // Limit to first 50 pages to prevent memory exhaustion
    });

    const rawText = data.text ? data.text.trim() : '';

    if (!rawText) {
      throw new ValidationError('Could not extract readable text from PDF. The document may be empty, image-only, or encrypted.');
    }

    // Bounded text length (max 150,000 characters)
    return rawText.slice(0, 150000);
  } catch (err: unknown) {
    if (err instanceof ValidationError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new ValidationError(`Failed to parse PDF document: ${msg}`);
  }
}
