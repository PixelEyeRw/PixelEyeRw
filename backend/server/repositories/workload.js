import { pool } from '../db.js';
import { listAccountManagers } from './users.js';

export async function getWorkload() {
  const [accountManagers, roleResult] = await Promise.all([
    listAccountManagers(),
    pool.query(`
      SELECT role, COUNT(*)::int AS "activeTasks"
      FROM tasks
      WHERE task_type = 'project' AND role IS NOT NULL AND status NOT IN ('Completed', 'complete', 'done', 'Cancelled')
      GROUP BY role ORDER BY role
    `),
  ]);
  return { accountManagers, productionRoles: roleResult.rows };
}
