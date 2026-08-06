import React from "react";
import { colors, fontBody, fontDisplay } from "../lib/theme";
import { toRwf } from "../lib/amWorkbook";

export default function AMKpiBonusPage({ summary, flags, onFlagsChange, selectedProjectId, onSelectProject, projects = [] }) {
  const setFlag = (key, value) => {
    onFlagsChange({ ...flags, [key]: value });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-bold" style={{ ...fontDisplay, color: colors.primary }}>Client Account KPI & Bonus - Automatic Calculation</h1>

      <div className="max-w-xl">
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

      <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Metric label="Account Manager" value={summary.project?.accountOwner || "-"} />
          <Metric label="Client" value={summary.project?.client || "-"} />
          <Metric label="Project" value={summary.project?.project || "-"} />
          <Metric label="Revenue Source" value={toRwf(summary.revenueSource)} />
          <Metric label="Cost Source" value={toRwf(summary.costSource)} />
          <Metric label="Profit Source" value={toRwf(summary.profitSource)} />
          <Metric label="Satisfaction Source" value={String(summary.satisfactionSource)} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ToggleRow
            label="Payment Received?"
            checked={Boolean(flags.paymentReceived)}
            onChange={(next) => setFlag("paymentReceived", next)}
          />
          <ToggleRow
            label="Project Delivered?"
            checked={Boolean(flags.projectDelivered)}
            onChange={(next) => setFlag("projectDelivered", next)}
          />
          <ToggleRow
            label="Relationship Maintained?"
            checked={Boolean(flags.relationshipMaintained)}
            onChange={(next) => setFlag("relationshipMaintained", next)}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Metric label="Eligibility" value={summary.eligibility} strong valueColor={summary.eligibility === "Eligible" ? colors.onTrack : colors.warn} />
          <Metric label="5% Bonus" value={toRwf(summary.bonusAmount)} strong valueColor={colors.onTrack} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, strong = false, valueColor }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "#FFFFFF", border: `1px solid ${colors.border}` }}>
      <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>{label}</div>
      <div className={`mt-1 ${strong ? "text-xl" : "text-base"} font-semibold`} style={{ ...fontBody, color: valueColor || colors.primary }}>
        {value}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="rounded-lg p-3 flex items-center justify-between gap-2" style={{ background: "#FFFFFF", border: `1px solid ${colors.border}`, ...fontBody }}>
      <span className="text-sm" style={{ color: colors.primary }}>{label}</span>
      <select value={checked ? "Yes" : "No"} onChange={(event) => onChange(event.target.value === "Yes")} className="rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }}>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </label>
  );
}
