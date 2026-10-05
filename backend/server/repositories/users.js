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

export async function listSystemRoles() {
  const result = await pool.query(`
    SELECT role AS id, role AS name, COUNT(*)::int AS users, TRUE AS active
    FROM users
    GROUP BY role
    ORDER BY role
  `);
  return result.rows;
}

export async function listAccountManagers() {
  const result = await pool.query(`
    SELECT u.id, u.name, u.title, u.email,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status NOT IN ('Completed', 'Delivered'))::int AS "activeProjects",
      COUNT(DISTINCT c.id)::int AS clients,
      u.capacity_max AS "capacityMax"
    FROM users u
    LEFT JOIN projects p ON p.account_manager_id = u.id
    LEFT JOIN clients c ON c.account_manager_id = u.id
    WHERE u.role = 'Account Manager'
    GROUP BY u.id
    ORDER BY u.name
  `);
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

export async function getUserProfile(id) {
  const result = await pool.query(
    `SELECT id, name, email, role, title, phone, bio, avatar_url AS avatar
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function updateUserProfile(id, fields) {
  const result = await pool.query(
    `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email),
       title = COALESCE($3, title), phone = COALESCE($4, phone), bio = COALESCE($5, bio),
       avatar_url = COALESCE($6, avatar_url), updated_at = NOW()
     WHERE id = $7 RETURNING id, name, email, role, title, phone, bio, avatar_url AS avatar`,
    [fields.name ?? null, fields.email ?? null, fields.title ?? null, fields.phone ?? null, fields.bio ?? null, fields.avatar ?? null, id]
  );
  return result.rows[0] || null;
}

export function toPublicUser(user) {
  if (!user) return null;
  const { password_hash, ...publicFields } = user;
  return publicFields;
}
