import React from "react";
import { Search, Bell, Menu } from "lucide-react";
import { colors, fontBody } from "../lib/theme";
import { getSession } from "../lib/teamData";

function displayRoleLabel(role) {
  const normalized = (role || "").toLowerCase();
  if (normalized.includes("account")) return "Account Manager";
  if (normalized.includes("operation")) return "Operations Manager";
  if (normalized.includes("director")) return "Director";
  if (normalized.includes("production")) return "Production";
  return role || "Team Member";
}

export default function Topbar({ onSidebarToggle, sidebarOpen }) {
  const session = getSession();
  const displayName = session?.name || "Sr. Producer";
  const roleLabel = displayRoleLabel(session?.role);

  return (
    <div
      className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between"
      style={{ background: colors.neutral, borderBottom: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center gap-2">
        <button type="button" onClick={onSidebarToggle} aria-label="Toggle navigation" className="lg:hidden rounded p-2" style={{ border: `1px solid ${colors.border}` }}>
          <Menu size={18} color={colors.primary} />
        </button>
        <label className="flex items-center gap-2 rounded px-3 py-2 flex-1 sm:flex-none sm:w-80" style={{ border: `1px solid ${colors.border}` }}>
          <Search size={14} color={colors.muted} />
          <input
            aria-label="Search operations"
            placeholder="Global operations search..."
            className="text-sm outline-none w-full"
            style={fontBody}
          />
        </label>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <button type="button" aria-label="Notifications" className="rounded p-2" style={{ border: `1px solid ${colors.border}` }}>
          <Bell size={18} color={colors.primary} />
        </button>
        <div className="text-right">
          <div style={{ color: colors.primary, ...fontBody }} className="text-sm font-semibold">
            {displayName}
          </div>
          <div style={{ color: colors.muted, ...fontBody }} className="text-xs">
            {roleLabel}
          </div>
        </div>
      </div>
    </div>
  );
}