import { pool } from '../db.js';

export async function listCalendarItems({ month, accountManagerId }) {
  const monthStart = `${month}-01`;
  const result = await pool.query(
    `SELECT id, date, title, am FROM (
       SELECT p.id::text AS id, to_char(p.target_deadline, 'YYYY-MM-DD') AS date,
         p.title || ' project deadline' AS title, u.name AS am
       FROM projects p LEFT JOIN users u ON u.id = p.account_manager_id
       WHERE p.target_deadline >= $1::date AND p.target_deadline < ($1::date + INTERVAL '1 month')
         AND ($2::uuid IS NULL OR p.account_manager_id = $2)
       UNION ALL
       SELECT d.id::text AS id, to_char(d.deadline, 'YYYY-MM-DD') AS date,
         d.name AS title, u.name AS am
       FROM deliverables d JOIN projects p ON p.id = d.project_id
       LEFT JOIN users u ON u.id = p.account_manager_id
       WHERE d.deadline >= $1::date AND d.deadline < ($1::date + INTERVAL '1 month')
         AND ($2::uuid IS NULL OR p.account_manager_id = $2)
     ) deadlines ORDER BY date, title`,
    [monthStart, accountManagerId || null]
  );
  return result.rows;
}
