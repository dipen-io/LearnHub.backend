import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env.config';
import * as schema from '../schema';

const isDev = env.NODE_ENV === 'development';

const dbUrl = isDev ? env.LOCAL_DB_URL : env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbUrl,
  ...(isDev
    ? {}
    : {
        ssl: {
          rejectUnauthorized: false, // Supabase requires SSL, but allows self-signed certs
        },
      }),
});

// export const db = drizzle(pool);
export const db = drizzle(pool, { schema });

// Optional: Confirm DB connection with a test query
export async function testDbConnection() {
  try {
    await pool.query('SELECT 1'); // Simple test query
    console.log('✅ Connected to PostgreSQL database successfully.');
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err);
    process.exit(1);
  }
}
