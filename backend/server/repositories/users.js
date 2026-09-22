import { pool } from '../db.js';

export async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function listUsers() {
  const result = await pool.query('SELECT * FROM users ORDER BY name');
  return result.rows;
}

export async function createUser({ name, email, passwordHash, role, title }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, title)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email, passwordHash, role, title || null]
  );
  return result.rows[0];
}

export function toPublicUser(user) {
  if (!user) return null;
  const { password_hash, ...publicFields } = user;
  return publicFields;
}
