import dns from 'dns';
import mongoose from 'mongoose';

type DbState = 'connected' | 'connecting' | 'disconnected';

let connectionState: DbState = 'disconnected';

export function getDbState(): DbState {
  if (mongoose.connection.readyState === 1) return 'connected';
  if (mongoose.connection.readyState === 2) return 'connecting';
  return 'disconnected';
}

/**
 * Configure process-level DNS servers if DNS_SERVERS is explicitly defined.
 */
function applyCustomDns(): void {
  const rawDns = process.env.DNS_SERVERS;
  if (rawDns === undefined) return;

  const servers = rawDns
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    throw new Error('DNS_SERVERS is set but contains no valid server addresses.');
  }

  try {
    dns.setServers(servers);
    console.log(`[DB] Configured custom DNS servers: ${servers.join(', ')}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid DNS_SERVERS configuration: ${message}`);
  }
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
    applyCustomDns();

    connectionState = 'connecting';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
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
