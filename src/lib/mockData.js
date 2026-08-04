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

export const TIMELINE_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const TIMELINE_DATES = [12, 13, 14, 15, 16, 17];

// GET /api/om/projects/:id — task list portion
export const TASKS = [
  { id: "t1", title: "Refine UI kit typography scale", note: "Ensure all Big Caslon headings maintain readability.", role: "DESIGNER", done: false },
  { id: "t2", title: "Client presentation deck finalization", note: "Focus on the editorial flair sections.", role: "COPYWRITER", done: false },
  { id: "t3", title: "Animation handoff for Landing Page", note: "Prepare SVG assets for developer integration.", role: "MOTION DESIGNER", done: true },
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