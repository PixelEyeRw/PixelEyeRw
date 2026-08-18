import React from "react";
import { colors, fontBody, fontDisplay } from "../lib/theme";

const STATUS_OPTIONS = ["Completed", "In Progress", "Not Started", "Waiting Approval"];
const APPROVAL_OPTIONS = ["Approved", "Waiting Client Approval", "Waiting Internal Approval", "Waiting OM Approval", "Not Required"];

export default function AMTaskProgressPage({ rows = [], onRowsChange = () => {} }) {
  const updateRow = (rowId, field, value) => {
    onRowsChange(
      rows.map((row) => {
        if (row.id !== rowId) return row;
        if (field === "progress") return { ...row, progress: Math.max(0, Math.min(100, Number(value) || 0)) };
        return { ...row, [field]: value };
      })
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-bold" style={{ ...fontDisplay, color: colors.primary }}>Task Progress - Linked To Project</h1>
      <div className="rounded-xl overflow-x-auto" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <table className="min-w-[1450px] w-full text-sm" style={{ ...fontBody }}>
          <thead>
            <tr style={{ background: colors.primary, color: colors.neutral }}>
              {[
                "Project ID",
                "Client",
                "Project",
                "Stage",
                "Deliverable",
                "Main Task",
                "Role",
                "Owner",
                "Status",
                "Progress",
                "Deadline",
                "Approval Status",
                "Next Action",
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
                <td className="px-3 py-2 whitespace-nowrap">{row.stage}</td>
                <td className="px-3 py-2 min-w-[220px]">{row.deliverableName || row.mainTask}</td>
                <td className="px-3 py-2 min-w-[260px]">
                  <input value={row.mainTask} onChange={(event) => updateRow(row.id, "mainTask", event.target.value)} className="w-full rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }} />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{row.role || "-"}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.owner || "Unassigned"}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <select value={row.status} onChange={(event) => updateRow(row.id, "status", event.target.value)} className="rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }}>
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={row.progress}
                    onChange={(event) => updateRow(row.id, "progress", event.target.value)}
                    className="w-20 rounded px-2 py-1 text-xs"
                    style={{ border: `1px solid ${colors.border}` }}
                  />
                  <span className="ml-1">%</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="date"
                    value={row.deadline}
                    onChange={(event) => updateRow(row.id, "deadline", event.target.value)}
                    className="rounded px-2 py-1 text-xs"
                    style={{ border: `1px solid ${colors.border}` }}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <select value={row.approvalStatus} onChange={(event) => updateRow(row.id, "approvalStatus", event.target.value)} className="rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }}>
                    {APPROVAL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 min-w-[220px]">
                  <input
                    value={row.nextAction}
                    onChange={(event) => updateRow(row.id, "nextAction", event.target.value)}
                    className="w-full rounded px-2 py-1 text-xs"
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
