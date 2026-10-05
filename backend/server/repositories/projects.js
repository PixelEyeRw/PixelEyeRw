import { pool } from '../db.js';

const PROJECT_SELECT = `
  SELECT
    pr.id,
    COALESCE(pr.display_code, 'AM-' || LEFT(pr.id::text, 8)) AS "projectId",
    pr.title,
    pr.title AS project,
    c.name AS client,
    u.name AS am,
    u.name AS "accountOwner",
    COALESCE(lead.name, lead.manual_assignee, u.name) AS "projectLead",
    pr.priority,
    pr.status,
    pr.status AS "overallStatus",
    pr.progress,
    pr.risk_level AS "riskLevel",
    pr.task_stage AS "taskStage",
    pr.revenue_source AS "revenueSource",
    pr.cost_source AS "costSource",
    pr.start_date AS "startDate",
    pr.target_deadline AS "targetDeadline"
  FROM projects pr
  JOIN clients c ON c.id = pr.client_id
  LEFT JOIN users u ON u.id = pr.account_manager_id
  LEFT JOIN LATERAL (
    SELECT du.name, d.manual_assignee
    FROM deliverables d
    LEFT JOIN users du ON du.id = d.assignee_id
    WHERE d.project_id = pr.id
    ORDER BY d.created_at
    LIMIT 1
  ) lead ON TRUE
`;

export async function listProjects(accountManagerId, assignedUserId) {
  const result = await pool.query(
    `${PROJECT_SELECT}
     WHERE ($1::uuid IS NULL OR pr.account_manager_id = $1)
       AND ($2::uuid IS NULL OR EXISTS (
         SELECT 1 FROM tasks t WHERE t.project_id = pr.id AND (t.assigned_to = $2 OR t.created_by = $2)
       ))
     ORDER BY pr.title`,
    [accountManagerId || null, assignedUserId || null]
  );
  return result.rows;
}

export async function listAMProjects(accountManagerId) {
  const rows = await listProjects(accountManagerId);
  return rows.map((row) => ({
    ...row,
    priority: ({ MID: 'Medium', HIGH: 'High', LOW: 'Low' })[row.priority] || row.priority,
    overallStatus: ({ on_track: 'In Progress', at_risk: 'Revision', overdue: 'Waiting Approval' })[row.status] || row.status,
    startDate: row.startDate || '',
    targetDeadline: row.targetDeadline || '',
  }));
}

export async function findProjectById(id, accountManagerId, assignedUserId) {
  const result = await pool.query(
    `${PROJECT_SELECT} WHERE pr.id = $1
       AND ($2::uuid IS NULL OR pr.account_manager_id = $2)
       AND ($3::uuid IS NULL OR EXISTS (
         SELECT 1 FROM tasks t WHERE t.project_id = pr.id AND (t.assigned_to = $3 OR t.created_by = $3)
       ))`,
    [id, accountManagerId || null, assignedUserId || null]
  );
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

export async function updateProject(id, fields, accountManagerId) {
  const existing = await pool.query('SELECT * FROM projects WHERE id = $1 AND ($2::uuid IS NULL OR account_manager_id = $2)', [id, accountManagerId || null]);
  if (!existing.rows[0]) return null;
  const current = existing.rows[0];
  await pool.query(
    `UPDATE projects
     SET title = $1, priority = $2, status = $3, progress = $4, start_date = $5, target_deadline = $6,
       risk_level = $7, task_stage = $8, revenue_source = $9, cost_source = $10, updated_at = NOW()
    WHERE id = $11 AND ($12::uuid IS NULL OR account_manager_id = $12)`,
    [
      fields.title ?? current.title,
      fields.priority ?? current.priority,
      fields.status ?? current.status,
      fields.progress ?? current.progress,
      fields.startDate ?? current.start_date,
      fields.targetDeadline ?? current.target_deadline,
      fields.riskLevel ?? current.risk_level,
      fields.taskStage ?? current.task_stage,
      fields.revenueSource ?? current.revenue_source,
      fields.costSource ?? current.cost_source,
      id,
      accountManagerId || null,
    ]
  );
  return findProjectById(id, accountManagerId);
}

export async function updateAMProjects(rows = [], accountManagerId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      await client.query(
        `UPDATE projects SET target_deadline = $1, priority = $2, risk_level = $3, status = $4,
           task_stage = $5, revenue_source = $6, cost_source = $7, updated_at = NOW()
         WHERE id = $8 AND ($9::uuid IS NULL OR account_manager_id = $9)`,
        [row.targetDeadline || null, row.priority, row.riskLevel, row.overallStatus, row.taskStage, row.revenueSource || 0, row.costSource || 0, row.id, accountManagerId || null]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return listProjects(accountManagerId);
}
