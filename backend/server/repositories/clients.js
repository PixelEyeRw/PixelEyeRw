import { pool } from '../db.js';

export async function listClients(accountManagerId, assignedUserId) {
  const result = await pool.query(`
    SELECT
      c.id,
      c.name,
      u.name AS am,
      COALESCE(p.project_count, 0)::int AS projects,
      c.health,
      c.last_activity_at AS "lastActivity"
    FROM clients c
    LEFT JOIN users u ON u.id = c.account_manager_id
    LEFT JOIN (
      SELECT client_id, COUNT(*) AS project_count FROM projects GROUP BY client_id
    ) p ON p.client_id = c.id
    WHERE ($1::uuid IS NULL OR c.account_manager_id = $1)
      AND ($2::uuid IS NULL OR EXISTS (
        SELECT 1 FROM projects pr JOIN tasks t ON t.project_id = pr.id
        WHERE pr.client_id = c.id AND (t.assigned_to = $2 OR t.created_by = $2)
      ))
    ORDER BY c.name
  `, [accountManagerId || null, assignedUserId || null]);
  return result.rows;
}

export async function findClientById(id, accountManagerId, assignedUserId) {
  const result = await pool.query(
    `SELECT c.* FROM clients c WHERE c.id = $1
       AND ($2::uuid IS NULL OR c.account_manager_id = $2)
       AND ($3::uuid IS NULL OR EXISTS (
         SELECT 1 FROM projects pr JOIN tasks t ON t.project_id = pr.id
         WHERE pr.client_id = c.id AND (t.assigned_to = $3 OR t.created_by = $3)
       ))`,
    [id, accountManagerId || null, assignedUserId || null]
  );
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
