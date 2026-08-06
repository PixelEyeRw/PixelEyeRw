import React from "react";
import { fontBody, colors, fontDisplay } from "../lib/theme";
import { toRwf } from "../lib/amWorkbook";

export default function AMDashboard({ summary, selectedProjectId, onSelectProject, projects = [] }) {
  const project = summary?.project;

  return (
    <div className="p-6">
      <h1 className="text-2xl sm:text-3xl font-semibold" style={{ ...fontDisplay, color: colors.primary }}>Account Dashboard</h1>
      <p style={{ ...fontBody, color: colors.muted }} className="mt-2">Client and project overview pulled from your AM workbook data.</p>

      <div className="mt-4 max-w-xl">
        <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Project focus</label>
        <select
          value={selectedProjectId}
          onChange={(event) => onSelectProject(event.target.value)}
          className="w-full rounded p-2 text-sm"
          style={{ ...fontBody, border: `1px solid ${colors.border}` }}
        >
          {projects.map((item) => (
            <option key={item.projectId} value={item.projectId}>{item.projectId} - {item.project}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Account Manager</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-xl font-semibold">{project?.accountOwner || "-"}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Client Example</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-xl font-semibold">{project?.client || "-"}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Project</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-xl font-semibold">{project?.project || "-"}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Project Status</div>
          <div style={{ ...fontBody, color: colors.secondary }} className="text-xl font-semibold">{project?.overallStatus || "-"}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Progress</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-2xl font-semibold">{summary.progress}%</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Risk Level</div>
          <div style={{ ...fontBody, color: colors.danger }} className="text-2xl font-semibold">{summary.riskLevel}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Approval Status</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-lg font-semibold">{summary.approvalStatus}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Client Satisfaction</div>
          <div style={{ ...fontBody, color: colors.primary }} className="text-2xl font-semibold">{summary.satisfactionSource}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Estimated Bonus</div>
          <div style={{ ...fontBody, color: colors.onTrack }} className="text-2xl font-semibold">{toRwf(summary.bonusAmount)}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">Eligibility</div>
          <div style={{ ...fontBody, color: summary.eligibility === "Eligible" ? colors.onTrack : colors.warn }} className="text-xl font-semibold">{summary.eligibility}</div>
        </div>
      </div>
    </div>
  );
}
