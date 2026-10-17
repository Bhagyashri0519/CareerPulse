/**
 * ai.controller.ts
 * Express controller for CareerPulse AI mentor & website guide endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import { studentContextService } from './student-context.service';
import { aiProviderService } from './ai.provider.service';
import { sendSuccess } from '../../utils/api-response';
import { ValidationError } from '../../utils/errors';

export class AIController {
  /**
   * POST /api/v1/ai/chat
   * Authenticated conversation turn with CareerPulse AI.
   */
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { message, history, currentPage } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        throw new ValidationError('Message is required and cannot be empty');
      }

      if (message.length > 2000) {
        throw new ValidationError('Message exceeds maximum length of 2000 characters');
      }

      const validHistory = Array.isArray(history)
        ? history.slice(-10).map((h) => ({
            role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: typeof h.content === 'string' ? h.content : typeof h.text === 'string' ? h.text : '',
          }))
        : [];

      // 1. Fetch fresh student context
      const studentContext = await studentContextService.getStudentContext(userId);

      // 2. Generate AI response
      const response = await aiProviderService.generateResponse({
        userId,
        message: message.trim(),
        history: validHistory,
        currentPage: typeof currentPage === 'string' ? currentPage : '/dashboard',
        studentContext,
      });

      sendSuccess(res, response, 'AI response generated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/ai/context
   * Returns current authenticated student context summary and onboarding status.
   */
  async getContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const context = await studentContextService.getStudentContext(userId);
      sendSuccess(res, context, 'Student AI context retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/ai/suggestions
   * Returns contextual prompt suggestions based on page and onboarding progress.
   */
  async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = typeof req.query.page === 'string' ? req.query.page : '/dashboard';
      const studentContext = await studentContextService.getStudentContext(userId);
      const suggestions = aiProviderService.generateSuggestions(page, studentContext);

      sendSuccess(res, { suggestions, studentName: studentContext.studentName }, 'Suggestions retrieved', 200);
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AIController();
export default aiController;
