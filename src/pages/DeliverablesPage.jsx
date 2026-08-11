import React, { useState, useEffect, useMemo } from "react";
import { Package, User, Calendar, Clock, Link as LinkIcon, MessageSquare, Edit2, Save, X } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { getStoredDeliverables, saveStoredDeliverables } from "../lib/teamData";
import { ENHANCED_DELIVERABLES, PROJECTS, TEAM_MEMBERS } from "../lib/mockData";

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState({});
  const [editingDeliverable, setEditingDeliverable] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const stored = getStoredDeliverables();
    if (Object.keys(stored).length > 0) {
      setDeliverables(stored);
    } else {
      setDeliverables(ENHANCED_DELIVERABLES);
      saveStoredDeliverables(ENHANCED_DELIVERABLES);
    }
  }, []);

  const allDeliverables = useMemo(() => {
    const items = [];
    Object.keys(deliverables).forEach((projectId) => {
      const project = PROJECTS.find((p) => p.id === projectId);
      deliverables[projectId].forEach((deliverable) => {
        items.push({
          ...deliverable,
          projectId,
          projectTitle: project?.title || "Unknown Project",
          projectClient: project?.client || "Unknown Client",
        });
      });
    });
    return items;
  }, [deliverables]);

  const filteredDeliverables = useMemo(() => {
    return allDeliverables.filter((item) => {
      if (filterProject !== "all" && item.projectId !== filterProject) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      return true;
    });
  }, [allDeliverables, filterProject, filterStatus]);

  const stats = useMemo(() => {
    const total = allDeliverables.length;
    const completed = allDeliverables.filter((d) => d.status === "complete").length;
    const pending = allDeliverables.filter((d) => d.status === "pending").length;
    const overdue = allDeliverables.filter((d) => {
      if (d.status === "complete") return false;
      const dueDateTime = new Date(`${d.dueDate}T${d.dueTime}`);
      return dueDateTime < new Date();
    }).length;
    return { total, completed, pending, overdue };
  }, [allDeliverables]);

  const handleEdit = (deliverable) => {
    setEditingDeliverable(deliverable.id);
    setEditForm({
      assignedTo: deliverable.assignedTo,
      assignedToId: deliverable.assignedToId,
      dueDate: deliverable.dueDate,
      dueTime: deliverable.dueTime,
    });
  };

  const handleSave = (deliverable) => {
    const updated = { ...deliverables };
    updated[deliverable.projectId] = updated[deliverable.projectId].map((d) => {
      if (d.id === deliverable.id) {
        return { ...d, ...editForm };
      }
      return d;
    });
    setDeliverables(updated);
    saveStoredDeliverables(updated);
    setEditingDeliverable(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingDeliverable(null);
    setEditForm({});
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl sm:text-3xl font-bold">
            Deliverables Management
          </h1>
          <p style={{ ...fontBody, color: colors.muted }} className="mt-2 max-w-2xl text-sm">
            Track, assign, and manage all project deliverables. Reschedule or reassign as needed.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>
            Total Deliverables
          </div>
          <div className="mt-2 text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>
            {stats.total}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>
            Completed
          </div>
          <div className="mt-2 text-2xl font-semibold" style={{ ...fontBody, color: colors.onTrack }}>
            {stats.completed}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>
            Pending
          </div>
          <div className="mt-2 text-2xl font-semibold" style={{ ...fontBody, color: colors.warn }}>
            {stats.pending}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>
            Overdue
          </div>
          <div className="mt-2 text-2xl font-semibold" style={{ ...fontBody, color: colors.danger }}>
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-xs uppercase font-semibold mb-2 block" style={{ ...fontBody, color: colors.muted }}>
            Filter by Project
          </label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="rounded px-3 py-2 text-sm"
            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
          >
            <option value="all">All Projects</option>
            {PROJECTS.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase font-semibold mb-2 block" style={{ ...fontBody, color: colors.muted }}>
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded px-3 py-2 text-sm"
            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="space-y-3">
        {filteredDeliverables.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <Package size={48} color={colors.muted} className="mx-auto mb-3 opacity-30" />
            <p style={{ ...fontBody, color: colors.muted }}>No deliverables match your filters</p>
          </div>
        ) : (
          filteredDeliverables.map((deliverable) => {
            const isEditing = editingDeliverable === deliverable.id;
            const dueDateTime = new Date(`${deliverable.dueDate}T${deliverable.dueTime}`);
            const isOverdue = deliverable.status !== "complete" && dueDateTime < new Date();

            return (
              <div
                key={`${deliverable.projectId}-${deliverable.id}`}
                className="rounded-xl p-5"
                style={{
                  background: colors.neutral,
                  border: `1px solid ${isOverdue ? colors.danger : colors.border}`,
                }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Title and Project */}
                    <div>
                      <div className="text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>
                        {deliverable.title}
                      </div>
                      <div className="text-xs mt-1" style={{ ...fontBody, color: colors.muted }}>
                        {deliverable.projectTitle} • {deliverable.projectClient}
                      </div>
                    </div>

                    {/* Assignment and Timing */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <User size={14} color={colors.muted} />
                        {isEditing ? (
                          <select
                            value={editForm.assignedToId || ""}
                            onChange={(e) => {
                              const member = TEAM_MEMBERS.find((m) => m.id === e.target.value);
                              setEditForm({ ...editForm, assignedToId: e.target.value, assignedTo: member?.name || "" });
                            }}
                            className="flex-1 rounded px-2 py-1 text-xs"
                            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
                          >
                            {TEAM_MEMBERS.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs" style={{ ...fontBody, color: colors.primary }}>
                            {deliverable.assignedTo}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={14} color={colors.muted} />
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.dueDate || ""}
                            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                            className="flex-1 rounded px-2 py-1 text-xs"
                            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
                          />
                        ) : (
                          <span className="text-xs" style={{ ...fontBody, color: colors.primary }}>
                            {new Date(deliverable.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={14} color={colors.muted} />
                        {isEditing ? (
                          <input
                            type="time"
                            value={editForm.dueTime || ""}
                            onChange={(e) => setEditForm({ ...editForm, dueTime: e.target.value })}
                            className="flex-1 rounded px-2 py-1 text-xs"
                            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
                          />
                        ) : (
                          <span className="text-xs" style={{ ...fontBody, color: colors.primary }}>
                            {deliverable.dueTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            background: deliverable.status === "complete" ? colors.onTrack : colors.warn,
                            color: colors.neutral,
                            ...fontBody,
                          }}
                        >
                          {deliverable.status === "complete" ? "Complete" : "Pending"}
                        </span>
                        {isOverdue && (
                          <span className="text-xs font-semibold" style={{ color: colors.danger, ...fontBody }}>
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Submission Link and Comment */}
                    {deliverable.status === "complete" && (
                      <div className="space-y-2">
                        {deliverable.submissionLink && (
                          <div className="flex items-start gap-2">
                            <LinkIcon size={14} color={colors.primary} className="flex-shrink-0 mt-0.5" />
                            <a
                              href={deliverable.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline break-all"
                              style={{ ...fontBody, color: colors.primary }}
                            >
                              {deliverable.submissionLink}
                            </a>
                          </div>
                        )}
                        {deliverable.completionComment && (
                          <div className="flex items-start gap-2 rounded p-2" style={{ background: colors.tertiary }}>
                            <MessageSquare size={14} color={colors.muted} className="flex-shrink-0 mt-0.5" />
                            <span className="text-xs" style={{ ...fontBody, color: colors.muted }}>
                              {deliverable.completionComment}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(deliverable)}
                          className="flex items-center gap-1 rounded px-3 py-2 text-xs font-semibold"
                          style={{ background: colors.primary, color: colors.neutral, ...fontBody }}
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-1 rounded px-3 py-2 text-xs font-semibold"
                          style={{ border: `1px solid ${colors.border}`, ...fontBody, color: colors.muted }}
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(deliverable)}
                        className="flex items-center gap-1 rounded px-3 py-2 text-xs font-semibold"
                        style={{ border: `1px solid ${colors.primary}`, color: colors.primary, ...fontBody }}
                      >
                        <Edit2 size={14} />
                        Reassign / Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
