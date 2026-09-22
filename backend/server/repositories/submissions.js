import { pool } from '../db.js';
import { resolveAssignee } from './assignees.js';
import { createDeliverableTx } from './deliverables.js';
import { createTaskTx } from './tasks.js';

const SELECT = `
  SELECT
    s.id,
    s.client_id,
    c.name AS client,
    s.submitted_by,
    submitter.name AS "submittedBy",
    s.project_name AS project,
    s.description,
    s.objective,
    s.priority,
    s.deadline,
    s.attachment_name AS "attachmentName",
    s.message AS comment,
    s.deliverables,
    s.status,
    s.reviewed_by,
    reviewer.name AS "reviewedBy",
    s.reviewed_at AS "reviewedAt",
    s.review_note AS "reviewNote",
    s.created_at AS "submittedAt",
    s.updated_at AS "updatedAt"
  FROM project_submissions s
  JOIN clients c ON c.id = s.client_id
  JOIN users submitter ON submitter.id = s.submitted_by
  LEFT JOIN users reviewer ON reviewer.id = s.reviewed_by
`;

function withDisplayId(row) {
  if (!row) return row;
  return {
    ...row,
    projectId: `AM-${row.id.slice(0, 8)}`,
    deadline: row.deadline || null,
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}

export async function listSubmissions() {
  const result = await pool.query(`${SELECT} ORDER BY s.created_at DESC`);
  return result.rows.map(withDisplayId);
}

export async function findSubmissionById(id) {
  const result = await pool.query(`${SELECT} WHERE s.id = $1`, [id]);
  return withDisplayId(result.rows[0] || null);
}

export async function createSubmission({ clientId, submittedById, projectName, description, objective, priority, deadline, attachmentName, comment, deliverables }) {
  const result = await pool.query(
    `INSERT INTO project_submissions
       (client_id, submitted_by, project_name, description, objective, priority, deadline, attachment_name, message, deliverables)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'Medium'), $7, $8, $9, $10)
     RETURNING id`,
    [clientId, submittedById, projectName, description || null, objective || null, priority, deadline || null, attachmentName || null, comment || null, JSON.stringify(deliverables || [])]
  );
  return findSubmissionById(result.rows[0].id);
}

export async function updateSubmissionStatus(id, { status, reviewedById, reviewNote }) {
  const result = await pool.query(
    `UPDATE project_submissions
     SET status = $1, reviewed_by = $2, reviewed_at = NOW(), review_note = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id`,
    [status, reviewedById || null, reviewNote || null, id]
  );
  if (!result.rows[0]) return null;
  return findSubmissionById(id);
}

// Approving a submission atomically creates the project plus one deliverable
// and one task per submitted deliverable, and records the review decision.
export async function approveSubmission(id, { reviewedById, reviewNote }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const submissionResult = await client.query(
      `SELECT id, client_id, submitted_by, project_name, priority, deadline, deliverables, status
       FROM project_submissions WHERE id = $1 FOR UPDATE`,
      [id]
    );
    const submission = submissionResult.rows[0];
    if (!submission) {
      await client.query('ROLLBACK');
      return null;
    }
    if (submission.status !== 'Pending Review') {
      await client.query('ROLLBACK');
      throw new Error(`Submission is already ${submission.status}`);
    }

    const projectResult = await client.query(
      `INSERT INTO projects (title, client_id, account_manager_id, priority, status, progress, target_deadline)
       VALUES ($1, $2, $3, $4, 'In Progress', 0, $5)
       RETURNING id`,
      [submission.project_name, submission.client_id, submission.submitted_by, submission.priority, submission.deadline]
    );
    const projectId = projectResult.rows[0].id;

    const deliverables = Array.isArray(submission.deliverables) ? submission.deliverables : [];
    for (const item of deliverables) {
      const { assigneeId, manualAssignee } = await resolveAssignee(client, item);
      const deliverable = await createDeliverableTx(client, {
        projectId,
        submissionId: id,
        name: item.name,
        description: item.description,
        stage: item.stage,
        mainTask: item.mainTask,
        role: item.role,
        assigneeId,
        manualAssignee,
        deadline: item.deadline,
        status: item.status,
        progress: item.progress,
      });
      await createTaskTx(client, {
        projectId,
        deliverableId: deliverable.id,
        createdBy: submission.submitted_by,
        assignedTo: assigneeId,
        manualAssignee,
        role: item.role,
        task: item.mainTask || item.name,
        deadline: item.deadline,
        status: 'Not Started',
      });
    }

    await client.query(
      `UPDATE project_submissions
       SET status = 'Approved', reviewed_by = $1, reviewed_at = NOW(), review_note = $2, updated_at = NOW()
       WHERE id = $3`,
      [reviewedById || null, reviewNote || null, id]
    );

    await client.query('COMMIT');
    return { submission: await findSubmissionById(id), projectId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
