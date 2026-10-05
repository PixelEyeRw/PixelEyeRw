import { pool } from '../db.js';

const DEFAULT_FLAGS = {
  paymentReceived: false,
  projectDelivered: false,
  relationshipMaintained: false,
};

export async function getKpiFlags(userId) {
  const result = await pool.query(
    `SELECT payment_received AS "paymentReceived", project_delivered AS "projectDelivered",
       relationship_maintained AS "relationshipMaintained"
     FROM am_kpi_flags WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || DEFAULT_FLAGS;
}

export async function saveKpiFlags(userId, flags) {
  const result = await pool.query(
    `INSERT INTO am_kpi_flags (user_id, payment_received, project_delivered, relationship_maintained)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET payment_received = EXCLUDED.payment_received,
       project_delivered = EXCLUDED.project_delivered, relationship_maintained = EXCLUDED.relationship_maintained,
       updated_at = NOW()
     RETURNING payment_received AS "paymentReceived", project_delivered AS "projectDelivered",
       relationship_maintained AS "relationshipMaintained"`,
    [userId, Boolean(flags.paymentReceived), Boolean(flags.projectDelivered), Boolean(flags.relationshipMaintained)]
  );
  return result.rows[0];
}
