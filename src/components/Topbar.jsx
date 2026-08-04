import React from "react";
import { Search, Bell } from "lucide-react";
import { colors, fontBody } from "../lib/theme";

export default function Topbar() {
  return (
    <div
      className="flex items-center justify-between px-6 py-4"
      style={{ background: colors.neutral, borderBottom: `1px solid ${colors.border}` }}
    >
      <div
        className="flex items-center gap-2 rounded px-3 py-2 w-80"
        style={{ border: `1px solid ${colors.border}` }}
      >
        <Search size={14} color={colors.muted} />
        <input
          placeholder="Global operations search..."
          className="text-sm outline-none w-full"
          style={fontBody}
        />
      </div>
      <div className="flex items-center gap-4">
        <Bell size={18} color={colors.primary} />
        <div className="text-right">
          <div style={{ color: colors.primary, ...fontBody }} className="text-sm font-semibold">
            Sr. Producer
          </div>
          <div style={{ color: colors.muted, ...fontBody }} className="text-xs">
            Operations Manager
          </div>
        </div>
      </div>
    </div>
  );
}