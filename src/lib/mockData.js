// Each export below maps to a real endpoint from the architecture docs.
// Swap the constant for a TanStack Query hook and every page keeps working.

// GET /api/om/account-managers
export const INITIAL_AMS = [
  { id: "am1", name: "Jordan Vance", title: "Global Creative", clients: 6, activeProjects: 22, capacityMax: 24 },
  { id: "am2", name: "Elena Rossi", title: "Editorial Lead", clients: 4, activeProjects: 14, capacityMax: 22 },
  { id: "am3", name: "Marcus Thorne", title: "Performance Marketing", clients: 8, activeProjects: 31, capacityMax: 28 },
];

// GET /api/om/deleted-tasks?scope=global
export const INITIAL_DELETED = [
  { id: "d1", timestamp: "Oct 24, 14:22", task: "Draft Social Copies - Nike Project", actor: "Jordan Vance", reason: "DUPLICATE", restored: false },
  { id: "d2", timestamp: "Oct 24, 11:05", task: "Final Color Grade v2", actor: "Marcus Thorne", reason: "ACCIDENTAL", restored: false },
  { id: "d3", timestamp: "Oct 23, 17:45", task: "Onboarding Deck Template", actor: "Elena Rossi", reason: "OUTDATED", restored: false },
];

// GET /api/om/activity-feed
export const ACTIVITY = [
  { id: "a1", actor: "Elena Rossi", text: "Archived project: Spring '23 Rebrand", time: "2 mins ago" },
  { id: "a2", actor: "Marcus Thorne", text: "Created 12 tasks for Acme AI Launch", time: "15 mins ago" },
  { id: "a3", actor: "System Update", text: "Global workload sync completed", time: "1 hour ago" },
  { id: "a4", actor: "Jordan Vance", text: "Assigned AM: Sara L. to Vogue Studio", time: "1 hour ago" },
  { id: "a5", actor: "Critical Alert", text: "Project \"Global Tech\" missed Phase 1 deadline", time: "2 hours ago" },
];

// GET /api/om/clients
export const CLIENTS = [
  { id: "c1", name: "Lumina Tech", am: "Elena Rossi", projects: 4, health: "on_track", lastActivity: "2 hours ago" },
  { id: "c2", name: "Veridian", am: "Elena Rossi", projects: 2, health: "at_risk", lastActivity: "40 mins ago" },
  { id: "c3", name: "Acme AI", am: "Marcus Thorne", projects: 6, health: "on_track", lastActivity: "15 mins ago" },
  { id: "c4", name: "Global Tech", am: "Jordan Vance", projects: 3, health: "overdue", lastActivity: "2 hours ago" },
  { id: "c5", name: "Vogue Studio", am: "Jordan Vance", projects: 5, health: "on_track", lastActivity: "1 day ago" },
  { id: "c6", name: "Solstice Energy", am: "Marcus Thorne", projects: 1, health: "at_risk", lastActivity: "3 hours ago" },
];

// GET /api/om/projects
export const PROJECTS = [
  { id: "p1", title: "Q4 Brand Refresh", client: "Lumina Tech", am: "Elena Rossi", priority: "MID", status: "on_track", progress: 62 },
  { id: "p2", title: "Website Launch", client: "Veridian", am: "Elena Rossi", priority: "HIGH", status: "at_risk", progress: 40 },
  { id: "p3", title: "Acme AI Launch", client: "Acme AI", am: "Marcus Thorne", priority: "HIGH", status: "on_track", progress: 71 },
  { id: "p4", title: "Global Tech Phase 1", client: "Global Tech", am: "Jordan Vance", priority: "HIGH", status: "overdue", progress: 28 },
  { id: "p5", title: "Solstice Pitch Deck", client: "Solstice Energy", am: "Marcus Thorne", priority: "LOW", status: "on_track", progress: 15 },
];

export const PROJECT_DELIVERABLES = {
  p1: [
    { id: "d1", title: "Concept mood boards", due: "Aug 12", status: "complete" },
    { id: "d2", title: "Visual system exploration", due: "Aug 14", status: "pending" },
    { id: "d3", title: "Creative review deck", due: "Aug 18", status: "pending" },
  ],
  p2: [
    { id: "d4", title: "Homepage wireframes", due: "Aug 9", status: "complete" },
    { id: "d5", title: "Design handoff", due: "Aug 17", status: "pending" },
    { id: "d6", title: "Launch readiness checklist", due: "Aug 21", status: "pending" },
  ],
  p3: [
    { id: "d7", title: "Brand manifesto copy", due: "Aug 11", status: "complete" },
    { id: "d8", title: "Campaign asset library", due: "Aug 16", status: "pending" },
    { id: "d9", title: "Analytics dashboard setup", due: "Aug 20", status: "pending" },
  ],
  p4: [
    { id: "d10", title: "Phase 1 install review", due: "Aug 10", status: "complete" },
    { id: "d11", title: "Stakeholder sign-off", due: "Aug 15", status: "pending" },
    { id: "d12", title: "Quality audit report", due: "Aug 19", status: "pending" },
  ],
  p5: [
    { id: "d13", title: "Client storyboard review", due: "Aug 8", status: "complete" },
    { id: "d14", title: "Final deck polish", due: "Aug 14", status: "pending" },
    { id: "d15", title: "Executive summary", due: "Aug 18", status: "pending" },
  ],
};

export const PROJECT_HISTORY = {
  p1: [
    { id: "h1", actor: "Elena Rossi", text: "Shared new brand direction with client", time: "2 hours ago" },
    { id: "h2", actor: "System", text: "Q4 Brand Refresh moved to on_track", time: "Yesterday" },
    { id: "h3", actor: "Design Team", text: "Completed first visual exploration", time: "2 days ago" },
  ],
  p2: [
    { id: "h4", actor: "Elena Rossi", text: "Raised priority for launch readiness items", time: "3 hours ago" },
    { id: "h5", actor: "QA Team", text: "Reported layout issues on tablet view", time: "Yesterday" },
    { id: "h6", actor: "System", text: "Website Launch marked at_risk", time: "2 days ago" },
  ],
  p3: [
    { id: "h7", actor: "Marcus Thorne", text: "Approved campaign asset library format", time: "1 hour ago" },
    { id: "h8", actor: "System", text: "Acme AI Launch remains on_track", time: "Yesterday" },
  ],
  p4: [
    { id: "h9", actor: "Jordan Vance", text: "Requested urgent client sign-off", time: "30 mins ago" },
    { id: "h10", actor: "System", text: "Global Tech Phase 1 overdue alert sent", time: "Today" },
    { id: "h11", actor: "Production", text: "Started quality audit round", time: "Yesterday" },
  ],
  p5: [
    { id: "h12", actor: "Marcus Thorne", text: "Shared pitch deck draft with the client", time: "Today" },
    { id: "h13", actor: "System", text: "Solstice Pitch Deck progress updated", time: "Yesterday" },
  ],
};

export const TIMELINE_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const TIMELINE_DATES = [12, 13, 14, 15, 16, 17];

// GET /api/om/projects/:id — task list portion
export const TASKS = [
  { id: "t1", title: "Refine UI kit typography scale", note: "Ensure all Big Caslon headings maintain readability.", role: "DESIGNER", done: false },
  { id: "t2", title: "Client presentation deck finalization", note: "Focus on the editorial flair sections.", role: "COPYWRITER", done: false },
  { id: "t3", title: "Animation handoff for Landing Page", note: "Prepare SVG assets for developer integration.", role: "MOTION DESIGNER", done: true },
];

// OM current task sheet seed
export const INITIAL_OM_TASK_BOARD = [
  {
    id: "omtb_1",
    projectId: "P-001",
    client: "Ameki",
    project: "Brand Guideline",
    taskStage: 1,
    mainTask: "Client brief intake",
    owner: "Jordan Vance",
    support: "Coordinator Team",
    priority: "High",
    status: "Completed",
    progress: 100,
    deadline: "2026-04-20",
    approvalStatus: "Approved",
  },
  {
    id: "omtb_2",
    projectId: "P-001",
    client: "Ameki",
    project: "Brand Guideline",
    taskStage: 3,
    mainTask: "Strategy development",
    owner: "Jordan Vance",
    support: "Sophie",
    priority: "High",
    status: "In Progress",
    progress: 75,
    deadline: "2026-04-21",
    approvalStatus: "Waiting Client",
  },
  {
    id: "omtb_3",
    projectId: "P-002",
    client: "RCAA",
    project: "Drone Campaign",
    taskStage: 1,
    mainTask: "Internal brief alignment",
    owner: "Elena Rossi",
    support: "Account Team",
    priority: "High",
    status: "Completed",
    progress: 100,
    deadline: "2026-04-20",
    approvalStatus: "Approved",
  },
  {
    id: "omtb_4",
    projectId: "P-003",
    client: "KAWAKA",
    project: "OnDock",
    taskStage: 2,
    mainTask: "Visual concept and references",
    owner: "Marcus Thorne",
    support: "Design Team",
    priority: "Medium",
    status: "In Progress",
    progress: 55,
    deadline: "2026-08-14",
    approvalStatus: "Waiting OM",
  },
  {
    id: "omtb_5",
    projectId: "P-004",
    client: "RSA",
    project: "Comms Activities",
    taskStage: 1,
    mainTask: "Project launch checklist",
    owner: "Jordan Vance",
    support: "Ops Assistant",
    priority: "Low",
    status: "Not Started",
    progress: 0,
    deadline: "2026-01-01",
    approvalStatus: "Not Required",
  },
  {
    id: "omtb_6",
    projectId: "P-005",
    client: "Hanga Hubs",
    project: "Success Stories",
    taskStage: 4,
    mainTask: "Edit first story cut",
    owner: "Elena Rossi",
    support: "Audiovisual Team",
    priority: "High",
    status: "Client Review",
    progress: 80,
    deadline: "2026-08-20",
    approvalStatus: "Waiting Client",
  },
  {
    id: "omtb_7",
    projectId: "P-006",
    client: "ICT Chamber",
    project: "Hanga Pitchfest",
    taskStage: 2,
    mainTask: "Storyboard confirmation",
    owner: "Marcus Thorne",
    support: "Adelphe",
    priority: "Low",
    status: "In Progress",
    progress: 50,
    deadline: "2027-05-21",
    approvalStatus: "Waiting OM",
  },
  {
    id: "omtb_8",
    projectId: "P-007",
    client: "Rwandafoam",
    project: "Campaign",
    taskStage: 3,
    mainTask: "Asset production batch",
    owner: "Marcus Thorne",
    support: "Production Team",
    priority: "Medium",
    status: "On Hold",
    progress: 40,
    deadline: "2026-07-10",
    approvalStatus: "Waiting Internal",
  },
  {
    id: "omtb_9",
    projectId: "P-008",
    client: "EU",
    project: "Hamwe Natwe",
    taskStage: 2,
    mainTask: "Design adaptation",
    owner: "Elena Rossi",
    support: "Design Team",
    priority: "High",
    status: "Completed",
    progress: 100,
    deadline: "2026-07-20",
    approvalStatus: "Approved",
  },
  {
    id: "omtb_10",
    projectId: "P-009",
    client: "GBS",
    project: "Video Production",
    taskStage: 1,
    mainTask: "Kickoff and delivery mapping",
    owner: "Jordan Vance",
    support: "Account Team",
    priority: "Medium",
    status: "In Progress",
    progress: 50,
    deadline: "2026-07-10",
    approvalStatus: "Waiting Client",
  },
];

// GET /api/om/calendar
export const DEADLINES = {
  6: [{ title: "Lumina Final Export", am: "Elena Rossi" }],
  12: [{ title: "Nike SS24 Premiere", am: "Marcus Thorne" }],
  18: [{ title: "BMW Concept Final Export", am: "Jordan Vance" }],
  22: [{ title: "Veridian Wireframes V2", am: "Elena Rossi" }, { title: "Monthly Billing Report", am: "Elena Rossi" }],
  26: [{ title: "Sound Design Mix", am: "Marcus Thorne" }],
};

// Reports page — GET /api/om/reports/:type
export const REPORT_SHORTCUTS = [
  { key: "weekly", label: "Weekly Report", desc: "Task completion & activity, last 7 days" },
  { key: "monthly", label: "Monthly Report", desc: "Studio-wide progress & billing summary" },
  { key: "team_productivity", label: "Team Productivity", desc: "Per-AM and per-role output" },
  { key: "deadline_performance", label: "Deadline Performance", desc: "On-time vs overdue delivery rate" },
];
export const COMPLETION_TREND = [
  { week: "W1", onTime: 82 },
  { week: "W2", onTime: 78 },
  { week: "W3", onTime: 85 },
  { week: "W4", onTime: 91 },
];

// GET /api/om/workload (role view)
export const PRODUCTION_ROLES = [
  { id: "r1", name: "Video Editor", icon: "Video", activeTasks: 18, capacityMax: 20 },
  { id: "r2", name: "Designer", icon: "Palette", activeTasks: 14, capacityMax: 18 },
  { id: "r3", name: "Copywriter", icon: "PenTool", activeTasks: 9, capacityMax: 15 },
  { id: "r4", name: "Motion Designer", icon: "Film", activeTasks: 12, capacityMax: 12 },
];

// GET /api/om/roles — Settings > Roles & Permissions
export const CAPABILITIES = [
  { key: "view_tasks", label: "View & manage own tasks", locked: true },
  { key: "file_upload", label: "Upload deliverable files" },
  { key: "request_clarification", label: "Request clarification from AM" },
  { key: "comment_thread", label: "Comment thread on tasks" },
  { key: "view_schedule", label: "Calendar / schedule view" },
  { key: "view_reports", label: "Personal productivity reports" },
  { key: "time_tracking", label: "Time tracking on tasks" },
  { key: "annotation_markup", label: "Annotation & markup on files" },
];

export const INITIAL_ROLES = [
  { id: "role1", name: "Video Editor", users: 4, active: true, permissions: { view_tasks: true, file_upload: true, request_clarification: true, comment_thread: true, view_schedule: true, view_reports: false, time_tracking: false, annotation_markup: false } },
  { id: "role2", name: "Designer", users: 3, active: true, permissions: { view_tasks: true, file_upload: true, request_clarification: true, comment_thread: true, view_schedule: true, view_reports: true, time_tracking: false, annotation_markup: true } },
  { id: "role3", name: "Copywriter", users: 2, active: true, permissions: { view_tasks: true, file_upload: true, request_clarification: true, comment_thread: true, view_schedule: false, view_reports: false, time_tracking: false, annotation_markup: false } },
  { id: "role4", name: "Motion Designer", users: 2, active: true, permissions: { view_tasks: true, file_upload: true, request_clarification: true, comment_thread: true, view_schedule: true, view_reports: false, time_tracking: true, annotation_markup: true } },
];

export const NAV_KEYS = ["dashboard", "clients", "projects", "calendar", "reports", "workload", "settings"];

// AM workbook seed data
export const INITIAL_AM_PROJECT_LIST = [
  {
    id: "ampl_1",
    projectId: "P-001",
    client: "Ameki",
    project: "Brand Guideline",
    accountOwner: "Adelphe",
    projectLead: "Iris",
    startDate: "2026-04-20",
    targetDeadline: "2026-04-25",
    priority: "Critical",
    riskLevel: "High",
    overallStatus: "Waiting Approval",
    taskStage: "Client Approval",
    revenueSource: 5000000,
    costSource: 3200000,
  },
  {
    id: "ampl_2",
    projectId: "P-017",
    client: "Minict",
    project: "HPF 26",
    accountOwner: "Adelphe",
    projectLead: "Sophie",
    startDate: "2026-06-30",
    targetDeadline: "2026-11-30",
    priority: "Critical",
    riskLevel: "Medium",
    overallStatus: "In Progress",
    taskStage: "Communication plan review",
    revenueSource: 6800000,
    costSource: 4200000,
  },
  {
    id: "ampl_3",
    projectId: "P-009",
    client: "GBS",
    project: "Video Corrections",
    accountOwner: "Adelphe",
    projectLead: "Sophie",
    startDate: "2026-05-05",
    targetDeadline: "2026-07-04",
    priority: "High",
    riskLevel: "High",
    overallStatus: "Revision",
    taskStage: "Video editing",
    revenueSource: 2400000,
    costSource: 1700000,
  },
];

export const INITIAL_AM_TASK_PROGRESS = [
  {
    id: "amtp_1",
    projectId: "P-001",
    client: "Ameki",
    project: "Brand Guideline",
    stage: "Client Brief Intake",
    mainTask: "Receive full brief",
    owner: "Adelphe",
    status: "Completed",
    progress: 100,
    deadline: "2026-04-20",
    approvalStatus: "Approved",
    nextAction: "Done",
  },
  {
    id: "amtp_2",
    projectId: "P-001",
    client: "Ameki",
    project: "Brand Guideline",
    stage: "Client Approval",
    mainTask: "Follow up on feedback",
    owner: "Adelphe",
    status: "Waiting Approval",
    progress: 75,
    deadline: "2026-04-25",
    approvalStatus: "Waiting Client Approval",
    nextAction: "Call client",
  },
  {
    id: "amtp_3",
    projectId: "P-017",
    client: "Minict",
    project: "HPF 26",
    stage: "Campaign Planning",
    mainTask: "Create July content calendar",
    owner: "Adelphe",
    status: "Completed",
    progress: 100,
    deadline: "2026-07-03",
    approvalStatus: "Waiting Client Approval",
    nextAction: "Copywriter still on it",
  },
  {
    id: "amtp_4",
    projectId: "P-017",
    client: "Minict",
    project: "HPF 26",
    stage: "Scriptwriting",
    mainTask: "Develop scripts for July short-form videos",
    owner: "Adelphe",
    status: "In Progress",
    progress: 50,
    deadline: "2026-07-10",
    approvalStatus: "Waiting Internal Approval",
    nextAction: "Copywriter still on it",
  },
  {
    id: "amtp_5",
    projectId: "P-017",
    client: "Minict",
    project: "HPF 26",
    stage: "Revisions",
    mainTask: "Implement client feedback and finalize approved content",
    owner: "Adelphe",
    status: "Not Started",
    progress: 0,
    deadline: "2026-07-15",
    approvalStatus: "Not Required",
    nextAction: "N/A",
  },
];

export const INITIAL_AM_CLIENT_UPDATES = [
  {
    id: "amcu_1",
    client: "Ameki",
    meetingNotes: "",
    clientFeedback: "",
    satisfactionScore: 9,
    nextClientAction: "Follow up on approval",
    upsellOpportunity: "Retainer proposal",
    referralAsked: "No",
    notes: "Example only",
  },
];

export const INITIAL_AM_KPI_FLAGS = {
  paymentReceived: true,
  projectDelivered: true,
  relationshipMaintained: true,
};