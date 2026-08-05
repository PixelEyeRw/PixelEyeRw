import React from "react";
import {
  LayoutDashboard, Users, Briefcase, CalendarDays, BarChart3, Gauge,
  Settings as SettingsIcon, X, ChevronLeft,
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

export default function Sidebar({ active, onNavigate, navItems, isOpen, onToggle }) {
  const items = navItems || NAV_ITEMS;
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-30 lg:hidden z-40" onClick={onToggle} />}
      <aside
        className={`fixed left-0 top-0 h-screen flex-shrink-0 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 z-50 lg:z-auto flex flex-col ${
          isOpen ? "w-56" : "w-20"
        }`}
        style={{ background: colors.neutral, borderRight: `1px solid ${colors.border}` }}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between p-4 lg:p-5 border-b" style={{ borderBottomColor: colors.border }}>
          {isOpen && (
            <>
              <div style={{ ...fontDisplay, color: colors.primary }} className="text-xl font-bold">
                Pixel<span style={{ color: "#F59E0B" }}>Eye</span>
              </div>
              <button type="button" onClick={onToggle} className="p-1" aria-label="Collapse navigation">
                <ChevronLeft size={20} color={colors.primary} />
              </button>
            </>
          )}
          {!isOpen && (
            <button type="button" onClick={onToggle} className="p-1 mx-auto" aria-label="Expand navigation" title="Expand">
              <LayoutDashboard size={20} color={colors.primary} />
            </button>
          )}
        </div>

        {isOpen && (
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs px-4 lg:px-5 py-2">
            Marketing Flow · Creative Ops
          </div>
        )}

        <nav className="flex-1 flex flex-col gap-2 p-2 lg:p-3 overflow-y-auto" aria-label="Primary">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onNavigate(item.key);
                  if (window.innerWidth < 1024 && isOpen) onToggle();
                }}
                title={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-all ${
                  isOpen ? "justify-start" : "justify-center"
                }`}
                style={{
                  background: isActive ? colors.primary : "transparent",
                  color: isActive ? colors.neutral : colors.primary,
                  ...fontBody,
                }}
              >
                <Icon size={18} className="flex-shrink-0" />
                {isOpen && item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}