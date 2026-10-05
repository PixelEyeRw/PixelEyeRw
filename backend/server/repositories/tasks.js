import { pool } from '../db.js';

export async function createTaskTx(client, { projectId, deliverableId, createdBy, assignedTo, manualAssignee, role, task, deadline, status, priority, approvalStatus, nextAction, stage }) {
  const assignmentType = assignedTo || manualAssignee ? 'assigned' : 'personal';
  const result = await client.query(
    `INSERT INTO tasks (project_id, deliverable_id, created_by, assigned_to, manual_assignee, assignment_type, role, task, status, priority, deadline, approval_status, next_action, stage)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'Not Started'), $10, $11, COALESCE($12, 'Not Required'), $13, $14)
     RETURNING *`,
    [projectId, deliverableId, createdBy, assignedTo, manualAssignee, assignmentType, role || null, task, status ?? null, priority || null, deadline || null, approvalStatus ?? null, nextAction || null, stage || null]
  );
  return result.rows[0];
}

const AM_TASK_SELECT = `
  SELECT t.id, COALESCE(p.display_code, 'AM-' || LEFT(p.id::text, 8)) AS "projectId",
    c.name AS client, p.title AS project, COALESCE(d.stage, t.stage) AS stage,
    d.name AS "deliverableName", t.task AS "mainTask", t.role,
    COALESCE(u.name, t.manual_assignee, 'Unassigned') AS owner,
    t.status, t.progress, t.deadline, t.approval_status AS "approvalStatus",
    t.next_action AS "nextAction", t.deliverable_id AS "deliverableId"
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
  JOIN clients c ON c.id = p.client_id
  LEFT JOIN deliverables d ON d.id = t.deliverable_id
  LEFT JOIN users u ON u.id = t.assigned_to
`;

export async function listAMTaskProgress(accountManagerId) {
  const result = await pool.query(
    `${AM_TASK_SELECT} WHERE ($1::uuid IS NULL OR p.account_manager_id = $1) ORDER BY t.created_at`,
    [accountManagerId || null]
  );
  return result.rows;
}

export async function updateAMTaskProgress(rows = [], accountManagerId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      await client.query(
        `UPDATE tasks SET task = $1, status = $2, progress = $3, deadline = $4,
           approval_status = $5, next_action = $6, stage = $7, updated_at = NOW()
         WHERE id = $8 AND ($9::uuid IS NULL OR project_id IN (SELECT id FROM projects WHERE account_manager_id = $9))`,
        [row.mainTask, row.status, row.progress, row.deadline || null, row.approvalStatus, row.nextAction || null, row.stage || null, row.id, accountManagerId || null]
      );
      if (row.deliverableId) {
        await client.query(
          `UPDATE deliverables SET status = $1, progress = $2, deadline = $3, stage = $4, main_task = $5, updated_at = NOW()
           WHERE id = $6 AND project_id IN (SELECT id FROM projects WHERE ($7::uuid IS NULL OR account_manager_id = $7))`,
          [row.status, row.progress, row.deadline || null, row.stage || null, row.mainTask, row.deliverableId, accountManagerId || null]
        );
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return listAMTaskProgress(accountManagerId);
}

export async function listTaskBoard({ userId, isOperations = false } = {}) {
  const result = await pool.query(`
    SELECT t.id, COALESCE(p.display_code, 'AM-' || LEFT(p.id::text, 8)) AS "projectId",
      c.name AS client, p.title AS project, t.stage AS "taskStage", t.task AS "mainTask", t.role,
      COALESCE(u.name, t.manual_assignee, 'Unassigned') AS owner, t.support, t.priority,
      t.status, t.progress, t.deadline, t.approval_status AS "approvalStatus"
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    JOIN clients c ON c.id = p.client_id
    LEFT JOIN users u ON u.id = t.assigned_to
    WHERE t.task_type = 'project'
      AND ($1::boolean = TRUE OR p.account_manager_id = $2 OR t.assigned_to = $2 OR t.created_by = $2)
    ORDER BY t.created_at
  `, [isOperations, userId || null]);
  return result.rows;
}

export async function updateTaskBoard(rows = []) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const assignee = await client.query('SELECT id FROM users WHERE name = $1', [row.owner]);
      const assignedTo = assignee.rows[0]?.id || null;
      const manualAssignee = assignedTo ? null : row.owner || null;
      await client.query(
        `UPDATE tasks SET task = $1, stage = $2, role = $3, assigned_to = $4, manual_assignee = $5,
          support = $6, priority = $7, status = $8, progress = $9, deadline = $10,
          approval_status = $11, updated_at = NOW()
         WHERE id = $12 AND task_type = 'project'`,
        [row.mainTask, row.taskStage || null, row.role || null, assignedTo, manualAssignee, row.support || null, row.priority || null, row.status, row.progress, row.deadline || null, row.approvalStatus || 'Not Required', row.id]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return listTaskBoard();
}

export async function listDailyTasks(userId, isOperations) {
  const result = await pool.query(`
    SELECT t.id, t.created_by AS "employeeId", creator.name AS "employeeName",
      t.created_at::date AS date, t.task, p.id AS "projectId", p.title AS "projectName",
      t.role, CASE WHEN t.assignment_type = 'personal' THEN creator.name ELSE COALESCE(assignee.name, t.manual_assignee) END AS "assignedTo",
      t.assignment_type AS "assignmentType", t.status, t.comment,
      t.submission_link AS "submissionLink", t.created_at AS "createdAt", t.completed_at AS "completedAt"
    FROM tasks t
    JOIN users creator ON creator.id = t.created_by
    LEFT JOIN users assignee ON assignee.id = t.assigned_to
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE t.task_type = 'daily' AND ($1::uuid IS NULL OR t.created_by = $1 OR t.assigned_to = $1)
    ORDER BY t.created_at DESC
  `, [isOperations ? null : userId || null]);
  return result.rows;
}

export async function createDailyTask(input) {
  const result = await pool.query(
    `INSERT INTO tasks (project_id, created_by, assigned_to, manual_assignee, assignment_type, role, task, task_type, status, comment, submission_link)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'daily', 'in-progress', '', '')
     RETURNING id`,
    [input.projectId, input.employeeId, input.assignedToId, input.manualAssignee, input.assignmentType, input.role, input.task]
  );
  const tasks = await listDailyTasks(input.employeeId, false);
  return tasks.find((task) => task.id === result.rows[0].id);
}

export async function updateDailyTask(id, userId, fields, isOperations = false) {
  const result = await pool.query(
    `UPDATE tasks SET status = COALESCE($1, status), comment = COALESCE($2, comment),
      submission_link = COALESCE($3, submission_link), completed_at = CASE WHEN $1 = 'done' THEN NOW() ELSE completed_at END,
      updated_at = NOW()
     WHERE id = $4 AND task_type = 'daily'
       AND ($6::boolean = TRUE OR created_by = $5 OR assigned_to = $5) RETURNING id`,
    [fields.status ?? null, fields.comment ?? null, fields.submissionLink ?? null, id, userId, isOperations]
  );
  if (!result.rows[0]) return null;
  const tasks = await listDailyTasks(userId, isOperations);
  return tasks.find((task) => task.id === id) || null;
}

export async function deleteDailyTask(id, userId, isOperations = false) {
  const result = await pool.query(
    `DELETE FROM tasks WHERE id = $1 AND task_type = 'daily'
       AND ($3::boolean = TRUE OR created_by = $2) RETURNING id`,
    [id, userId, isOperations]
  );
  return Boolean(result.rows[0]);
}
