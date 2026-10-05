import { createHash, randomBytes } from 'node:crypto';
import { pool } from '../db.js';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export async function createInvite({ email, role, createdBy }) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const result = await pool.query(
    `INSERT INTO invites (email, role, token_hash, expires_at, created_by)
     VALUES ($1, $2, $3, NOW() + INTERVAL '7 days', $4)
     RETURNING id, email, role, expires_at AS "expiresAt", created_at AS "createdAt"`,
    [email, role, tokenHash, createdBy]
  );
  return { ...result.rows[0], status: 'Pending', token };
}

export async function listInvites(createdBy) {
  const result = await pool.query(
    `SELECT id, email, role, expires_at AS "expiresAt", accepted_at AS "acceptedAt",
       created_at AS "createdAt",
       CASE WHEN accepted_at IS NOT NULL THEN 'Accepted'
         WHEN expires_at <= NOW() THEN 'Expired' ELSE 'Pending' END AS status
     FROM invites WHERE ($1::uuid IS NULL OR created_by = $1)
     ORDER BY created_at DESC`,
    [createdBy || null]
  );
  return result.rows;
}

export async function verifyInvite(token) {
  const result = await pool.query(
    `SELECT email, role, expires_at AS "expiresAt" FROM invites
     WHERE token_hash = $1 AND accepted_at IS NULL AND expires_at > NOW()`,
    [hashToken(token)]
  );
  return result.rows[0] || null;
}

export async function createInvitedUser({ token, name, email, passwordHash }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inviteResult = await client.query(
      `SELECT id, email, role FROM invites
       WHERE token_hash = $1 AND accepted_at IS NULL AND expires_at > NOW()
       FOR UPDATE`,
      [hashToken(token)]
    );
    const invite = inviteResult.rows[0];
    if (!invite || invite.email.toLowerCase() !== email.toLowerCase()) {
      await client.query('ROLLBACK');
      return null;
    }
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, invite.email, passwordHash, invite.role]
    );
    await client.query('UPDATE invites SET accepted_at = NOW() WHERE id = $1', [invite.id]);
    await client.query('COMMIT');
    return userResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
