import mongoose from 'mongoose';

type DbState = 'connected' | 'connecting' | 'disconnected';

let connectionState: DbState = 'disconnected';

export function getDbState(): DbState {
  if (mongoose.connection.readyState === 1) return 'connected';
  if (mongoose.connection.readyState === 2) return 'connecting';
  return 'disconnected';
}

/**
 * Connect to MongoDB with graceful error handling and retry support.
 */
export async function connectDb(uri?: string): Promise<boolean> {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('[DB] MONGODB_URI is not set. Running in offline/in-memory mode.');
    connectionState = 'disconnected';
    return false;
  }

  try {
    connectionState = 'connecting';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    connectionState = 'connected';
    console.log('[DB] MongoDB connected successfully');

    mongoose.connection.on('disconnected', () => {
      connectionState = 'disconnected';
      console.warn('[DB] MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      connectionState = 'connected';
      console.log('[DB] MongoDB reconnected');
    });

    return true;
  } catch (err: unknown) {
    connectionState = 'disconnected';
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[DB] Notice: MongoDB is currently offline (${message}).`);

    if (process.env.NODE_ENV === 'production') {
      console.error('[DB] Fatal: Cannot proceed in production without database.');
      throw err;
    }

    console.warn('[DB] Dev mode active: server is running and serving health checks & non-DB endpoints.');
    return false;
  }
}

/**
 * Disconnect database (used during tests or graceful shutdown).
 */
export async function disconnectDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectionState = 'disconnected';
  }
}
