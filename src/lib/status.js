import { colors } from "./theme";

// OM doc section 10a: fixed capacity_max per AM/role, capacity_pct = active / max
export function capacityStatus(pct) {
  if (pct >= 1) return { label: "OVER CAPACITY", color: colors.danger };
  if (pct >= 0.85) return { label: "HIGH LOAD", color: colors.secondary };
  return { label: "OPTIMAL", color: colors.onTrack };
}

export function healthBadge(status) {
  if (status === "on_track") return { label: "On Track", color: colors.onTrack };
  if (status === "at_risk") return { label: "At Risk", color: colors.warn };
  return { label: "Overdue", color: colors.danger };
}

export function statusBadge(status) {
  return healthBadge(status);
}

// Client workload thresholds: 3-5 clients per AM
export function clientWorkloadStatus(clientCount) {
  if (clientCount > 5) return { label: "OVERLOAD", color: colors.danger, flag: "overload" };
  if (clientCount < 3) return { label: "LOW", color: colors.warn, flag: "low" };
  return { label: "OPTIMAL", color: colors.onTrack, flag: "optimal" };
}