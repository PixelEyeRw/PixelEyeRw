import React from "react";
import { fontBody, colors } from "../lib/theme";
import { getSession } from "../lib/teamData";
import { PROJECTS, INITIAL_AMS } from "../lib/mockData";

export default function AMDashboard() {
  const session = getSession();
  const myProjects = PROJECTS.filter((p) => p.am === session?.name);
  const myAmRecord = INITIAL_AMS.find((a) => a.name === session?.name) || {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Today's Projects</h1>
      <p style={{ ...fontBody, color: colors.muted }} className="mt-2">A personal view of active projects assigned to you.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Active projects</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-2xl font-semibold">{myProjects.length}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Overdue</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-2xl font-semibold">{myProjects.filter((p) => p.status === 'overdue').length}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Capacity</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-2xl font-semibold">{myAmRecord.capacityMax ?? '—'}</div>
        </div>
      </div>

      <div className="mt-6">
        <h2 style={{ ...fontBody, color: colors.primary }} className="text-lg font-semibold">Today's project list</h2>
        <div className="mt-3 space-y-3">
          {myProjects.map((p) => (
            <div key={p.id} className="rounded border p-3" style={{ borderColor: colors.border }}>
              <div className="font-semibold" style={{ color: colors.primary, ...fontBody }}>{p.title}</div>
              <div className="text-sm" style={{ color: colors.muted, ...fontBody }}>{p.client} · Progress: {p.progress}%</div>
            </div>
          ))}
          {myProjects.length === 0 && <div style={{ ...fontBody, color: colors.muted }}>No active projects assigned to you today.</div>}
        </div>
      </div>
    </div>
  );
}
