import React, { useMemo, useState } from "react";
import { colors, fontBody, fontDisplay } from "../lib/theme";
import { getSession, getStoredDailyTasks, saveStoredDailyTasks } from "../lib/teamData";
import { CheckCircle, Clock, Plus, X, ExternalLink, MessageSquare, Briefcase } from "lucide-react";
import { PROJECTS } from "../lib/mockData";

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
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [completionComment, setCompletionComment] = useState("");
  const [completionLink, setCompletionLink] = useState("");

  // Get current user session
  const session = getSession();
  const isOM = session?.role === "Operations Manager";
  const currentUser = session?.name;
  const currentUserId = session?.email || currentUser;

  // Get daily tasks from localStorage
  const dailyTasks = useMemo(() => {
    if (typeof window === "undefined") return [];
    return getStoredDailyTasks();
  }, []);

  // Filter daily tasks for current user
  const myDailyTasks = useMemo(() => {
    if (isOM) return dailyTasks; // OM sees all
    return dailyTasks.filter((task) => task.employeeName === currentUser || task.employeeId === currentUserId);
  }, [dailyTasks, currentUser, currentUserId, isOM]);

  // Separate active and completed tasks
  const activeTasks = useMemo(() => {
    return myDailyTasks.filter((task) => task.status !== "done");
  }, [myDailyTasks]);

  const completedTasks = useMemo(() => {
    return myDailyTasks
      .filter((task) => task.status === "done")
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }, [myDailyTasks]);

  // Filter by owner for non-OM users (for project tasks)
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
    const total = activeTasks.length;
    const completed = completedTasks.length;
    const inProgress = activeTasks.filter((t) => t.status === "in-progress").length;
    
    return { total, completed, inProgress };
  }, [activeTasks, completedTasks]);

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    if (!selectedProjectId) {
      alert("Please select a project for this task.");
      return;
    }
    
    const selectedProject = PROJECTS.find((p) => p.id === selectedProjectId);
    
    const newTask = {
      id: `dt_${Date.now()}`,
      employeeId: currentUserId,
      employeeName: currentUser,
      date: new Date().toISOString().split("T")[0],
      task: newTaskText.trim(),
      projectId: selectedProjectId,
      projectName: selectedProject ? selectedProject.title : "",
      status: "in-progress",
      comment: "",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    const allTasks = getStoredDailyTasks();
    saveStoredDailyTasks([...allTasks, newTask]);
    setNewTaskText("");
    setSelectedProjectId("");
    window.location.reload(); // Refresh to show new task
  };

  const handleStartCompleting = (taskId) => {
    setCompletingTaskId(taskId);
    setCompletionComment("");
    setCompletionLink("");
  };

  const handleCancelCompleting = () => {
    setCompletingTaskId(null);
    setCompletionComment("");
    setCompletionLink("");
  };

  const handleConfirmComplete = () => {
    if (!completionComment.trim() && !completionLink.trim()) {
      alert("Please provide either a comment or a link before marking as done.");
      return;
    }

    const allTasks = getStoredDailyTasks();
    const updatedTasks = allTasks.map((task) => {
      if (task.id === completingTaskId) {
        return {
          ...task,
          status: "done",
          comment: completionComment.trim() || task.comment,
          submissionLink: completionLink.trim(),
          completedAt: new Date().toISOString(),
        };
      }
      return task;
    });

    saveStoredDailyTasks(updatedTasks);
    setCompletingTaskId(null);
    setCompletionComment("");
    setCompletionLink("");
    window.location.reload(); // Refresh to show updated tasks
  };

  const handleDeleteTask = (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    const allTasks = getStoredDailyTasks();
    const updatedTasks = allTasks.filter((task) => task.id !== taskId);
    saveStoredDailyTasks(updatedTasks);
    window.location.reload(); // Refresh to show updated list
  };

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
          {isOM ? "Team Daily Tasks" : "My Daily Tasks"}
        </h1>
        <p className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>
          {isOM 
            ? "View and monitor all team member daily tasks and their progress."
            : "Add your daily tasks, track your progress, and mark them complete with updates."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Active Tasks</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{summary.total}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>In Progress</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.warn }}>{summary.inProgress}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Completed Today</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.onTrack }}>{summary.completed}</div>
        </div>
      </div>

      {/* Add New Task Section */}
      {!isOM && (
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <h3 className="text-sm font-semibold mb-3" style={{ ...fontBody, color: colors.primary }}>Add New Task</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ ...fontBody, color: colors.primary }}>
                Select Project *
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded px-3 py-2 text-sm"
                style={{ border: `1px solid ${colors.border}`, ...fontBody }}
              >
                <option value="">-- Choose a project --</option>
                {PROJECTS.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title} ({project.client})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ ...fontBody, color: colors.primary }}>
                Task Description *
              </label>
              <div className="flex gap-2">
                <input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask();
                  }}
                  placeholder="What are you working on today?"
                  className="flex-1 rounded px-3 py-2 text-sm"
                  style={{ border: `1px solid ${colors.border}`, ...fontBody }}
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskText.trim() || !selectedProjectId}
                  className="flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold"
                  style={{
                    background: (newTaskText.trim() && selectedProjectId) ? colors.primary : colors.border,
                    color: colors.neutral,
                    ...fontBody,
                    opacity: (newTaskText.trim() && selectedProjectId) ? 1 : 0.5,
                    cursor: (newTaskText.trim() && selectedProjectId) ? "pointer" : "not-allowed",
                  }}
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Tasks List */}
      <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <h3 className="text-lg font-semibold mb-4" style={{ ...fontBody, color: colors.primary }}>
          {isOM ? "Active Team Tasks" : "My Active Tasks"} ({activeTasks.length})
        </h3>
        <div className="space-y-3">
          {activeTasks.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ ...fontBody, color: colors.muted }}>
              {isOM ? "No active tasks from team members" : "No active tasks. Add your first task above!"}
            </p>
          ) : (
            activeTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg p-4"
                style={{ background: "#FAF9F6", border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} color={colors.warn} />
                      <span className="text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>
                        {task.task}
                      </span>
                    </div>
                    {task.projectName && (
                      <div className="flex items-center gap-1 mb-2">
                        <Briefcase size={12} color={colors.muted} />
                        <span className="text-xs font-semibold" style={{ ...fontBody, color: colors.muted }}>
                          {task.projectName}
                        </span>
                      </div>
                    )}
                    {isOM && (
                      <div className="text-xs mb-2" style={{ ...fontBody, color: colors.muted }}>
                        <strong>{task.employeeName}</strong> • {new Date(task.createdAt).toLocaleString()}
                      </div>
                    )}
                    {!isOM && (
                      <div className="text-xs mb-2" style={{ ...fontBody, color: colors.muted }}>
                        Added: {new Date(task.createdAt).toLocaleString()}
                      </div>
                    )}
                    
                    {completingTaskId === task.id ? (
                      <div className="mt-3 space-y-2">
                        <div>
                          <label className="text-xs font-semibold block mb-1" style={{ ...fontBody, color: colors.primary }}>
                            Comment / Update *
                          </label>
                          <textarea
                            value={completionComment}
                            onChange={(e) => setCompletionComment(e.target.value)}
                            placeholder="Describe what you completed or any notes..."
                            rows={2}
                            className="w-full rounded px-3 py-2 text-sm"
                            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold block mb-1" style={{ ...fontBody, color: colors.primary }}>
                            Link (optional)
                          </label>
                          <input
                            value={completionLink}
                            onChange={(e) => setCompletionLink(e.target.value)}
                            placeholder="https://... (link to deliverable, document, etc.)"
                            className="w-full rounded px-3 py-2 text-sm"
                            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleConfirmComplete}
                            className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold"
                            style={{ background: colors.onTrack, color: colors.neutral, ...fontBody }}
                          >
                            <CheckCircle size={14} /> Confirm Complete
                          </button>
                          <button
                            onClick={handleCancelCompleting}
                            className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold"
                            style={{ border: `1px solid ${colors.border}`, color: colors.primary, ...fontBody }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        {!isOM && (
                          <>
                            <button
                              onClick={() => handleStartCompleting(task.id)}
                              className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold"
                              style={{ background: colors.onTrack, color: colors.neutral, ...fontBody }}
                            >
                              <CheckCircle size={14} /> Mark as Done
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold"
                              style={{ border: `1px solid ${colors.danger}`, color: colors.danger, ...fontBody }}
                            >
                              <X size={14} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Tasks History */}
      {completedTasks.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <h3 className="text-lg font-semibold mb-4" style={{ ...fontBody, color: colors.primary }}>
            Completed History ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg p-4"
                style={{ background: "#EAF6EE", border: `1px solid ${colors.onTrack}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} color={colors.onTrack} />
                      <span className="text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>
                        {task.task}
                      </span>
                    </div>
                    {task.projectName && (
                      <div className="flex items-center gap-1 mb-2">
                        <Briefcase size={12} color={colors.muted} />
                        <span className="text-xs font-semibold" style={{ ...fontBody, color: colors.muted }}>
                          {task.projectName}
                        </span>
                      </div>
                    )}
                    {isOM && (
                      <div className="text-xs mb-2" style={{ ...fontBody, color: colors.muted }}>
                        <strong>{task.employeeName}</strong>
                      </div>
                    )}
                    <div className="text-xs mb-2" style={{ ...fontBody, color: colors.muted }}>
                      Completed: {task.completedAt ? new Date(task.completedAt).toLocaleString() : "N/A"}
                    </div>
                    {task.comment && (
                      <div className="mt-2 p-2 rounded text-xs" style={{ background: "#fff", border: `1px solid ${colors.border}`, ...fontBody }}>
                        <div className="flex items-center gap-1 mb-1" style={{ color: colors.muted }}>
                          <MessageSquare size={12} />
                          <span className="font-semibold">Comment:</span>
                        </div>
                        {task.comment}
                      </div>
                    )}
                    {task.submissionLink && (
                      <div className="mt-2">
                        <a
                          href={task.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: colors.primary, ...fontBody }}
                        >
                          <ExternalLink size={12} />
                          View Submission
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
