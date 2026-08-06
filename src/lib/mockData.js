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
    projectId: "Q-201",
    client: "Nebula Forge",
    project: "Launch Identity Sprint",
    taskStage: 1,
    mainTask: "Stakeholder intake workshop",
    owner: "Jordan Vance",
    support: "Ops Desk",
    priority: "High",
    status: "Completed",
    progress: 100,
    deadline: "2026-09-10",
    approvalStatus: "Approved",
  },
  {
    id: "omtb_2",
    projectId: "Q-201",
    client: "Nebula Forge",
    project: "Launch Identity Sprint",
    taskStage: 2,
    mainTask: "Creative direction alignment",
    owner: "Jordan Vance",
    support: "Review Board",
    priority: "High",
    status: "In Progress",
    progress: 68,
    deadline: "2026-09-14",
    approvalStatus: "Waiting Client",
  },
  {
    id: "omtb_3",
    projectId: "Q-318",
    client: "Quartz Harbor",
    project: "Retail Video Burst",
    taskStage: 1,
    mainTask: "Scope definition",
    owner: "Elena Rossi",
    support: "Planning Cell",
    priority: "High",
    status: "Completed",
    progress: 100,
    deadline: "2026-10-02",
    approvalStatus: "Approved",
  },
  {
    id: "omtb_4",
    projectId: "Q-409",
    client: "Pine Atlas",
    project: "Event Story Package",
    taskStage: 2,
    mainTask: "Visual treatment draft",
    owner: "Marcus Thorne",
    support: "Design Pod",
    priority: "Medium",
    status: "In Progress",
    progress: 47,
    deadline: "2026-09-21",
    approvalStatus: "Waiting OM",
  },
  {
    id: "omtb_5",
    projectId: "Q-447",
    client: "Silver Orbit",
    project: "Social Drip Campaign",
    taskStage: 1,
    mainTask: "Kickoff readiness checklist",
    owner: "Jordan Vance",
    support: "Ops Assistant",
    priority: "Low",
    status: "Not Started",
    progress: 0,
    deadline: "2026-09-30",
    approvalStatus: "Not Required",
  },
  {
    id: "omtb_6",
    projectId: "Q-512",
    client: "Delta Picnic",
    project: "Customer Story Shorts",
    taskStage: 4,
    mainTask: "Assemble first cut",
    owner: "Elena Rossi",
    support: "Studio Unit",
    priority: "High",
    status: "Client Review",
    progress: 84,
    deadline: "2026-10-18",
    approvalStatus: "Waiting Client",
  },
  {
    id: "omtb_7",
    projectId: "Q-550",
    client: "Northline Transit",
    project: "Civic Awareness Reel",
    taskStage: 2,
    mainTask: "Storyboard signoff",
    owner: "Marcus Thorne",
    support: "Content Ops",
    priority: "Low",
    status: "In Progress",
    progress: 52,
    deadline: "2026-11-02",
    approvalStatus: "Waiting OM",
  },
  {
    id: "omtb_8",
    projectId: "Q-603",
    client: "Echo Lantern",
    project: "Awareness Campaign",
    taskStage: 3,
    mainTask: "Asset production batch",
    owner: "Marcus Thorne",
    support: "Production Team",
    priority: "Medium",
    status: "On Hold",
    progress: 39,
    deadline: "2026-10-28",
    approvalStatus: "Waiting Internal",
  },
  {
    id: "omtb_9",
    projectId: "Q-640",
    client: "Aurora Snacks",
    project: "Packaging Refresh",
    taskStage: 2,
    mainTask: "Design adaptation",
    owner: "Elena Rossi",
    support: "Design Team",
    priority: "High",
    status: "Completed",
    progress: 100,
    deadline: "2026-09-25",
    approvalStatus: "Approved",
  },
  {
    id: "omtb_10",
    projectId: "Q-701",
    client: "Mosaic Harbor",
    project: "Documentary Micro-Series",
    taskStage: 1,
    mainTask: "Kickoff and delivery map",
    owner: "Jordan Vance",
    support: "Account Team",
    priority: "Medium",
    status: "In Progress",
    progress: 58,
    deadline: "2026-11-12",
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
    projectId: "Z-110",
    client: "Velvet Signal",
    project: "Autumn Campaign Kit",
    accountOwner: "Elena Rossi",
    projectLead: "Noa Kline",
    startDate: "2026-09-03",
    targetDeadline: "2026-10-06",
    priority: "High",
    riskLevel: "Medium",
    overallStatus: "In Progress",
    taskStage: "Content approval",
    revenueSource: 7600000,
    costSource: 4900000,
  },
  {
    id: "ampl_2",
    projectId: "Z-204",
    client: "Kite Foundry",
    project: "Festival Media Stack",
    accountOwner: "Elena Rossi",
    projectLead: "Mara Jin",
    startDate: "2026-08-19",
    targetDeadline: "2026-10-29",
    priority: "Critical",
    riskLevel: "High",
    overallStatus: "Waiting Approval",
    taskStage: "Executive signoff",
    revenueSource: 9300000,
    costSource: 6100000,
  },
  {
    id: "ampl_3",
    projectId: "Z-322",
    client: "Nimbus Pantry",
    project: "Short-Form Revision Sprint",
    accountOwner: "Elena Rossi",
    projectLead: "Owen Pike",
    startDate: "2026-09-01",
    targetDeadline: "2026-09-26",
    priority: "Medium",
    riskLevel: "Low",
    overallStatus: "Revision",
    taskStage: "Edit and QA",
    revenueSource: 3100000,
    costSource: 1850000,
  },
];

export const INITIAL_AM_TASK_PROGRESS = [
  {
    id: "amtp_1",
    projectId: "Z-110",
    client: "Velvet Signal",
    project: "Autumn Campaign Kit",
    stage: "Brief Intake",
    mainTask: "Collect campaign inputs",
    owner: "Elena Rossi",
    status: "Completed",
    progress: 100,
    deadline: "2026-09-05",
    approvalStatus: "Approved",
    nextAction: "Done",
  },
  {
    id: "amtp_2",
    projectId: "Z-110",
    client: "Velvet Signal",
    project: "Autumn Campaign Kit",
    stage: "Client Approval",
    mainTask: "Route edits for signoff",
    owner: "Elena Rossi",
    status: "Waiting Approval",
    progress: 72,
    deadline: "2026-10-06",
    approvalStatus: "Waiting Client Approval",
    nextAction: "Schedule decision call",
  },
  {
    id: "amtp_3",
    projectId: "Z-204",
    client: "Kite Foundry",
    project: "Festival Media Stack",
    stage: "Planning",
    mainTask: "Lock delivery calendar",
    owner: "Elena Rossi",
    status: "Completed",
    progress: 100,
    deadline: "2026-09-12",
    approvalStatus: "Approved",
    nextAction: "Hand off to production",
  },
  {
    id: "amtp_4",
    projectId: "Z-204",
    client: "Kite Foundry",
    project: "Festival Media Stack",
    stage: "Production",
    mainTask: "Finalize voiceover scripts",
    owner: "Elena Rossi",
    status: "In Progress",
    progress: 54,
    deadline: "2026-10-03",
    approvalStatus: "Waiting Internal Approval",
    nextAction: "Review script draft",
  },
  {
    id: "amtp_5",
    projectId: "Z-322",
    client: "Nimbus Pantry",
    project: "Short-Form Revision Sprint",
    stage: "Revisions",
    mainTask: "Apply final edit notes",
    owner: "Elena Rossi",
    status: "Not Started",
    progress: 0,
    deadline: "2026-09-24",
    approvalStatus: "Not Required",
    nextAction: "Await cut v2",
  },
];

export const INITIAL_AM_CLIENT_UPDATES = [
  {
    id: "amcu_1",
    client: "Velvet Signal",
    meetingNotes: "",
    clientFeedback: "",
    satisfactionScore: 8,
    nextClientAction: "Share revised storyboard",
    upsellOpportunity: "Quarterly channel package",
    referralAsked: "No",
    notes: "Initial touchpoint",
  },
];

export const INITIAL_AM_KPI_FLAGS = {
  paymentReceived: true,
  projectDelivered: true,
  relationshipMaintained: true,
};