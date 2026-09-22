import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const schemaPath = path.join(currentDirectory, 'schema.sql');

try {
  const schema = await fs.readFile(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('PixelEye PostgreSQL schema is ready.');
} catch (error) {
  console.error('PostgreSQL migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
