import { pool } from '../db.js';

const PROJECT_SELECT = `
  SELECT
    pr.id,
    pr.title,
    c.name AS client,
    u.name AS am,
    pr.priority,
    pr.status,
    pr.progress,
    pr.start_date,
    pr.target_deadline
  FROM projects pr
  JOIN clients c ON c.id = pr.client_id
  LEFT JOIN users u ON u.id = pr.account_manager_id
`;

export async function listProjects() {
  const result = await pool.query(`${PROJECT_SELECT} ORDER BY pr.title`);
  return result.rows;
}

export async function findProjectById(id) {
  const result = await pool.query(`${PROJECT_SELECT} WHERE pr.id = $1`, [id]);
  return result.rows[0] || null;
}

export async function createProject({ title, clientId, accountManagerId, priority, status, progress, startDate, targetDeadline }) {
  const result = await pool.query(
    `INSERT INTO projects (title, client_id, account_manager_id, priority, status, progress, start_date, target_deadline)
     VALUES ($1, $2, $3, COALESCE($4, 'MEDIUM'), COALESCE($5, 'Not Started'), COALESCE($6, 0), $7, $8)
     RETURNING id`,
    [title, clientId, accountManagerId || null, priority, status, progress, startDate || null, targetDeadline || null]
  );
  return findProjectById(result.rows[0].id);
}

export async function updateProject(id, fields) {
  const existing = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  if (!existing.rows[0]) return null;
  const current = existing.rows[0];
  await pool.query(
    `UPDATE projects
     SET title = $1, priority = $2, status = $3, progress = $4, start_date = $5, target_deadline = $6, updated_at = NOW()
     WHERE id = $7`,
    [
      fields.title ?? current.title,
      fields.priority ?? current.priority,
      fields.status ?? current.status,
      fields.progress ?? current.progress,
      fields.startDate ?? current.start_date,
      fields.targetDeadline ?? current.target_deadline,
      id,
    ]
  );
  return findProjectById(id);
}
