import { pool } from '../db.js';

export async function listClients() {
  const result = await pool.query(`
    SELECT
      c.id,
      c.name,
      u.name AS am,
      COALESCE(p.project_count, 0)::int AS projects,
      c.health,
      c.last_activity_at
    FROM clients c
    LEFT JOIN users u ON u.id = c.account_manager_id
    LEFT JOIN (
      SELECT client_id, COUNT(*) AS project_count FROM projects GROUP BY client_id
    ) p ON p.client_id = c.id
    ORDER BY c.name
  `);
  return result.rows;
}

export async function findClientById(id) {
  const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function findClientByName(name) {
  const result = await pool.query('SELECT * FROM clients WHERE name = $1', [name]);
  return result.rows[0] || null;
}

export async function createClient({ name, accountManagerId, health }) {
  const result = await pool.query(
    `INSERT INTO clients (name, account_manager_id, health)
     VALUES ($1, $2, COALESCE($3, 'on_track'))
     RETURNING *`,
    [name, accountManagerId || null, health || null]
  );
  return result.rows[0];
}
