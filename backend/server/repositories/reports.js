import { pool } from '../db.js';

export async function listReports(userId, isOperations) {
  const result = await pool.query(
    `SELECT r.id, u.name AS author, u.role, r.type, r.project_id AS "projectId",
       p.title AS "projectTitle", r.message, r.attachments, r.created_at AS "createdAt", r.status
     FROM reports r
     JOIN users u ON u.id = r.author_id
     LEFT JOIN projects p ON p.id = r.project_id
     WHERE ($1::uuid IS NULL OR r.author_id = $1 OR $2::boolean = TRUE)
     ORDER BY r.created_at DESC`,
    [isOperations ? null : userId || null, isOperations]
  );
  return result.rows;
}

export async function createReport({ authorId, type, projectId, message, attachments }) {
  const result = await pool.query(
    `INSERT INTO reports (author_id, type, project_id, message, attachments)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id`,
    [authorId, type, projectId || null, message, JSON.stringify(attachments || [])]
  );
  return result.rows[0].id;
}

export async function getReportSummary(userId, isOperations) {
  const result = await pool.query(
    `SELECT COUNT(t.id)::int AS "totalTasks",
       COUNT(t.id) FILTER (WHERE t.status IN ('Completed', 'done'))::int AS completed,
       COALESCE(ROUND(AVG(t.progress)), 0)::int AS "avgTaskProgress",
       COALESCE(ROUND(AVG(p.progress)), 0)::int AS "avgProjectProgress"
     FROM tasks t
     LEFT JOIN projects p ON p.id = t.project_id
     WHERE t.task_type = 'project' AND ($1::uuid IS NULL OR p.account_manager_id = $1 OR t.created_by = $1 OR $2::boolean = TRUE)`,
    [isOperations ? null : userId || null, isOperations]
  );
  return result.rows[0];
}
