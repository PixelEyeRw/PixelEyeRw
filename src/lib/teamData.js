const PROFILE_STORAGE_KEY = "pixeleye-profile";
const INVITES_STORAGE_KEY = "pixeleye-invites";
const ACCOUNTS_STORAGE_KEY = "pixeleye-accounts";

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
