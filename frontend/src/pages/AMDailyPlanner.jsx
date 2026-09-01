import React, { useEffect, useState } from "react";
import { fontBody, colors } from "../lib/theme";
import { getSession } from "../lib/teamData";
import { PROJECTS, PRODUCTION_ROLES } from "../lib/mockData";
import { getStoredTasks, saveStoredTasks } from "../lib/teamData";

export default function AMDailyPlanner() {
  const session = getSession();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [role, setRole] = useState(PRODUCTION_ROLES[0]?.name || "");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!session) return;
    const my = PROJECTS.filter((p) => p.am === session.name);
    setProjects(my);
    const all = getStoredTasks();
    setTasks(all);
    if (my[0]) setSelectedProject(my[0].id);
  }, [session]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!selectedProject) return alert("Please choose a project for the task.");
    if (!title.trim()) return alert("Please enter a task title.");
    const all = getStoredTasks();
    const newTask = { id: `task_${Date.now()}`, projectId: selectedProject, title: title.trim(), note: note.trim(), role, done: false, createdAt: new Date().toISOString(), createdBy: session?.id };
    const next = [newTask, ...all];
    saveStoredTasks(next);
    setTasks(next);
    setTitle("");
    setNote("");
  };

  const projectTasks = tasks.filter((t) => t.projectId === selectedProject);

  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Daily Planner</h1>
        <p style={{ ...fontBody, color: colors.muted }} className="mt-2">Please sign in to plan your day.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Daily Planner</h1>
      <p style={{ ...fontBody, color: colors.muted }} className="mt-2">Create and assign tasks for today; every task must belong to a project.</p>

      <form className="mt-4 space-y-3 max-w-2xl" onSubmit={handleAdd}>
        <div>
          <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Project</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title} — {p.client}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Task title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
        </div>
        <div>
          <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Assign role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }}>
            {PRODUCTION_ROLES.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded p-2 text-sm" rows={3} style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="submit" className="rounded px-3 py-2 text-sm font-semibold" style={{ background: colors.primary, color: colors.neutral }}>Add task</button>
        </div>
      </form>

      <div className="mt-6">
        <h3 style={{ ...fontBody, color: colors.primary }} className="text-lg">Tasks for selected project</h3>
        {projectTasks.length === 0 && <div style={{ ...fontBody, color: colors.muted }} className="mt-2">No tasks yet.</div>}
        <div className="mt-2 space-y-2">
          {projectTasks.map((t) => (
            <div key={t.id} className="rounded border p-3" style={{ borderColor: colors.border }}>
              <div className="font-semibold" style={{ color: colors.primary, ...fontBody }}>{t.title}</div>
              <div className="text-sm" style={{ color: colors.muted, ...fontBody }}>{t.role} · {t.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
