import { randomUUID } from 'node:crypto';

export const clients = [
  { id: 'c1', name: 'Lumina Tech', am: 'Elena Rossi', projects: 4, health: 'on_track', lastActivity: '2 hours ago' },
  { id: 'c2', name: 'Veridian', am: 'Elena Rossi', projects: 2, health: 'at_risk', lastActivity: '40 mins ago' },
  { id: 'c3', name: 'Acme AI', am: 'Marcus Thorne', projects: 6, health: 'on_track', lastActivity: '15 mins ago' },
  { id: 'c4', name: 'Global Tech', am: 'Jordan Vance', projects: 3, health: 'overdue', lastActivity: '2 hours ago' },
  { id: 'c5', name: 'Vogue Studio', am: 'Jordan Vance', projects: 5, health: 'on_track', lastActivity: '1 day ago' },
  { id: 'c6', name: 'Solstice Energy', am: 'Marcus Thorne', projects: 1, health: 'at_risk', lastActivity: '3 hours ago' },
];

export const ams = [
  { id: 'am1', name: 'Jordan Vance', title: 'Global Creative', clients: 6, activeProjects: 22, capacityMax: 24, email: 'jordan@studio.com' },
  { id: 'am2', name: 'Elena Rossi', title: 'Editorial Lead', clients: 4, activeProjects: 14, capacityMax: 22, email: 'elena@studio.com' },
  { id: 'am3', name: 'Marcus Thorne', title: 'Performance Marketing', clients: 8, activeProjects: 31, capacityMax: 28, email: 'marcus@studio.com' },
];

export const projects = [
  { id: 'p1', title: 'Q4 Brand Refresh', client: 'Lumina Tech', am: 'Elena Rossi', priority: 'MID', status: 'on_track', progress: 62 },
  { id: 'p2', title: 'Website Launch', client: 'Veridian', am: 'Elena Rossi', priority: 'HIGH', status: 'at_risk', progress: 40 },
  { id: 'p3', title: 'Acme AI Launch', client: 'Acme AI', am: 'Marcus Thorne', priority: 'HIGH', status: 'on_track', progress: 71 },
  { id: 'p4', title: 'Global Tech Phase 1', client: 'Global Tech', am: 'Jordan Vance', priority: 'HIGH', status: 'overdue', progress: 28 },
  { id: 'p5', title: 'Solstice Pitch Deck', client: 'Solstice Energy', am: 'Marcus Thorne', priority: 'LOW', status: 'on_track', progress: 15 },
];

export const projectDeliverables = {
  p1: [
    { id: 'd1', title: 'Concept mood boards', due: 'Aug 12', status: 'complete' },
    { id: 'd2', title: 'Visual system exploration', due: 'Aug 14', status: 'pending' },
    { id: 'd3', title: 'Creative review deck', due: 'Aug 18', status: 'pending' },
  ],
  p2: [
    { id: 'd4', title: 'Homepage wireframes', due: 'Aug 9', status: 'complete' },
    { id: 'd5', title: 'Design handoff', due: 'Aug 17', status: 'pending' },
    { id: 'd6', title: 'Launch readiness checklist', due: 'Aug 21', status: 'pending' },
  ],
  p3: [
    { id: 'd7', title: 'Brand manifesto copy', due: 'Aug 11', status: 'complete' },
    { id: 'd8', title: 'Campaign asset library', due: 'Aug 16', status: 'pending' },
    { id: 'd9', title: 'Analytics dashboard setup', due: 'Aug 20', status: 'pending' },
  ],
  p4: [
    { id: 'd10', title: 'Phase 1 install review', due: 'Aug 10', status: 'complete' },
    { id: 'd11', title: 'Stakeholder sign-off', due: 'Aug 15', status: 'pending' },
    { id: 'd12', title: 'Quality audit report', due: 'Aug 19', status: 'pending' },
  ],
  p5: [
    { id: 'd13', title: 'Client storyboard review', due: 'Aug 8', status: 'complete' },
    { id: 'd14', title: 'Final deck polish', due: 'Aug 14', status: 'pending' },
    { id: 'd15', title: 'Executive summary', due: 'Aug 18', status: 'pending' },
  ],
};

export const taskBoard = [
  {
    id: 'omtb_1',
    projectId: 'Q-201',
    client: 'Nebula Forge',
    project: 'Launch Identity Sprint',
    taskStage: 1,
    mainTask: 'Stakeholder intake workshop',
    owner: 'Jordan Vance',
    support: 'Ops Desk',
    priority: 'High',
    status: 'Completed',
    progress: 100,
    deadline: '2026-09-10',
    approvalStatus: 'Approved',
  },
  {
    id: 'omtb_2',
    projectId: 'Q-201',
    client: 'Nebula Forge',
    project: 'Launch Identity Sprint',
    taskStage: 2,
    mainTask: 'Creative direction alignment',
    owner: 'Jordan Vance',
    support: 'Review Board',
    priority: 'High',
    status: 'In Progress',
    progress: 68,
    deadline: '2026-09-14',
    approvalStatus: 'Waiting Client',
  },
  {
    id: 'omtb_3',
    projectId: 'Q-318',
    client: 'Quartz Harbor',
    project: 'Retail Video Burst',
    taskStage: 1,
    mainTask: 'Scope definition',
    owner: 'Elena Rossi',
    support: 'Planning Cell',
    priority: 'High',
    status: 'Completed',
    progress: 100,
    deadline: '2026-10-02',
    approvalStatus: 'Approved',
  },
  {
    id: 'omtb_4',
    projectId: 'Q-409',
    client: 'Pine Atlas',
    project: 'Event Story Package',
    taskStage: 2,
    mainTask: 'Visual treatment draft',
    owner: 'Marcus Thorne',
    support: 'Design Pod',
    priority: 'Medium',
    status: 'In Progress',
    progress: 47,
    deadline: '2026-09-21',
    approvalStatus: 'Waiting OM',
  },
  {
    id: 'omtb_5',
    projectId: 'Q-447',
    client: 'Silver Orbit',
    project: 'Social Drip Campaign',
    taskStage: 1,
    mainTask: 'Kickoff readiness checklist',
    owner: 'Jordan Vance',
    support: 'Ops Assistant',
    priority: 'Low',
    status: 'Not Started',
    progress: 0,
    deadline: '2026-09-30',
    approvalStatus: 'Not Required',
  },
];

export const amProjectList = [
  { id: 'prj_101', client: 'Lumina Tech', projectName: 'Q4 Brand Refresh', stage: 'Creative Direction', owner: 'Elena Rossi', status: 'In Review' },
  { id: 'prj_102', client: 'Acme AI', projectName: 'Acme AI Launch', stage: 'Production', owner: 'Marcus Thorne', status: 'Approved' },
  { id: 'prj_103', client: 'Global Tech', projectName: 'Global Tech Phase 1', stage: 'Client Review', owner: 'Jordan Vance', status: 'At Risk' },
];

export const amTaskProgress = [
  { id: 'task_1', projectId: 'prj_101', task: 'Mood board review', assignee: 'Elena Rossi', status: 'Complete', progress: 100 },
  { id: 'task_2', projectId: 'prj_101', task: 'Final deck polish', assignee: 'Design Team', status: 'In Progress', progress: 68 },
  { id: 'task_3', projectId: 'prj_102', task: 'Campaign asset library', assignee: 'Marcus Thorne', status: 'In Progress', progress: 72 },
];

export const amClientUpdates = [
  { id: 'update_1', projectId: 'prj_101', client: 'Lumina Tech', summary: 'Requested a tighter motion treatment for the homepage hero.', date: '2026-08-20' },
  { id: 'update_2', projectId: 'prj_102', client: 'Acme AI', summary: 'Approved launch timeline with minor copy revisions.', date: '2026-08-22' },
];

export const amKpiFlags = {
  health: 'On Track',
  status: 'Eligible',
  bonus: 8,
  notes: 'Strong delivery pace across priority accounts.',
};

export const amProjectSubmissions = [];

export const profile = {
  name: 'Ava Patel',
  email: 'ava@marketingflow.studio',
  role: 'Operations Lead',
  title: 'Studio Operations',
  phone: '+1 555 0147',
  bio: 'Oversees onboarding, team enablement, and studio delivery.',
  avatar: '',
};

export const invites = [
  { id: 'invite_1', email: 'new@studio.test', role: 'Account Manager', createdAt: new Date().toISOString(), status: 'Pending' },
];

export const accounts = [
  { id: 'account_om_1', name: 'Jordan Vance', email: 'jordan@studio.test', role: 'Operations Manager', password: 'pass' },
  { id: 'account_am_1', name: 'Elena Rossi', email: 'elena@studio.test', role: 'Account Manager', password: 'pass' },
  { id: 'account_prod_1', name: 'Sam Producer', email: 'sam@studio.test', role: 'Video Editor', password: 'pass' },
  { id: 'account_dir_1', name: 'Avery Blake', email: 'avery@studio.test', role: 'Director', password: 'pass' },
];

export const intakes = [];export const reports = [];
export const session = null;

export function createId(prefix = 'item') {
  return `${prefix}_${randomUUID()}`;
}
