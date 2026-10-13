import { Router } from 'express';

/**
 * Root API router — mounts all module sub-routers under /api/v1.
 * Add new module routers here as the platform grows.
 */
const apiRouter = Router();

// Health endpoint (also available at root /health in app.ts)
apiRouter.get('/', (_req, res) => {
  res.json({ success: true, message: 'CareerPulse API v1', version: '1.0.0' });
});

// ─── Module routes (uncomment as each module is implemented) ──────────────────
// import authRouter from '../modules/auth/auth.routes';
// import usersRouter from '../modules/users/users.routes';
// import profilesRouter from '../modules/profiles/profiles.routes';
// import resumesRouter from '../modules/resumes/resumes.routes';
// import skillsRouter from '../modules/skills/skills.routes';
// import assessmentsRouter from '../modules/assessments/assessments.routes';
// import skillGapRouter from '../modules/skill-gap/skill-gap.routes';
// import roadmapsRouter from '../modules/roadmaps/roadmaps.routes';
// import resourcesRouter from '../modules/resources/resources.routes';
// import careerMatchingRouter from '../modules/career-matching/career-matching.routes';

// apiRouter.use('/auth', authRouter);
// apiRouter.use('/users', usersRouter);
// apiRouter.use('/profiles', profilesRouter);
// apiRouter.use('/resumes', resumesRouter);
// apiRouter.use('/skills', skillsRouter);
// apiRouter.use('/assessments', assessmentsRouter);
// apiRouter.use('/skill-gap', skillGapRouter);
// apiRouter.use('/roadmaps', roadmapsRouter);
// apiRouter.use('/resources', resourcesRouter);
// apiRouter.use('/career-matching', careerMatchingRouter);

export { apiRouter };
