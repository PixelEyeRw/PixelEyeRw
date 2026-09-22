export async function createDeliverableTx(client, { projectId, submissionId, name, description, stage, mainTask, role, assigneeId, manualAssignee, deadline, status, progress }) {
  const result = await client.query(
    `INSERT INTO deliverables (project_id, submission_id, name, description, stage, main_task, role, assignee_id, manual_assignee, deadline, status, progress)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, 'Not Started'), COALESCE($12, 0))
     RETURNING *`,
    [projectId, submissionId, name, description || null, stage || null, mainTask || null, role || null, assigneeId, manualAssignee, deadline || null, status ?? null, progress ?? null]
  );
  return result.rows[0];
}

export async function listDeliverablesByProject(projectId) {
  const { pool } = await import('../db.js');
  const result = await pool.query(
    `SELECT d.*, u.name AS assignee_name
     FROM deliverables d
     LEFT JOIN users u ON u.id = d.assignee_id
     WHERE d.project_id = $1
     ORDER BY d.created_at`,
    [projectId]
  );
  return result.rows;
}
