import express from 'express';
import cors from 'cors';
import {
  amKpiFlags,
  amProjectList,
  amProjectSubmissions,
  amTaskProgress,
  amClientUpdates,
  ams,
  clients,
  profile,
  projects,
  projectDeliverables,
  taskBoard,
  accounts,
  invites,
  intakes,
  createId,
} from './data.js';

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

app.get('/api/accounts', (req, res) => {
  res.json(accounts);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const match = accounts.find((a) => a.email === email && a.password === password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json(match);
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const existing = accounts.find((a) => a.email === email);
  if (existing) {
    return res.status(409).json({ message: 'Account already exists' });
  }
  const newAccount = {
    id: createId('account'),
    email,
    password,
    name,
    role: role || 'Production',
  };
  accounts.push(newAccount);
  res.status(201).json(newAccount);
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

app.get('/api/om/clients', (req, res) => {
  res.json(clients);
});

app.get('/api/om/clients/:id', (req, res) => {
  const client = clients.find((c) => c.id === req.params.id);
  if (!client) return res.status(404).json({ message: 'Client not found' });
  res.json(client);
});

app.post('/api/om/clients', (req, res) => {
  const newClient = {
    id: createId('client'),
    ...req.body,
  };
  clients.push(newClient);
  res.status(201).json(newClient);
});

// ============================================================================
// OM: PROJECTS
// ============================================================================

app.get('/api/om/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/om/projects/:id', (req, res) => {
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
});

app.get('/api/om/projects/:id/deliverables', (req, res) => {
  const { id } = req.params;
  res.json(projectDeliverables[id] || []);
});

app.post('/api/om/projects', (req, res) => {
  const newProject = {
    id: createId('project'),
    ...req.body,
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.put('/api/om/projects/:id', (req, res) => {
  const index = projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Project not found' });
  projects[index] = { ...projects[index], ...req.body };
  res.json(projects[index]);
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

app.get('/api/am/project-submissions', (req, res) => {
  res.json(amProjectSubmissions);
});

app.get('/api/am/project-submissions/:id', (req, res) => {
  const submission = amProjectSubmissions.find((s) => s.id === req.params.id);
  if (!submission) return res.status(404).json({ message: 'Submission not found' });
  res.json(submission);
});

app.post('/api/am/project-submissions', (req, res) => {
  const newSubmission = {
    id: createId('submission'),
    ...req.body,
    status: req.body.status || 'Pending Review',
    createdAt: new Date().toISOString(),
  };
  amProjectSubmissions.push(newSubmission);
  res.status(201).json(newSubmission);
});

app.put('/api/am/project-submissions/:id', (req, res) => {
  const index = amProjectSubmissions.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Submission not found' });
  amProjectSubmissions[index] = { ...amProjectSubmissions[index], ...req.body };
  res.json(amProjectSubmissions[index]);
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
