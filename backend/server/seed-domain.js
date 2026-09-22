import { pool } from './db.js';

const CLIENTS = [
  { name: 'Lumina Tech', am: 'Elena Rossi', health: 'on_track' },
  { name: 'Veridian', am: 'Elena Rossi', health: 'at_risk' },
  { name: 'Acme AI', am: 'Marcus Thorne', health: 'on_track' },
  { name: 'Global Tech', am: 'Jordan Vance', health: 'overdue' },
  { name: 'Vogue Studio', am: 'Jordan Vance', health: 'on_track' },
  { name: 'Solstice Energy', am: 'Marcus Thorne', health: 'at_risk' },
];

const PROJECTS = [
  { title: 'Q4 Brand Refresh', client: 'Lumina Tech', am: 'Elena Rossi', priority: 'MID', status: 'on_track', progress: 62 },
  { title: 'Website Launch', client: 'Veridian', am: 'Elena Rossi', priority: 'HIGH', status: 'at_risk', progress: 40 },
  { title: 'Acme AI Launch', client: 'Acme AI', am: 'Marcus Thorne', priority: 'HIGH', status: 'on_track', progress: 71 },
  { title: 'Global Tech Phase 1', client: 'Global Tech', am: 'Jordan Vance', priority: 'HIGH', status: 'overdue', progress: 28 },
  { title: 'Solstice Pitch Deck', client: 'Solstice Energy', am: 'Marcus Thorne', priority: 'LOW', status: 'on_track', progress: 15 },
];

async function userIdByName(name) {
  const result = await pool.query('SELECT id FROM users WHERE name = $1', [name]);
  return result.rows[0]?.id || null;
}

async function clientIdByName(name) {
  const result = await pool.query('SELECT id FROM clients WHERE name = $1', [name]);
  return result.rows[0]?.id || null;
}

try {
  for (const client of CLIENTS) {
    const accountManagerId = await userIdByName(client.am);
    await pool.query(
      `INSERT INTO clients (name, account_manager_id, health)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET account_manager_id = EXCLUDED.account_manager_id, health = EXCLUDED.health`,
      [client.name, accountManagerId, client.health]
    );
  }

  for (const project of PROJECTS) {
    const clientId = await clientIdByName(project.client);
    const accountManagerId = await userIdByName(project.am);
    if (!clientId) continue;
    const existing = await pool.query('SELECT id FROM projects WHERE title = $1 AND client_id = $2', [project.title, clientId]);
    if (existing.rows[0]) {
      await pool.query(
        `UPDATE projects SET account_manager_id = $1, priority = $2, status = $3, progress = $4, updated_at = NOW() WHERE id = $5`,
        [accountManagerId, project.priority, project.status, project.progress, existing.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO projects (title, client_id, account_manager_id, priority, status, progress)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [project.title, clientId, accountManagerId, project.priority, project.status, project.progress]
      );
    }
  }

  console.log(`Seeded ${CLIENTS.length} clients and ${PROJECTS.length} projects.`);
} catch (error) {
  console.error('Domain seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
