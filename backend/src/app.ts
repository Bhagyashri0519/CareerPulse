import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { apiRouter } from './routes';
import { getDbState } from './config/db';
import { sendError } from './utils/api-response';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8443',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  }),
);

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900_000),
  max: Number(process.env.RATE_LIMIT_MAX ?? 500),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Body parsing & logging ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'careerpulse-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: getDbState(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  sendError(res, 'Route not found', 404);
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

export default app;
