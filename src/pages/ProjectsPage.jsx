import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { statusBadge } from "../lib/status";
import { PROJECTS, TIMELINE_DAYS, TIMELINE_DATES, TASKS } from "../lib/mockData";

function ProjectWorkspace({ project, onBack }) {
  const [tasks, setTasks] = useState(TASKS);
  const [activeDay, setActiveDay] = useState(12);
  const toggleTask = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="p-6">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-4" style={{ color: colors.muted, ...fontBody }}>
        <ChevronLeft size={14} /> Back to Projects
      </button>
      <div className="mb-6">
        <div style={{ color: colors.muted, ...fontBody }} className="text-xs uppercase">{project.client}</div>
        <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-3xl font-bold">{project.title}</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Timeline Strip</span>
              <div className="flex items-center gap-2">
                <ChevronLeft size={14} color={colors.muted} />
                <ChevronRight size={14} color={colors.muted} />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {TIMELINE_DAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setActiveDay(TIMELINE_DATES[i])}
                  className="rounded p-2 text-center"
                  style={{
                    background: TIMELINE_DATES[i] === activeDay ? colors.primary : "transparent",
                    color: TIMELINE_DATES[i] === activeDay ? colors.neutral : colors.muted,
                    border: `1px solid ${colors.border}`,
                    ...fontBody,
                  }}
                >
                  <div className="text-xs">{d}</div>
                  <div className="text-sm font-semibold">{TIMELINE_DATES[i]}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg">Today's Tasks</h3>
              <span style={{ color: colors.muted, ...fontBody }} className="text-xs">{tasks.filter((t) => !t.done).length} active</span>
            </div>
            <div className="space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded" style={{ border: `1px solid ${colors.border}` }}>
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="mt-1" />
                  <div className="flex-1">
                    <div style={{ color: colors.primary, ...fontBody, textDecoration: t.done ? "line-through" : "none" }} className="text-sm font-semibold">
                      {t.title}
                    </div>
                    <div style={{ color: colors.muted, ...fontBody }} className="text-xs">{t.note}</div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded h-fit" style={{ background: colors.tertiary, color: colors.primary, ...fontBody }}>
                    {t.role}
                  </span>
                </div>
              ))}
              <button
                className="flex items-center justify-center gap-2 w-full rounded p-3 text-sm font-semibold"
                style={{ border: `1px dashed ${colors.border}`, color: colors.muted, ...fontBody }}
              >
                <Plus size={14} /> New Daily Task
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ background: colors.tertiary }}>
          <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-3">Notes & Requirements</h3>
          <div className="flex gap-1 mb-3 flex-wrap">
            {["#q3_strategy", "#visual_audit", "#urgent"].map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ background: colors.neutral, color: colors.primary, ...fontBody }}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase mb-1">General Guidelines</div>
          <p style={{ ...fontBody, color: colors.primary }} className="text-sm mb-4">
            Remember to prioritize "Quiet UI" across all upcoming dashboard views. High-end print aesthetic is the goal — think Vogue meets Linear.
          </p>
          <textarea
            placeholder="Click here to add quick scratchpad thoughts..."
            className="w-full rounded p-2 text-sm h-24 outline-none"
            style={{ ...fontBody, border: `1px solid ${colors.border}` }}
          />
        </div>
      </div>
    </div>
  );
}

// GET /api/om/projects?status=
export default function ProjectsPage() {
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState("all");
  const filtered = PROJECTS.filter((p) => filter === "all" || p.status === filter);

  if (open) return <ProjectWorkspace project={open} onBack={() => setOpen(null)} />;

  return (
    <div className="p-6 space-y-6">
      <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-3xl font-bold">Projects</h1>
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "at_risk", label: "At Risk" },
          { key: "overdue", label: "Overdue" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="text-xs font-semibold px-3 py-1.5 rounded"
            style={{
              border: `1px solid ${colors.primary}`,
              background: filter === f.key ? colors.primary : "transparent",
              color: filter === f.key ? colors.neutral : colors.primary,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((p) => {
          const badge = statusBadge(p.status);
          return (
            <div key={p.id} onClick={() => setOpen(p)} className="rounded-lg p-4 cursor-pointer" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: colors.tertiary, color: colors.primary }}>{p.priority}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: badge.color, color: colors.neutral }}>{badge.label}</span>
              </div>
              <div style={{ ...fontDisplay, color: colors.primary }} className="text-lg font-bold">{p.title}</div>
              <div style={{ color: colors.muted }} className="text-xs mb-3">{p.client} · {p.am}</div>
              <div className="w-full rounded-full h-1.5" style={{ background: colors.tertiary }}>
                <div className="h-1.5 rounded-full" style={{ width: `${p.progress}%`, background: colors.secondary }} />
              </div>
              <div style={{ color: colors.muted }} className="text-xs mt-1">{p.progress}% complete</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}