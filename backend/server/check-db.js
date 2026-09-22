import { checkDatabaseConnection, pool } from './db.js';

try {
  const result = await checkDatabaseConnection();
  console.log(`PostgreSQL connected at ${result.now.toISOString()}`);
} catch (error) {
  console.error('PostgreSQL connection failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
