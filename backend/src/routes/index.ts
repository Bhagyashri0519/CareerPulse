import { Router } from 'express';
import { sendSuccess } from '../utils/api-response';

/**
 * Root API router — mounts all module sub-routers under /api/v1.
 * Conforms to the standard API response format.
 */
const apiRouter = Router();

// API root info & status
apiRouter.get('/', (_req, res) => {
  sendSuccess(
    res,
    {
      name: 'CareerPulse API',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        health: '/health',
        apiRoot: '/api/v1',
      },
    },
    'Welcome to CareerPulse API v1',
  );
});

// ─── Module routes ─────────────────────────────────────────────────────────────
import authRouter from '../modules/auth/auth.routes';
import profilesRouter from '../modules/profiles/profiles.routes';
import resumesRouter from '../modules/resumes/resumes.routes';
import aiRouter from '../modules/ai/ai.routes';

apiRouter.use('/auth', authRouter);
apiRouter.use('/profiles', profilesRouter);
apiRouter.use('/resumes', resumesRouter);
apiRouter.use('/ai', aiRouter);
// apiRouter.use('/skills', skillsRouter);
// apiRouter.use('/assessments', assessmentsRouter);
// apiRouter.use('/skill-gap', skillGapRouter);
// apiRouter.use('/roadmaps', roadmapsRouter);
// apiRouter.use('/resources', resourcesRouter);
// apiRouter.use('/career-matching', careerMatchingRouter);

export { apiRouter };
