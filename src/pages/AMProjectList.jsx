import React from "react";
import { colors, fontBody, fontDisplay } from "../lib/theme";

const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
const RISK_OPTIONS = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["Waiting Approval", "In Progress", "Published", "Revision", "Delivered"];

export default function AMProjectList({ rows = [], onRowsChange = () => {} }) {
  const updateRow = (rowId, field, value) => {
    onRowsChange(rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-bold" style={{ ...fontDisplay, color: colors.primary }}>Project List + Bonus Source Numbers</h1>
      <div className="rounded-xl overflow-x-auto" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <table className="min-w-[1300px] w-full text-sm" style={{ ...fontBody }}>
          <thead>
            <tr style={{ background: colors.primary, color: colors.neutral }}>
              {[
                "Project ID",
                "Client",
                "Project",
                "Account Owner",
                "Project Lead",
                "Start Date",
                "Target Deadline",
                "Priority",
                "Risk",
                "Overall Status",
                "Task Stage",
                "Revenue Source",
                "Cost Source",
              ].map((heading) => (
                <th key={heading} className="text-left px-3 py-2 font-semibold whitespace-nowrap">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b" style={{ borderColor: colors.border }}>
                <td className="px-3 py-2 whitespace-nowrap">{row.projectId}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.client}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.project}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.accountOwner}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.projectLead}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.startDate}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="date"
                    value={row.targetDeadline}
                    onChange={(event) => updateRow(row.id, "targetDeadline", event.target.value)}
                    className="rounded px-2 py-1 text-xs"
                    style={{ border: `1px solid ${colors.border}` }}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <select value={row.priority} onChange={(event) => updateRow(row.id, "priority", event.target.value)} className="rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }}>
                    {PRIORITY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <select value={row.riskLevel} onChange={(event) => updateRow(row.id, "riskLevel", event.target.value)} className="rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }}>
                    {RISK_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <select value={row.overallStatus} onChange={(event) => updateRow(row.id, "overallStatus", event.target.value)} className="rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }}>
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 min-w-[180px]">
                  <input
                    value={row.taskStage}
                    onChange={(event) => updateRow(row.id, "taskStage", event.target.value)}
                    className="w-full rounded px-2 py-1 text-xs"
                    style={{ border: `1px solid ${colors.border}` }}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={row.revenueSource}
                    onChange={(event) => updateRow(row.id, "revenueSource", Number(event.target.value) || 0)}
                    className="w-28 rounded px-2 py-1 text-xs"
                    style={{ border: `1px solid ${colors.border}` }}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    value={row.costSource}
                    onChange={(event) => updateRow(row.id, "costSource", Number(event.target.value) || 0)}
                    className="w-28 rounded px-2 py-1 text-xs"
                    style={{ border: `1px solid ${colors.border}` }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
