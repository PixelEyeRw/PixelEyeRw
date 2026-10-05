import { pool } from '../db.js';

const SELECT = `
  SELECT i.id, COALESCE(c.name, i.client_name) AS client,
    i.project_name AS "projectName", i.priority, i.notes,
    i.requested_deadline AS "requestedDeadline", i.status,
    u.name AS "createdBy", i.created_at AS "createdAt"
  FROM intakes i
  JOIN users u ON u.id = i.created_by
  LEFT JOIN clients c ON c.id = i.client_id
`;

export async function listIntakes() {
  const result = await pool.query(`${SELECT} ORDER BY i.created_at DESC`);
  return result.rows;
}

export async function createIntake({ createdBy, client, projectName, priority, notes, requestedDeadline }) {
  const clientResult = await pool.query('SELECT id FROM clients WHERE LOWER(name) = LOWER($1)', [client]);
  const result = await pool.query(
    `INSERT INTO intakes (created_by, client_id, client_name, project_name, priority, notes, requested_deadline)
     VALUES ($1, $2, $3, $4, COALESCE($5, 'medium'), COALESCE($6, ''), $7)
     RETURNING id`,
    [createdBy, clientResult.rows[0]?.id || null, client, projectName, priority, notes, requestedDeadline || null]
  );
  const created = await pool.query(`${SELECT} WHERE i.id = $1`, [result.rows[0].id]);
  return created.rows[0];
}

export async function updateIntakeStatus(id, status) {
  const result = await pool.query(
    'UPDATE intakes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
    [status, id]
  );
  if (!result.rows[0]) return null;
  const intake = await pool.query(`${SELECT} WHERE i.id = $1`, [id]);
  return intake.rows[0];
}
