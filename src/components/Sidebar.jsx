import React from "react";
import {
  LayoutDashboard, Users, Briefcase, CalendarDays, BarChart3, Gauge,
  Settings as SettingsIcon,
} from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clients", label: "Clients", icon: Users },
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "workload", label: "Workload", icon: Gauge },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside
      className="w-56 flex-shrink-0 p-5"
      style={{ background: colors.neutral, borderRight: `1px solid ${colors.border}` }}
    >
      <div style={{ ...fontDisplay, color: colors.primary }} className="text-xl font-bold">
        PixelEye
      </div>
      <div style={{ ...fontBody, color: colors.muted }} className="text-xs mt-1 mb-6">
        Marketing Flow · Creative Ops
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <div
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm cursor-pointer"
              style={{
                background: isActive ? colors.primary : "transparent",
                color: isActive ? colors.neutral : colors.primary,
                ...fontBody,
              }}
            >
              <Icon size={16} />
              {item.label}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}