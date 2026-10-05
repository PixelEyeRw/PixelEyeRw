import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { pool } from './db.js';
import {
  amKpiFlags,
  amProjectList,
  amTaskProgress,
  amClientUpdates,
  ams,
  profile,
  projectDeliverables,
  taskBoard,
  invites,
  intakes,
  createId,
} from './data.js';
import { createUser, findUserByEmail, findUserById, listUsers, listAccountManagers, listSystemRoles, updateUserRole, getUserProfile, updateUserProfile, toPublicUser } from './repositories/users.js';
import { listClients, findClientById, findClientByName, createClient } from './repositories/clients.js';
import { listProjects, listAMProjects, findProjectById, createProject, updateProject, updateAMProjects } from './repositories/projects.js';
import { listSubmissions, findSubmissionById, createSubmission, updateSubmissionStatus, approveSubmission } from './repositories/submissions.js';
import { listDeliverablesByProject } from './repositories/deliverables.js';
import { listAMTaskProgress, updateAMTaskProgress, listTaskBoard, updateTaskBoard, listDailyTasks, createDailyTask, updateDailyTask, deleteDailyTask } from './repositories/tasks.js';
import { listClientUpdates, saveClientUpdates } from './repositories/clientUpdates.js';
import { getKpiFlags, saveKpiFlags } from './repositories/kpiFlags.js';
import { listReports, createReport, getReportSummary } from './repositories/reports.js';
import { listCalendarItems } from './repositories/calendar.js';
import { getWorkload } from './repositories/workload.js';
import { createInvite, listInvites, verifyInvite, createInvitedUser } from './repositories/invites.js';
import { listIntakes, createIntake, updateIntakeStatus } from './repositories/intakes.js';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'pixeleye-insecure-development-secret');
const isOperationsRole = (role) => ['Operations Manager', 'Director'].includes(role);
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api',
};

if (!JWT_SECRET) throw new Error('JWT_SECRET must be configured in production');

app.use(cors());
app.use(express.json());

// ============================================================================
// HEALTH & INFO
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'pixeleye-backend', timestamp: new Date().toISOString() });
});

app.use('/api', async (req, res, next) => {
  const publicRoute = req.path === '/auth/login'
    || req.path === '/auth/signup'
    || (req.method === 'GET' && req.path.startsWith('/invites/verify/'));
  if (publicRoute) return next();

  const sessionCookie = req.headers.cookie?.split(';').map((value) => value.trim()).find((value) => value.startsWith('pixeleye_session='));
  const token = sessionCookie ? decodeURIComponent(sessionCookie.slice('pixeleye_session='.length)) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  let claims;
  try {
    claims = jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
    return;
  }

  try {
    const activeSession = await pool.query(
      `SELECT 1 FROM auth_sessions
       WHERE token_id = $1 AND user_id = $2 AND revoked_at IS NULL AND expires_at > NOW()`,
      [claims.jti, claims.sub]
    );
    if (!activeSession.rowCount) return res.status(401).json({ message: 'Session has expired or been revoked' });
    req.user = { id: claims.sub, role: claims.role, sessionId: claims.jti };
    const isOperations = isOperationsRole(req.user.role);
    if (req.path.startsWith('/invites') && !isOperations) return res.status(403).json({ message: 'Operations role required' });
    if (req.path.startsWith('/om/') && req.method !== 'GET' && !isOperations) return res.status(403).json({ message: 'Operations role required' });
    if (req.path.startsWith('/am/') && req.user.role === 'Production') return res.status(403).json({ message: 'Role is not allowed to access this resource' });
    if (req.path.startsWith('/am/project-submissions') && req.method === 'POST' && req.user.role !== 'Account Manager') return res.status(403).json({ message: 'Account Manager role required' });
    if (req.path.startsWith('/am/project-submissions') && req.method === 'PUT' && !isOperations) return res.status(403).json({ message: 'Operations role required' });
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AUTHENTICATION
// ============================================================================

app.get('/api/accounts', async (req, res, next) => {
  try {
    if (!isOperationsRole(req.user.role)) return res.status(403).json({ message: 'Operations role required' });
    const users = await listUsers();
    res.json(users.map(toPublicUser));
  } catch (error) {
    next(error);
  }
});

app.put('/api/accounts/:id/role', async (req, res, next) => {
  try {
    if (req.user.role !== 'Director') return res.status(403).json({ message: 'Director role required' });
    const validRoles = ['Operations Manager', 'Account Manager', 'Production', 'Director'];
    if (!validRoles.includes(req.body?.role)) return res.status(400).json({ message: 'A valid system role is required' });
    const updated = await updateUserRole(req.params.id, req.body.role);
    if (!updated) return res.status(404).json({ message: 'User not found' });
    if (req.params.id === req.user.id) res.clearCookie('pixeleye_session', sessionCookieOptions);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const publicUser = toPublicUser(user);
    const tokenId = randomUUID();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const token = jwt.sign({ role: user.role }, JWT_SECRET, { subject: user.id, jwtid: tokenId, expiresIn: '8h' });
    await pool.query(
      'INSERT INTO auth_sessions (user_id, token_id, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenId, expiresAt]
    );
    res.cookie('pixeleye_session', token, { ...sessionCookieOptions, maxAge: 8 * 60 * 60 * 1000 });
    res.json({ user: publicUser });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/session', async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Session user no longer exists' });
    res.json(toPublicUser(user));
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', async (req, res, next) => {
  try {
    await pool.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE token_id = $1 AND revoked_at IS NULL', [req.user.sessionId]);
    res.clearCookie('pixeleye_session', sessionCookieOptions);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { email, password, name, inviteToken } = req.body || {};
    if (!email || !password || !name || !inviteToken) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Account already exists' });
    }
    const invitation = await verifyInvite(inviteToken);
    if (!invitation || invitation.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ message: 'Invitation is invalid or expired' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createInvitedUser({ token: inviteToken, name, email, passwordHash });
    if (!newUser) return res.status(400).json({ message: 'Invitation is invalid, expired, or already used' });
    res.status(201).json(toPublicUser(newUser));
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Account already exists' });
    next(error);
  }
});

app.get('/api/invites/verify/:token', async (req, res, next) => {
  try {
    const invite = await verifyInvite(req.params.token);
    if (!invite) return res.status(404).json({ message: 'Invitation is invalid or expired' });
    res.json(invite);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PROFILE
// ============================================================================

app.get('/api/profile', async (req, res, next) => {
  try {
    const userProfile = await getUserProfile(req.user.id);
    if (!userProfile) return res.status(404).json({ message: 'Profile not found' });
    res.json(userProfile);
  } catch (error) {
    next(error);
  }
});

app.put('/api/profile', async (req, res, next) => {
  try {
    const { name, title, phone, bio, avatar } = req.body || {};
    const updated = await updateUserProfile(req.user.id, { name, title, phone, bio, avatar });
    if (!updated) return res.status(404).json({ message: 'Profile not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OM: ACCOUNT MANAGERS
// ============================================================================

app.get('/api/om/account-managers', async (req, res, next) => {
  try {
    res.json(await listAccountManagers());
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/roles', async (req, res, next) => {
  try {
    if (!isOperationsRole(req.user.role)) return res.status(403).json({ message: 'Operations role required' });
    res.json(await listSystemRoles());
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/account-managers/:id', async (req, res, next) => {
  try {
    const am = await findUserById(req.params.id);
    if (!am || am.role !== 'Account Manager') return res.status(404).json({ message: 'Account Manager not found' });
    res.json(toPublicUser(am));
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OM: CLIENTS
// ============================================================================

app.get('/api/om/clients', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : null;
    const assignedUserId = req.user.role === 'Production' ? req.user.id : null;
    res.json(await listClients(accountManagerId, assignedUserId));
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/clients/:id', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : null;
    const assignedUserId = req.user.role === 'Production' ? req.user.id : null;
    const client = await findClientById(req.params.id, accountManagerId, assignedUserId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    next(error);
  }
});

app.post('/api/om/clients', async (req, res, next) => {
  try {
    const { name, accountManagerId, health } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Client name is required' });
    const existing = await findClientByName(name);
    if (existing) return res.status(409).json({ message: 'Client already exists' });
    const newClient = await createClient({ name, accountManagerId, health });
    res.status(201).json(newClient);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OM: PROJECTS
// ============================================================================

app.get('/api/om/projects', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : null;
    const assignedUserId = req.user.role === 'Production' ? req.user.id : null;
    res.json(await listProjects(accountManagerId, assignedUserId));
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/projects/:id', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : null;
    const assignedUserId = req.user.role === 'Production' ? req.user.id : null;
    const project = await findProjectById(req.params.id, accountManagerId, assignedUserId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/projects/:id/deliverables', async (req, res, next) => {
  try {
    if (['Account Manager', 'Production'].includes(req.user.role)) {
      const project = req.user.role === 'Account Manager'
        ? await findProjectById(req.params.id, req.user.id)
        : await findProjectById(req.params.id, null, req.user.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
    }
    const rows = await listDeliverablesByProject(req.params.id);
    if (rows.length) return res.json(rows);
    res.json(projectDeliverables[req.params.id] || []);
  } catch (error) {
    next(error);
  }
});

app.post('/api/om/projects', async (req, res, next) => {
  try {
    const { title, clientId, clientName, accountManagerId, priority, status, progress, startDate, targetDeadline } = req.body || {};
    if (!title) return res.status(400).json({ message: 'Project title is required' });
    let resolvedClientId = clientId;
    if (!resolvedClientId && clientName) {
      const client = await findClientByName(clientName);
      if (!client) return res.status(400).json({ message: 'Client not found' });
      resolvedClientId = client.id;
    }
    if (!resolvedClientId) return res.status(400).json({ message: 'clientId or clientName is required' });
    const newProject = await createProject({ title, clientId: resolvedClientId, accountManagerId, priority, status, progress, startDate, targetDeadline });
    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
});

app.put('/api/om/projects/:id', async (req, res, next) => {
  try {
    if (req.body?.accountManagerId) {
      const newOwner = await findUserById(req.body.accountManagerId);
      if (!newOwner || newOwner.role !== 'Account Manager') {
        return res.status(400).json({ message: 'Project owner must be an Account Manager' });
      }
    }
    const updated = await updateProject(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OM: TASK BOARD (Daily Tasks)
// ============================================================================

app.get('/api/om/tasks', async (req, res, next) => {
  try {
    res.json(await listTaskBoard({ userId: req.user.id, isOperations: isOperationsRole(req.user.role) }));
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/tasks/:id', async (req, res, next) => {
  try {
    const task = (await listTaskBoard({ userId: req.user.id, isOperations: isOperationsRole(req.user.role) })).find((row) => row.id === req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

app.post('/api/om/tasks', (req, res) => {
  res.status(501).json({ message: 'Create project tasks through approved project submissions' });
});

app.put('/api/om/tasks', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Expected an array of task rows' });
    if (!isOperationsRole(req.user.role)) return res.status(403).json({ message: 'Operations role required' });
    res.json(await updateTaskBoard(req.body));
  } catch (error) {
    next(error);
  }
});

app.put('/api/om/tasks/:id', async (req, res, next) => {
  try {
    if (!isOperationsRole(req.user.role)) return res.status(403).json({ message: 'Operations role required' });
    await updateTaskBoard([{ ...req.body, id: req.params.id }]);
    const task = (await listTaskBoard({ isOperations: true })).find((row) => row.id === req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/om/tasks/:id', async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND task_type = 'project' RETURNING id", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Task not found' });
    res.json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
});

app.get('/api/daily-tasks', async (req, res, next) => {
  try {
    res.json(await listDailyTasks(req.user.id, isOperationsRole(req.user.role)));
  } catch (error) {
    next(error);
  }
});

app.post('/api/daily-tasks', async (req, res, next) => {
  try {
    const { task, projectId, role, assignedTo, assignmentType } = req.body || {};
    if (!task?.trim() || !projectId) return res.status(400).json({ message: 'task and projectId are required' });
    const project = req.user.role === 'Account Manager'
      ? await findProjectById(projectId, req.user.id)
      : req.user.role === 'Production'
        ? await findProjectById(projectId, null, req.user.id)
        : await findProjectById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found or not accessible' });
    let assignedToId = null;
    let manualAssignee = null;
    if (assignmentType !== 'personal') {
      if (!role || !assignedTo?.trim()) return res.status(400).json({ message: 'Role and assigned person are required for assigned tasks' });
      const user = (await listUsers()).find((row) => row.name === assignedTo.trim());
      assignedToId = user?.id || null;
      manualAssignee = user ? null : assignedTo.trim();
    }
    const newTask = await createDailyTask({
      employeeId: req.user.id,
      task: task.trim(),
      projectId,
      role: assignmentType === 'personal' ? 'Personal' : role,
      assignedToId,
      manualAssignee,
      assignmentType: assignmentType === 'personal' ? 'personal' : 'assigned',
    });
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

app.put('/api/daily-tasks/:id', async (req, res, next) => {
  try {
    const task = await updateDailyTask(req.params.id, req.user.id, req.body || {}, isOperationsRole(req.user.role));
    if (!task) return res.status(404).json({ message: 'Daily task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/daily-tasks/:id', async (req, res, next) => {
  try {
    const deleted = await deleteDailyTask(req.params.id, req.user.id, isOperationsRole(req.user.role));
    if (!deleted) return res.status(404).json({ message: 'Daily task not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/reports', async (req, res, next) => {
  try {
    res.json(await listReports(req.user.id, isOperationsRole(req.user.role)));
  } catch (error) {
    next(error);
  }
});

app.post('/api/reports', async (req, res, next) => {
  try {
    const { type, projectId, message, attachments } = req.body || {};
    if (!['general', 'project'].includes(type) || !message?.trim()) {
      return res.status(400).json({ message: 'valid report type and message are required' });
    }
    if (type === 'project' && !projectId) return res.status(400).json({ message: 'projectId is required for project reports' });
    if (type === 'project' && req.user.role === 'Account Manager' && !(await findProjectById(projectId, req.user.id))) {
      return res.status(404).json({ message: 'Project not found or not accessible' });
    }
    if (type === 'project' && req.user.role === 'Production' && !(await findProjectById(projectId, null, req.user.id))) {
      return res.status(404).json({ message: 'Project not found or not accessible' });
    }
    const id = await createReport({ authorId: req.user.id, type, projectId, message: message.trim(), attachments });
    const rows = await listReports(req.user.id, false);
    res.status(201).json(rows.find((report) => report.id === id));
  } catch (error) {
    next(error);
  }
});

app.get('/api/reports/summary', async (req, res, next) => {
  try {
    res.json(await getReportSummary(req.user.id, isOperationsRole(req.user.role)));
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/calendar', async (req, res, next) => {
  try {
    const month = req.query.month;
    if (!/^\d{4}-\d{2}$/.test(month || '')) return res.status(400).json({ message: 'month must use YYYY-MM format' });
    if (req.user.role === 'Production') return res.status(403).json({ message: 'Role is not allowed to access this resource' });
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
    res.json(await listCalendarItems({ month, accountManagerId }));
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/workload', async (req, res, next) => {
  try {
    if (!isOperationsRole(req.user.role)) return res.status(403).json({ message: 'Operations role required' });
    res.json(await getWorkload());
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OM: INTAKES
// ============================================================================

app.get('/api/om/intakes', (req, res) => {
  if (!isOperationsRole(req.user.role)) return res.status(403).json({ message: 'Operations role required' });
  listIntakes().then((rows) => res.json(rows)).catch((error) => res.status(500).json({ message: error.message }));
});

app.post('/api/om/intakes', async (req, res, next) => {
  try {
    const { client, projectName, priority, notes, requestedDeadline } = req.body || {};
    if (!client?.trim() || !projectName?.trim()) return res.status(400).json({ message: 'Client and project name are required' });
    const intake = await createIntake({ createdBy: req.user.id, client: client.trim(), projectName: projectName.trim(), priority, notes, requestedDeadline });
    res.status(201).json(intake);
  } catch (error) {
    next(error);
  }
});

app.put('/api/om/intakes/:id', async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    const updated = await updateIntakeStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ message: 'Intake not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AM: PROJECT LIST
// ============================================================================

app.get('/api/am/project-list', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
    res.json(await listAMProjects(accountManagerId));
  } catch (error) {
    next(error);
  }
});

app.get('/api/am/project-list/:id', (req, res, next) => {
  const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
  listAMProjects(accountManagerId).then((rows) => {
    const project = rows.find((row) => row.id === req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  }).catch(next);
});

app.post('/api/am/project-list', (req, res) => {
  res.status(405).json({ message: 'Create projects through the approved submission workflow' });
});

app.put('/api/am/project-list/:id', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
    const fields = req.body || {};
    const updated = await updateProject(req.params.id, {
      ...fields,
      status: fields.overallStatus ?? fields.status,
    }, accountManagerId);
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    const rows = await listAMProjects(accountManagerId);
    res.json(rows.find((row) => row.id === req.params.id));
  } catch (error) {
    next(error);
  }
});

app.put('/api/am/project-list', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Expected an array of project rows' });
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
    await updateAMProjects(req.body, accountManagerId);
    res.json(await listAMProjects(accountManagerId));
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AM: TASK PROGRESS
// ============================================================================

app.get('/api/am/task-progress', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
    res.json(await listAMTaskProgress(accountManagerId));
  } catch (error) {
    next(error);
  }
});

app.get('/api/am/task-progress/:id', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
    const task = (await listAMTaskProgress(accountManagerId)).find((row) => row.id === req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

app.post('/api/am/task-progress', (req, res) => {
  res.status(405).json({ message: 'Create tasks through approved project submissions' });
});

app.put('/api/am/task-progress/:id', async (req, res, next) => {
  try {
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
    const rows = await listAMTaskProgress(accountManagerId);
    const current = rows.find((row) => row.id === req.params.id);
    if (!current) return res.status(404).json({ message: 'Task not found' });
    await updateAMTaskProgress([{ ...current, ...req.body, id: current.id }], accountManagerId);
    const updated = (await listAMTaskProgress(accountManagerId)).find((row) => row.id === current.id);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.put('/api/am/task-progress', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Expected an array of task rows' });
    const accountManagerId = req.user.role === 'Account Manager' ? req.user.id : undefined;
    await updateAMTaskProgress(req.body, accountManagerId);
    res.json(await listAMTaskProgress(accountManagerId));
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AM: CLIENT UPDATES
// ============================================================================

app.get('/api/am/client-updates', async (req, res, next) => {
  try {
    res.json(await listClientUpdates(req.user.id));
  } catch (error) {
    next(error);
  }
});

app.post('/api/am/client-updates', (req, res) => {
  res.status(405).json({ message: 'Use the client-updates collection endpoint' });
});

app.put('/api/am/client-updates/:id', (req, res) => {
  res.status(405).json({ message: 'Use the client-updates collection endpoint' });
});

app.put('/api/am/client-updates', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Expected an array of rows' });
    const ownedClients = new Set((await listClientUpdates(req.user.id)).map((row) => row.id));
    if (req.body.some((row) => !ownedClients.has(row.clientId || row.id))) {
      return res.status(403).json({ message: 'One or more clients are not assigned to this account manager' });
    }
    res.json(await saveClientUpdates(req.user.id, req.body));
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AM: KPI FLAGS
// ============================================================================

app.get('/api/am/kpi-flags', async (req, res, next) => {
  try {
    res.json(await getKpiFlags(req.user.id));
  } catch (error) {
    next(error);
  }
});

app.put('/api/am/kpi-flags', async (req, res, next) => {
  try {
    res.json(await saveKpiFlags(req.user.id, req.body || {}));
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// AM: PROJECT SUBMISSIONS
// ============================================================================

app.get('/api/am/project-submissions', async (req, res, next) => {
  try {
    const submittedById = req.user.role === 'Account Manager' ? req.user.id : undefined;
    res.json(await listSubmissions(submittedById));
  } catch (error) {
    next(error);
  }
});

app.get('/api/am/project-submissions/:id', async (req, res, next) => {
  try {
    const submittedById = req.user.role === 'Account Manager' ? req.user.id : undefined;
    const submission = await findSubmissionById(req.params.id, submittedById);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    next(error);
  }
});

app.post('/api/am/project-submissions', async (req, res, next) => {
  try {
    const { client, clientId, project, description, objective, priority, deadline, attachmentName, comment, deliverables } = req.body || {};
    if (!project || !objective || !description) {
      return res.status(400).json({ message: 'project, objective, and description are required' });
    }
    let resolvedClientId = clientId;
    if (!resolvedClientId && client) {
      const clientRow = await findClientByName(client);
      if (!clientRow) return res.status(400).json({ message: `Client "${client}" not found` });
      resolvedClientId = clientRow.id;
    }
    if (!resolvedClientId) {
      return res.status(400).json({ message: 'A valid client is required' });
    }
    if (req.user.role === 'Account Manager' && !(await findClientById(resolvedClientId, req.user.id))) {
      return res.status(404).json({ message: 'Client not found or not assigned to this account manager' });
    }
    const newSubmission = await createSubmission({
      clientId: resolvedClientId,
      submittedById: req.user.id,
      projectName: project,
      description,
      objective,
      priority,
      deadline,
      attachmentName,
      comment,
      deliverables,
    });
    res.status(201).json(newSubmission);
  } catch (error) {
    next(error);
  }
});

app.put('/api/am/project-submissions/:id', async (req, res, next) => {
  try {
    const { status, reviewNote } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    const resolvedReviewedById = req.user.id;
    if (status === 'Approved') {
      let result;
      try {
        result = await approveSubmission(req.params.id, { reviewedById: resolvedReviewedById, reviewNote });
      } catch (error) {
        if (error.message.startsWith('Submission is already')) {
          return res.status(409).json({ message: error.message });
        }
        throw error;
      }
      if (!result) return res.status(404).json({ message: 'Submission not found' });
      return res.json(result.submission);
    }
    const updated = await updateSubmissionStatus(req.params.id, { status, reviewedById: resolvedReviewedById, reviewNote });
    if (!updated) return res.status(404).json({ message: 'Submission not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// INVITES
// ============================================================================

app.get('/api/invites', async (req, res, next) => {
  try {
    res.json(await listInvites(req.user.id));
  } catch (error) {
    next(error);
  }
});

app.post('/api/invites', async (req, res, next) => {
  try {
    const { email, role } = req.body || {};
    const validRoles = ['Operations Manager', 'Account Manager', 'Production', 'Director'];
    if (!email || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'email and valid role are required' });
    }
    const invite = await createInvite({ email: email.trim().toLowerCase(), role, createdBy: req.user.id });
    res.status(201).json(invite);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`PixelEye backend running on http://localhost:${PORT}`);
  });
}

export { app };
