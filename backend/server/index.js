import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
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
import { createUser, findUserByEmail, listUsers, toPublicUser } from './repositories/users.js';
import { listClients, findClientById, findClientByName, createClient } from './repositories/clients.js';
import { listProjects, findProjectById, createProject, updateProject } from './repositories/projects.js';
import { listSubmissions, findSubmissionById, createSubmission, updateSubmissionStatus, approveSubmission } from './repositories/submissions.js';
import { listDeliverablesByProject } from './repositories/deliverables.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ============================================================================
// HEALTH & INFO
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'pixeleye-backend', timestamp: new Date().toISOString() });
});

// ============================================================================
// AUTHENTICATION
// ============================================================================

app.get('/api/accounts', async (req, res, next) => {
  try {
    const users = await listUsers();
    res.json(users.map(toPublicUser));
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
    res.json(toPublicUser(user));
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const validRoles = ['Operations Manager', 'Account Manager', 'Production', 'Director'];
    const resolvedRole = validRoles.includes(role) ? role : 'Production';
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Account already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser({ name, email, passwordHash, role: resolvedRole, title: role && !validRoles.includes(role) ? role : undefined });
    res.status(201).json(toPublicUser(newUser));
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PROFILE
// ============================================================================

app.get('/api/profile', (req, res) => {
  res.json(profile);
});

app.put('/api/profile', (req, res) => {
  Object.assign(profile, req.body);
  res.json(profile);
});

// ============================================================================
// OM: ACCOUNT MANAGERS
// ============================================================================

app.get('/api/om/account-managers', (req, res) => {
  res.json(ams);
});

app.get('/api/om/account-managers/:id', (req, res) => {
  const am = ams.find((a) => a.id === req.params.id);
  if (!am) return res.status(404).json({ message: 'Account Manager not found' });
  res.json(am);
});

// ============================================================================
// OM: CLIENTS
// ============================================================================

app.get('/api/om/clients', async (req, res, next) => {
  try {
    res.json(await listClients());
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/clients/:id', async (req, res, next) => {
  try {
    const client = await findClientById(req.params.id);
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
    res.json(await listProjects());
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/projects/:id', async (req, res, next) => {
  try {
    const project = await findProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
});

app.get('/api/om/projects/:id/deliverables', async (req, res, next) => {
  try {
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

app.get('/api/om/tasks', (req, res) => {
  res.json(taskBoard);
});

app.get('/api/om/tasks/:id', (req, res) => {
  const task = taskBoard.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

app.post('/api/om/tasks', (req, res) => {
  const newTask = {
    id: createId('task'),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  taskBoard.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/om/tasks/:id', (req, res) => {
  const index = taskBoard.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Task not found' });
  taskBoard[index] = { ...taskBoard[index], ...req.body };
  res.json(taskBoard[index]);
});

app.delete('/api/om/tasks/:id', (req, res) => {
  const index = taskBoard.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Task not found' });
  const [deleted] = taskBoard.splice(index, 1);
  res.json(deleted);
});

// ============================================================================
// OM: INTAKES
// ============================================================================

app.get('/api/om/intakes', (req, res) => {
  res.json(intakes);
});

app.post('/api/om/intakes', (req, res) => {
  const newIntake = {
    id: createId('intake'),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  intakes.push(newIntake);
  res.status(201).json(newIntake);
});

app.put('/api/om/intakes/:id', (req, res) => {
  const index = intakes.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Intake not found' });
  intakes[index] = { ...intakes[index], ...req.body };
  res.json(intakes[index]);
});

// ============================================================================
// AM: PROJECT LIST
// ============================================================================

app.get('/api/am/project-list', (req, res) => {
  res.json(amProjectList);
});

app.get('/api/am/project-list/:id', (req, res) => {
  const project = amProjectList.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
});

app.post('/api/am/project-list', (req, res) => {
  const newProject = {
    id: createId('amproject'),
    ...req.body,
  };
  amProjectList.push(newProject);
  res.status(201).json(newProject);
});

app.put('/api/am/project-list/:id', (req, res) => {
  const index = amProjectList.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Project not found' });
  amProjectList[index] = { ...amProjectList[index], ...req.body };
  res.json(amProjectList[index]);
});

// ============================================================================
// AM: TASK PROGRESS
// ============================================================================

app.get('/api/am/task-progress', (req, res) => {
  res.json(amTaskProgress);
});

app.get('/api/am/task-progress/:id', (req, res) => {
  const task = amTaskProgress.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

app.post('/api/am/task-progress', (req, res) => {
  const newTask = {
    id: createId('amtask'),
    ...req.body,
  };
  amTaskProgress.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/am/task-progress/:id', (req, res) => {
  const index = amTaskProgress.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Task not found' });
  amTaskProgress[index] = { ...amTaskProgress[index], ...req.body };
  res.json(amTaskProgress[index]);
});

// ============================================================================
// AM: CLIENT UPDATES
// ============================================================================

app.get('/api/am/client-updates', (req, res) => {
  res.json(amClientUpdates);
});

app.post('/api/am/client-updates', (req, res) => {
  const newUpdate = {
    id: createId('update'),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  amClientUpdates.push(newUpdate);
  res.status(201).json(newUpdate);
});

app.put('/api/am/client-updates/:id', (req, res) => {
  const index = amClientUpdates.findIndex((u) => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Update not found' });
  amClientUpdates[index] = { ...amClientUpdates[index], ...req.body };
  res.json(amClientUpdates[index]);
});

// ============================================================================
// AM: KPI FLAGS
// ============================================================================

app.get('/api/am/kpi-flags', (req, res) => {
  res.json(amKpiFlags);
});

app.put('/api/am/kpi-flags', (req, res) => {
  Object.assign(amKpiFlags, req.body);
  res.json(amKpiFlags);
});

// ============================================================================
// AM: PROJECT SUBMISSIONS
// ============================================================================

app.get('/api/am/project-submissions', async (req, res, next) => {
  try {
    res.json(await listSubmissions());
  } catch (error) {
    next(error);
  }
});

app.get('/api/am/project-submissions/:id', async (req, res, next) => {
  try {
    const submission = await findSubmissionById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    next(error);
  }
});

app.post('/api/am/project-submissions', async (req, res, next) => {
  try {
    const { client, clientId, submittedById, submittedBy, project, description, objective, priority, deadline, attachmentName, comment, deliverables } = req.body || {};
    if (!project || !objective || !description) {
      return res.status(400).json({ message: 'project, objective, and description are required' });
    }
    let resolvedClientId = clientId;
    if (!resolvedClientId && client) {
      const clientRow = await findClientByName(client);
      if (!clientRow) return res.status(400).json({ message: `Client "${client}" not found` });
      resolvedClientId = clientRow.id;
    }
    let resolvedSubmittedById = submittedById;
    if (!resolvedSubmittedById && submittedBy) {
      const user = await findUserByEmail(submittedBy) || (await listUsers()).find((u) => u.name === submittedBy);
      resolvedSubmittedById = user?.id;
    }
    if (!resolvedClientId || !resolvedSubmittedById) {
      return res.status(400).json({ message: 'A valid client and submitting user are required' });
    }
    const newSubmission = await createSubmission({
      clientId: resolvedClientId,
      submittedById: resolvedSubmittedById,
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
    const { status, reviewedById, reviewedBy, reviewNote } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    let resolvedReviewedById = reviewedById;
    if (!resolvedReviewedById && reviewedBy) {
      const user = (await listUsers()).find((u) => u.name === reviewedBy);
      resolvedReviewedById = user?.id;
    }
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

app.get('/api/invites', (req, res) => {
  res.json(invites);
});

app.post('/api/invites', (req, res) => {
  const newInvite = {
    id: createId('invite'),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  invites.push(newInvite);
  res.status(201).json(newInvite);
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

app.listen(PORT, () => {
  console.log(`PixelEye backend running on http://localhost:${PORT}`);
});
