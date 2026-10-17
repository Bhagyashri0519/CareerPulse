/**
 * ai.routes.ts
 * Express router for CareerPulse AI mentor endpoints.
 */

import { Router } from 'express';
import { aiController } from './ai.controller';
import { authenticate } from '../../middleware/auth.middleware';

const aiRouter = Router();

// All AI routes require verified JWT authentication
aiRouter.use(authenticate);

aiRouter.post('/chat', (req, res, next) => aiController.chat(req, res, next));
aiRouter.get('/context', (req, res, next) => aiController.getContext(req, res, next));
aiRouter.get('/suggestions', (req, res, next) => aiController.getSuggestions(req, res, next));

export default aiRouter;
