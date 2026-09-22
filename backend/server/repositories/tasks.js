export async function createTaskTx(client, { projectId, deliverableId, createdBy, assignedTo, manualAssignee, role, task, deadline, status, priority }) {
  const assignmentType = assignedTo || manualAssignee ? 'assigned' : 'personal';
  const result = await client.query(
    `INSERT INTO tasks (project_id, deliverable_id, created_by, assigned_to, manual_assignee, assignment_type, role, task, status, priority, deadline)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'in-progress'), $10, $11)
     RETURNING *`,
    [projectId, deliverableId, createdBy, assignedTo, manualAssignee, assignmentType, role || null, task, status ?? null, priority || null, deadline || null]
  );
  return result.rows[0];
}
