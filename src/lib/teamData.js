const PROFILE_STORAGE_KEY = "pixeleye-profile";
const INVITES_STORAGE_KEY = "pixeleye-invites";
const ACCOUNTS_STORAGE_KEY = "pixeleye-accounts";
const SESSION_STORAGE_KEY = "pixeleye_session";
const AM_ACKS_KEY = "pixeleye-am-acks";
const TASKS_STORAGE_KEY = "pixeleye-tasks";
const REPORTS_STORAGE_KEY = "pixeleye-reports";
const OM_TASK_BOARD_KEY = "pixeleye-om-task-board";
const AM_PROJECT_LIST_KEY = "pixeleye-am-project-list";
const AM_TASK_PROGRESS_KEY = "pixeleye-am-task-progress";
const AM_CLIENT_UPDATES_KEY = "pixeleye-am-client-updates";
const AM_KPI_FLAGS_KEY = "pixeleye-am-kpi-flags";
const AM_SELECTED_PROJECT_KEY = "pixeleye-am-selected-project";
const DAILY_TASKS_STORAGE_KEY = "pixeleye-daily-tasks";
const DELIVERABLES_STORAGE_KEY = "pixeleye-deliverables";
const AM_PROJECT_SUBMISSIONS_KEY = "pixeleye-am-project-submissions";

export const defaultProfile = {
  name: "Ava Patel",
  email: "ava@marketingflow.studio",
  role: "Operations Lead",
  title: "Studio Operations",
  phone: "+1 555 0147",
  bio: "Oversees onboarding, team enablement, and studio delivery.",
  avatar: "",
};

export function getStoredProfile() {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveStoredProfile(profile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function getStoredInvites() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INVITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredInvites(invites) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites));
}

export function createInviteToken() {
  return `invite_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function buildInviteLink(token) {
  if (typeof window === "undefined") return token;
  return `${window.location.origin}${window.location.pathname}?invite=${token}`;
}

export function getStoredAccounts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredAccounts(accounts) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

const INTAKES_STORAGE_KEY = "pixeleye-intakes";

export function getStoredIntakes() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INTAKES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredIntakes(intakes) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INTAKES_STORAGE_KEY, JSON.stringify(intakes));
}

export function saveSession(session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

// AM acknowledgements for incoming assignments
export function getAMAcknowledgements() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AM_ACKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAMAcknowledgements(acks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AM_ACKS_KEY, JSON.stringify(acks));
}

// Task storage (per-project tasks)
export function getStoredTasks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredTasks(tasks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export function getStoredReports() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REPORTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredReports(reports) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export function getStoredOMTaskBoard() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OM_TASK_BOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOMTaskBoard(rows) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OM_TASK_BOARD_KEY, JSON.stringify(rows));
}

export function getStoredAMProjectList() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AM_PROJECT_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredAMProjectList(rows) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AM_PROJECT_LIST_KEY, JSON.stringify(rows));
}

export function getStoredAMTaskProgress() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AM_TASK_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredAMTaskProgress(rows) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AM_TASK_PROGRESS_KEY, JSON.stringify(rows));
}

export function getStoredAMClientUpdates() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AM_CLIENT_UPDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredAMClientUpdates(rows) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AM_CLIENT_UPDATES_KEY, JSON.stringify(rows));
}

export function getStoredAMKpiFlags() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AM_KPI_FLAGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredAMKpiFlags(flags) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AM_KPI_FLAGS_KEY, JSON.stringify(flags));
}

export function getStoredAMSelectedProject() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(AM_SELECTED_PROJECT_KEY) || "";
  } catch {
    return "";
  }
}

export function saveStoredAMSelectedProject(projectId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AM_SELECTED_PROJECT_KEY, projectId || "");
}

// Daily tasks storage
export function getStoredDailyTasks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DAILY_TASKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredDailyTasks(tasks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DAILY_TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

// Enhanced deliverables storage
export function getStoredDeliverables() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DELIVERABLES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredDeliverables(deliverables) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DELIVERABLES_STORAGE_KEY, JSON.stringify(deliverables));
}

export function getStoredAMProjectSubmissions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AM_PROJECT_SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredAMProjectSubmissions(submissions) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AM_PROJECT_SUBMISSIONS_KEY, JSON.stringify(submissions));
}

