import 'dotenv/config';
import pg from 'pg';

const { Pool, types } = pg;

// Return DATE columns as raw 'YYYY-MM-DD' strings; the default parser
// creates a local-timezone Date that can shift the date by one day.
types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export async function checkDatabaseConnection() {
  const result = await pool.query('SELECT NOW() AS now');
  return result.rows[0];
}
