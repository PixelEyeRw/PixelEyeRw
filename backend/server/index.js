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
  createId,
} from './data.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'pixeleye-backend', timestamp: new Date().toISOString() });
});

app.get('/api/profile', (req, res) => {
  res.json(profile);
});

app.get('/api/om/account-managers', (req, res) => {
  res.json(ams);
});

app.get('/api/om/clients', (req, res) => {
  res.json(clients);
});

app.get('/api/om/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/om/projects/:id/deliverables', (req, res) => {
  const { id } = req.params;
  res.json(projectDeliverables[id] || []);
});

app.get('/api/om/tasks', (req, res) => {
  res.json(taskBoard);
});

app.get('/api/am/project-list', (req, res) => {
  res.json(amProjectList);
});

app.get('/api/am/task-progress', (req, res) => {
  res.json(amTaskProgress);
});

app.get('/api/am/client-updates', (req, res) => {
  res.json(amClientUpdates);
});

app.get('/api/am/kpi-flags', (req, res) => {
  res.json(amKpiFlags);
});

app.get('/api/am/project-submissions', (req, res) => {
  res.json(amProjectSubmissions);
});

app.post('/api/am/project-submissions', (req, res) => {
  const payload = req.body || {};
  const submission = {
    id: createId('submission'),
    ...payload,
    status: payload.status || 'Pending Review',
    createdAt: new Date().toISOString(),
  };

  amProjectSubmissions.push(submission);
  res.status(201).json(submission);
});

app.put('/api/om/tasks/:id', (req, res) => {
  const { id } = req.params;
  const index = taskBoard.findIndex((row) => row.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  taskBoard[index] = { ...taskBoard[index], ...req.body };
  res.json(taskBoard[index]);
});

app.listen(PORT, () => {
  console.log(`PixelEye backend running on http://localhost:${PORT}`);
});
