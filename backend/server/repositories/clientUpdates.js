import { pool } from '../db.js';

export async function listClientUpdates(accountManagerId) {
  const result = await pool.query(
    `SELECT c.id, c.id AS "clientId", c.name AS client,
       COALESCE(u.meeting_notes, '') AS "meetingNotes",
       COALESCE(u.client_feedback, '') AS "clientFeedback",
       COALESCE(u.satisfaction_score, 0) AS "satisfactionScore",
       COALESCE(u.next_client_action, '') AS "nextClientAction",
       COALESCE(u.upsell_opportunity, '') AS "upsellOpportunity",
       COALESCE(u.referral_asked, 'No') AS "referralAsked",
       COALESCE(u.notes, '') AS notes
     FROM clients c
     LEFT JOIN client_updates u ON u.client_id = c.id AND u.created_by = $1
     WHERE c.account_manager_id = $1
     ORDER BY c.name`,
    [accountManagerId]
  );
  return result.rows;
}

export async function saveClientUpdates(accountManagerId, rows = []) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      await client.query(
        `INSERT INTO client_updates
          (client_id, created_by, summary, meeting_notes, client_feedback, satisfaction_score, next_client_action, upsell_opportunity, referral_asked, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (created_by, client_id) WHERE client_id IS NOT NULL
         DO UPDATE SET summary = EXCLUDED.summary, meeting_notes = EXCLUDED.meeting_notes,
           client_feedback = EXCLUDED.client_feedback, satisfaction_score = EXCLUDED.satisfaction_score,
           next_client_action = EXCLUDED.next_client_action, upsell_opportunity = EXCLUDED.upsell_opportunity,
           referral_asked = EXCLUDED.referral_asked, notes = EXCLUDED.notes, updated_at = NOW()`,
        [row.clientId || row.id, accountManagerId, row.clientFeedback || row.meetingNotes || '', row.meetingNotes || '', row.clientFeedback || '', row.satisfactionScore || 0, row.nextClientAction || '', row.upsellOpportunity || '', row.referralAsked || 'No', row.notes || '']
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return listClientUpdates(accountManagerId);
}
