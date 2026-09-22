export async function findUserIdByName(client, name) {
  if (!name) return null;
  const result = await client.query('SELECT id FROM users WHERE name = $1', [name]);
  return result.rows[0]?.id || null;
}

export async function resolveAssignee(client, item) {
  const rawName = item.assignee === 'custom' ? item.customAssignee : item.assignee;
  if (!rawName) return { assigneeId: null, manualAssignee: null };
  const assigneeId = await findUserIdByName(client, rawName);
  return assigneeId ? { assigneeId, manualAssignee: null } : { assigneeId: null, manualAssignee: rawName };
}
