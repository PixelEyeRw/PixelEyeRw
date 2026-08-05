import React, { useState } from "react";
import { ArrowLeftRight, Video, Palette, PenTool, Film } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { capacityStatus } from "../lib/status";
import { PRODUCTION_ROLES } from "../lib/mockData";

const ICONS = { Video, Palette, PenTool, Film };

// GET /api/om/workload — filterable by AM or by production role
export default function WorkloadPage({ ams, onReassign }) {
  const [view, setView] = useState("am");

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl sm:text-3xl font-bold">Workload</h1>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "am", label: "By Account Manager" },
            { key: "role", label: "By Production Role" },
          ].map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              aria-pressed={view === v.key}
              className="text-xs font-semibold px-3 py-1.5 rounded"
              style={{
                border: `1px solid ${colors.primary}`,
                background: view === v.key ? colors.primary : "transparent",
                color: view === v.key ? colors.neutral : colors.primary,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "am" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ams.map((am) => {
            const pct = am.activeProjects / am.capacityMax;
            const status = capacityStatus(pct);
            return (
              <div key={am.id} className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div style={{ ...fontBody, color: colors.primary }} className="font-semibold text-sm">{am.name}</div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: status.color, color: colors.neutral, ...fontBody }}>{status.label}</span>
                </div>
                <div style={{ color: colors.muted, ...fontBody }} className="text-xs mb-3">{am.activeProjects} / {am.capacityMax} active projects</div>
                <div className="w-full rounded-full h-2 mb-3" style={{ background: colors.tertiary }}>
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(pct, 1) * 100}%`, background: status.color }} />
                </div>
                {pct >= 1 && (
                  <button
                    onClick={() => onReassign(am)}
                    className="flex items-center justify-center gap-2 w-full rounded py-1.5 text-xs font-semibold"
                    style={{ border: `1px solid ${colors.primary}`, color: colors.primary, ...fontBody }}
                  >
                    <ArrowLeftRight size={12} /> Reassign
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PRODUCTION_ROLES.map((r) => {
            const pct = r.activeTasks / r.capacityMax;
            const status = capacityStatus(pct);
            const Icon = ICONS[r.icon];
            return (
              <div key={r.id} className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} color={colors.primary} />
                  <div style={{ ...fontBody, color: colors.primary }} className="font-semibold text-sm">{r.name}</div>
                </div>
                <div style={{ color: colors.muted, ...fontBody }} className="text-xs mb-3">{r.activeTasks} / {r.capacityMax} active tasks</div>
                <div className="w-full rounded-full h-2 mb-2" style={{ background: colors.tertiary }}>
                  <div className="h-2 rounded-full" style={{ width: `${Math.min(pct, 1) * 100}%`, background: status.color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: status.color, ...fontBody }}>{status.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}