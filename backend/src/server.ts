import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

const PORT = Number(process.env.BACKEND_PORT ?? 4000);
const MONGODB_URI = process.env.MONGODB_URI;

// ─── Validate required env vars ───────────────────────────────────────────────
if (!MONGODB_URI) {
  console.error('[Startup] MONGODB_URI is not set. Check your .env file.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('[Startup] JWT_SECRET is not set. Check your .env file.');
  process.exit(1);
}

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
async function start() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('[DB] MongoDB connected');

    app.listen(PORT, () => {
      console.log(`[Server] CareerPulse backend running on http://localhost:${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
      console.log(`[Server] API base:     http://localhost:${PORT}/api/v1`);
    });
  } catch (err) {
    console.error('[Startup] Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

start();
