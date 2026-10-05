process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'pixeleye-api-test-secret';

import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';

let app;
let pool;
let server;
let baseUrl;
let accountManager;
let otherManager;
let operations;
let ownedProjectId;
let foreignProjectId;
let ownedClientId;
let foreignClientId;
let intakeId;
let dailyTaskId;

async function createUser(name, role) {
  const email = `${name.toLowerCase().replaceAll(' ', '.')}.${Date.now()}@test.local`;
  const passwordHash = await bcrypt.hash('test-password', 4);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id, email`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
}

async function login(email) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'test-password' }),
  });
  const body = await response.json();
  return { response, body, cookie: (response.headers.get('set-cookie') || '').split(';')[0] };
}

function cookieHeaders(cookie) {
  return { Cookie: cookie, 'Content-Type': 'application/json' };
}

before(async () => {
  const backend = await import('../index.js');
  const database = await import('../db.js');
  app = backend.app;
  pool = database.pool;

  accountManager = await createUser('Integration AM', 'Account Manager');
  otherManager = await createUser('Other AM', 'Account Manager');
  operations = await createUser('Integration OM', 'Operations Manager');

  const ownedClient = await pool.query(
    'INSERT INTO clients (name, account_manager_id) VALUES ($1, $2) RETURNING id',
    [`Integration Client ${Date.now()}`, accountManager.id]
  );
  ownedClientId = ownedClient.rows[0].id;
  const foreignClient = await pool.query(
    'INSERT INTO clients (name, account_manager_id) VALUES ($1, $2) RETURNING id',
    [`Foreign Client ${Date.now()}`, otherManager.id]
  );
  foreignClientId = foreignClient.rows[0].id;
  const ownedProject = await pool.query(
    'INSERT INTO projects (title, client_id, account_manager_id) VALUES ($1, $2, $3) RETURNING id',
    ['Integration Owned Project', ownedClientId, accountManager.id]
  );
  ownedProjectId = ownedProject.rows[0].id;
  const foreignProject = await pool.query(
    'INSERT INTO projects (title, client_id, account_manager_id) VALUES ($1, $2, $3) RETURNING id',
    ['Integration Foreign Project', foreignClientId, otherManager.id]
  );
  foreignProjectId = foreignProject.rows[0].id;

  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (pool) {
    if (intakeId) await pool.query('DELETE FROM intakes WHERE id = $1', [intakeId]);
    if (dailyTaskId) await pool.query('DELETE FROM tasks WHERE id = $1', [dailyTaskId]);
    if (ownedProjectId || foreignProjectId) {
      await pool.query('DELETE FROM projects WHERE id = ANY($1::uuid[])', [[ownedProjectId, foreignProjectId].filter(Boolean)]);
    }
    if (ownedClientId || foreignClientId) {
      await pool.query('DELETE FROM clients WHERE id = ANY($1::uuid[])', [[ownedClientId, foreignClientId].filter(Boolean)]);
    }
    const userIds = [accountManager?.id, otherManager?.id, operations?.id].filter(Boolean);
    if (userIds.length) await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [userIds]);
    await pool.end();
  }
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('JWT sessions enforce identity, role access, and intake persistence', async () => {
  const anonymousResponse = await fetch(`${baseUrl}/api/om/projects`);
  assert.equal(anonymousResponse.status, 401);

  const amSession = await login(accountManager.email);
  const omSession = await login(operations.email);
  assert.equal(amSession.response.status, 200);
  assert.equal(omSession.response.status, 200);
  assert.ok(amSession.cookie);
  assert.match(amSession.response.headers.get('set-cookie'), /HttpOnly/i);
  assert.equal('token' in amSession.body, false);

  const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, { headers: cookieHeaders(amSession.cookie) });
  assert.equal(sessionResponse.status, 200);
  assert.equal((await sessionResponse.json()).id, accountManager.id);

  const projectResponse = await fetch(`${baseUrl}/api/om/projects?accountManagerId=${otherManager.id}`, {
    headers: cookieHeaders(amSession.cookie),
  });
  const projects = await projectResponse.json();
  assert.equal(projectResponse.status, 200);
  assert.deepEqual(projects.map((project) => project.id), [ownedProjectId]);

  const foreignProjectResponse = await fetch(`${baseUrl}/api/om/projects/${foreignProjectId}`, {
    headers: cookieHeaders(amSession.cookie),
  });
  assert.equal(foreignProjectResponse.status, 404);

  const workloadResponse = await fetch(`${baseUrl}/api/om/workload`, { headers: cookieHeaders(amSession.cookie) });
  assert.equal(workloadResponse.status, 403);

  const dailyTaskResponse = await fetch(`${baseUrl}/api/daily-tasks`, {
    method: 'POST',
    headers: cookieHeaders(amSession.cookie),
    body: JSON.stringify({
      employeeId: otherManager.id,
      task: 'Identity source test',
      projectId: ownedProjectId,
      role: 'Personal',
      assignmentType: 'personal',
    }),
  });
  const dailyTask = await dailyTaskResponse.json();
  dailyTaskId = dailyTask.id;
  assert.equal(dailyTaskResponse.status, 201);
  assert.equal(dailyTask.employeeId, accountManager.id);

  const intakeResponse = await fetch(`${baseUrl}/api/om/intakes`, {
    method: 'POST',
    headers: cookieHeaders(omSession.cookie),
    body: JSON.stringify({ client: 'Integration Intake Client', projectName: `API test ${Date.now()}`, priority: 'high', notes: 'test' }),
  });
  const intake = await intakeResponse.json();
  intakeId = intake.id;
  assert.equal(intakeResponse.status, 201);

  const roleResponse = await fetch(`${baseUrl}/api/om/roles`, { headers: cookieHeaders(omSession.cookie) });
  assert.equal(roleResponse.status, 200);
  assert.ok((await roleResponse.json()).some((role) => role.name === 'Account Manager'));

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: cookieHeaders(amSession.cookie),
  });
  assert.equal(logoutResponse.status, 200);
  const revokedSessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
    headers: cookieHeaders(amSession.cookie),
  });
  assert.equal(revokedSessionResponse.status, 401);
});
