import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection validation
export const validateConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Enhanced query function with better error handling
export const query = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', {
      query: text,
      params,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
};

export const getClient = (): Promise<PoolClient> => pool.connect();

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('📦 Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

export default pool;