import React, { useMemo, useState } from "react";
import { colors, fontBody, fontDisplay } from "../lib/theme";
import { getSession } from "../lib/teamData";

const STATUS_OPTIONS = ["Not Started", "In Progress", "Client Review", "Completed", "On Hold", "Cancelled"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const APPROVAL_OPTIONS = ["Approved", "Waiting Client", "Waiting OM", "Waiting Internal", "Not Required"];

function buildOverallStatus(row) {
  if (row.status === "Cancelled") return "Cancelled";
  if (row.status === "Completed" || row.progress >= 100) return "Completed";
  const deadline = new Date(row.deadline);
  const now = new Date();
  if (!Number.isNaN(deadline.getTime()) && deadline < now && row.progress < 100) return "Overdue";
  if (row.status === "On Hold") return "On Hold";
  if (row.progress >= 65) return "On Track";
  if (row.progress >= 30) return "At Risk";
  return "Not Started";
}

function rowTone(status) {
  if (status === "Overdue") return { bg: "#FEECEC", text: colors.danger };
  if (status === "At Risk") return { bg: "#FFF4DD", text: colors.warn };
  if (status === "Completed") return { bg: "#EAF6EE", text: colors.onTrack };
  if (status === "Cancelled") return { bg: "#F4F4F4", text: colors.muted };
  return { bg: "#EEF4FF", text: colors.primary };
}

export default function OMTaskBoard({ rows = [], onRowsChange = () => {} }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get current user session
  const session = getSession();
  const isOM = session?.role === "Operations Manager";
  const currentUser = session?.name;

  // Filter by owner for non-OM users
  const ownerFilteredRows = useMemo(() => {
    if (isOM || !currentUser) return rows;
    return rows.filter((row) => row.owner === currentUser);
  }, [rows, isOM, currentUser]);

  const filteredRows = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ownerFilteredRows.filter((row) => {
      const matchesQuery =
        row.projectId.toLowerCase().includes(q) ||
        row.client.toLowerCase().includes(q) ||
        row.project.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q) ||
        row.mainTask.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [ownerFilteredRows, query, statusFilter]);

  const summary = useMemo(() => {
    const activeClients = new Set(ownerFilteredRows.map((row) => row.client)).size;
    const liveProjects = new Set(ownerFilteredRows.map((row) => row.projectId)).size;
    const today = new Date();
    const overdueTasks = ownerFilteredRows.filter((row) => {
      const d = new Date(row.deadline);
      return !Number.isNaN(d.getTime()) && d < today && row.progress < 100 && row.status !== "Cancelled";
    }).length;
    const averageProgress = ownerFilteredRows.length
      ? Math.round(ownerFilteredRows.reduce((sum, row) => sum + (Number(row.progress) || 0), 0) / ownerFilteredRows.length)
      : 0;
    return { activeClients, liveProjects, overdueTasks, averageProgress };
  }, [ownerFilteredRows]);

  const updateRow = (rowId, field, value) => {
    onRowsChange(
      rows.map((row) => {
        if (row.id !== rowId) return row;
        if (field === "progress") {
          const nextProgress = Math.max(0, Math.min(100, Number(value) || 0));
          return { ...row, progress: nextProgress };
        }
        return { ...row, [field]: value };
      })
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ ...fontDisplay, color: colors.primary }}>
          {isOM ? "Current Task Sheet" : "My Task Sheet"}
        </h1>
        <p className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>
          {isOM 
            ? "Live operations sheet for all in-flight work. Updating status, progress, or approvals here instantly updates OM metrics."
            : "Your personal task sheet showing all tasks assigned to you. Update status, progress, and approvals to keep your team informed."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Active Clients</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{summary.activeClients}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Live Projects</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{summary.liveProjects}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Overdue Tasks</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.danger }}>{summary.overdueTasks}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Average Progress</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{summary.averageProgress}%</div>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by project, client, owner, or task"
            className="w-full lg:max-w-md rounded px-3 py-2 text-sm"
            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded px-3 py-2 text-sm"
            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1200px] w-full text-sm" style={{ ...fontBody }}>
            <thead>
              <tr style={{ background: colors.primary, color: colors.neutral }}>
                {[
                  "Project ID",
                  "Client",
                  "Project",
                  "Stage",
                  "Main Task",
                  "Owner",
                  "Support",
                  "Priority",
                  "Status",
                  "Progress",
                  "Deadline",
                  "Approval",
                  "Overall",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const overallStatus = buildOverallStatus(row);
                const tone = rowTone(overallStatus);
                return (
                  <tr key={row.id} className="border-b" style={{ borderColor: colors.border }}>
                    <td className="px-3 py-2 whitespace-nowrap">{row.projectId}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.client}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.project}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.taskStage}</td>
                    <td className="px-3 py-2 min-w-[220px]">{row.mainTask}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.owner}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.support}</td>
                    <td className="px-3 py-2">
                      <select
                        value={row.priority}
                        onChange={(event) => updateRow(row.id, "priority", event.target.value)}
                        className="rounded px-2 py-1 text-xs"
                        style={{ border: `1px solid ${colors.border}` }}
                      >
                        {PRIORITY_OPTIONS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.status}
                        onChange={(event) => updateRow(row.id, "status", event.target.value)}
                        className="rounded px-2 py-1 text-xs"
                        style={{ border: `1px solid ${colors.border}` }}
                      >
                        {STATUS_OPTIONS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
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
                    <td className="px-3 py-2">
                      <select
                        value={row.approvalStatus}
                        onChange={(event) => updateRow(row.id, "approvalStatus", event.target.value)}
                        className="rounded px-2 py-1 text-xs"
                        style={{ border: `1px solid ${colors.border}` }}
                      >
                        {APPROVAL_OPTIONS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: tone.bg, color: tone.text }}>
                        {overallStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
