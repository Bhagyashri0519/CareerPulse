import 'dotenv/config';
import http from 'http';
import app from './app';
import { connectDb, disconnectDb } from './config/db';

const PORT = Number(process.env.BACKEND_PORT ?? 4000);
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/careerpulse';

// ─── Validate Environment ────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[Startup] Fatal: JWT_SECRET must be set in production!');
    process.exit(1);
  } else {
    process.env.JWT_SECRET = 'dev_fallback_secret_careerpulse_2026';
    console.warn('[Startup] Warning: JWT_SECRET not set. Using dev fallback secret.');
  }
}

// ─── Start Server ────────────────────────────────────────────────────────────
async function startServer() {
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 CareerPulse Backend running on http://localhost:${PORT}`);
    console.log(`💓 Health Check: http://localhost:${PORT}/health`);
    console.log(`📡 API Base:     http://localhost:${PORT}/api/v1`);
    console.log(`⚙️  Environment:  ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================\n`);
  });

  // Attempt DB connection asynchronously
  connectDb(MONGODB_URI).catch((err) => {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Startup] Fatal DB error:', err);
      process.exit(1);
    }
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDb();
      console.log('[Server] Process terminated cleanly.');
      process.exit(0);
    });

    // Force close after 5 seconds if lingering
    setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[Startup] Uncaught server error:', err);
  process.exit(1);
});
