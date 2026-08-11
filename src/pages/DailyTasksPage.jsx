import React, { useState, useEffect, useMemo } from "react";
import { Plus, CheckCircle, Clock, Calendar, MessageSquare } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { getSession, getStoredDailyTasks, saveStoredDailyTasks } from "../lib/teamData";
import { INITIAL_DAILY_TASKS } from "../lib/mockData";

export default function DailyTasksPage() {
  const session = getSession();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const stored = getStoredDailyTasks();
    if (stored.length > 0) {
      setTasks(stored);
    } else {
      setTasks(INITIAL_DAILY_TASKS);
      saveStoredDailyTasks(INITIAL_DAILY_TASKS);
    }
  }, []);

  const myTodayTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.employeeName === session?.name && task.date === today
    );
  }, [tasks, session, today]);

  const handleAddTask = () => {
    if (!newTask.trim()) {
      setStatusMessage("Please enter a task description");
      return;
    }

    const task = {
      id: `dt_${Date.now()}`,
      employeeId: session?.id || `tm_${session?.name}`,
      employeeName: session?.name || "Unknown",
      date: today,
      task: newTask.trim(),
      status: "in-progress",
      comment: "",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    const updated = [task, ...tasks];
    setTasks(updated);
    saveStoredDailyTasks(updated);
    setNewTask("");
    setStatusMessage("Task added successfully");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  const handleToggleStatus = (taskId) => {
    const updated = tasks.map((task) => {
      if (task.id === taskId) {
        const newStatus = task.status === "done" ? "in-progress" : "done";
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === "done" ? new Date().toISOString() : null,
        };
      }
      return task;
    });
    setTasks(updated);
    saveStoredDailyTasks(updated);
  };

  const handleSaveComment = (taskId) => {
    const updated = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, comment: commentText.trim() };
      }
      return task;
    });
    setTasks(updated);
    saveStoredDailyTasks(updated);
    setEditingComment(null);
    setCommentText("");
  };

  const handleEditComment = (task) => {
    setEditingComment(task.id);
    setCommentText(task.comment || "");
  };

  const completedCount = myTodayTasks.filter((t) => t.status === "done").length;
  const inProgressCount = myTodayTasks.filter((t) => t.status === "in-progress").length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl sm:text-3xl font-bold">
            Daily Tasks
          </h1>
          <p style={{ ...fontBody, color: colors.muted }} className="mt-2 max-w-2xl text-sm">
            Add your tasks in the morning and check them off throughout the day. Update status and add comments for transparency.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ ...fontBody, color: colors.muted }}>
          <Calendar size={16} />
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>
            Total Tasks
          </div>
          <div className="mt-2 text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>
            {myTodayTasks.length}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>
            Completed
          </div>
          <div className="mt-2 text-2xl font-semibold" style={{ ...fontBody, color: colors.onTrack }}>
            {completedCount}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>
            In Progress
          </div>
          <div className="mt-2 text-2xl font-semibold" style={{ ...fontBody, color: colors.warn }}>
            {inProgressCount}
          </div>
        </div>
      </div>

      {/* Add New Task */}
      <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: colors.primary, ...fontBody }}>
          <Plus size={18} /> Add New Task
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="What are you working on today?"
            className="flex-1 rounded p-3 text-sm"
            style={{ border: `1px solid ${colors.border}`, ...fontBody }}
          />
          <button
            onClick={handleAddTask}
            className="rounded px-4 py-3 text-sm font-semibold"
            style={{ background: colors.primary, color: colors.neutral, ...fontBody }}
          >
            Add Task
          </button>
        </div>
        {statusMessage && (
          <div className="mt-3 text-sm" style={{ ...fontBody, color: colors.onTrack }}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <h2 className="text-lg font-semibold mb-4" style={{ ...fontDisplay, color: colors.primary }}>
          Today's Tasks
        </h2>
        {myTodayTasks.length === 0 ? (
          <div className="text-center py-8" style={{ ...fontBody, color: colors.muted }}>
            <Clock size={48} className="mx-auto mb-3 opacity-30" />
            <p>No tasks added yet. Start your day by adding tasks above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTodayTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl p-4"
                style={{
                  background: task.status === "done" ? `${colors.onTrack}10` : colors.tertiary,
                  border: `1px solid ${task.status === "done" ? colors.onTrack : colors.border}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task.id)}
                    className="flex-shrink-0 mt-1"
                    aria-label={task.status === "done" ? "Mark as in progress" : "Mark as done"}
                  >
                    {task.status === "done" ? (
                      <CheckCircle size={20} color={colors.onTrack} />
                    ) : (
                      <Clock size={20} color={colors.warn} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${task.status === "done" ? "line-through" : ""}`}
                      style={{ ...fontBody, color: colors.primary }}
                    >
                      {task.task}
                    </div>
                    <div className="mt-1 text-xs" style={{ ...fontBody, color: colors.muted }}>
                      {task.status === "done" ? "Completed" : "In Progress"} •{" "}
                      {new Date(task.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* Comment Section */}
                    {editingComment === task.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={2}
                          placeholder="Add a comment about this task..."
                          className="w-full rounded p-2 text-sm"
                          style={{ border: `1px solid ${colors.border}`, ...fontBody }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveComment(task.id)}
                            className="rounded px-3 py-1 text-xs font-semibold"
                            style={{ background: colors.primary, color: colors.neutral, ...fontBody }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setCommentText("");
                            }}
                            className="rounded px-3 py-1 text-xs font-semibold"
                            style={{ border: `1px solid ${colors.border}`, ...fontBody, color: colors.muted }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : task.comment ? (
                      <div
                        className="mt-3 rounded-lg p-2 text-xs"
                        style={{ background: colors.neutral, border: `1px solid ${colors.border}`, ...fontBody }}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare size={12} color={colors.muted} className="flex-shrink-0 mt-0.5" />
                          <span style={{ color: colors.muted }}>{task.comment}</span>
                        </div>
                        <button
                          onClick={() => handleEditComment(task)}
                          className="mt-2 text-xs underline"
                          style={{ color: colors.primary }}
                        >
                          Edit comment
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditComment(task)}
                        className="mt-2 text-xs flex items-center gap-1"
                        style={{ color: colors.primary, ...fontBody }}
                      >
                        <MessageSquare size={12} />
                        Add comment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
