const PROFILE_STORAGE_KEY = "pixeleye-profile";
const INVITES_STORAGE_KEY = "pixeleye-invites";
const ACCOUNTS_STORAGE_KEY = "pixeleye-accounts";
const SESSION_STORAGE_KEY = "pixeleye_session";
const AM_ACKS_KEY = "pixeleye-am-acks";
const TASKS_STORAGE_KEY = "pixeleye-tasks";
const REPORTS_STORAGE_KEY = "pixeleye-reports";

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
