import React, { useMemo, useState } from "react";
import { Search, X, CheckCircle, Clock3, FileText } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { PROJECTS, PROJECT_DELIVERABLES, PROJECT_HISTORY } from "../lib/mockData";
import { getSession, getStoredTasks } from "../lib/teamData";
import { statusBadge } from "../lib/status";

const STATUS_FILTERS = [
  { key: "all", label: "All statuses" },
  { key: "on_track", label: "On Track" },
  { key: "at_risk", label: "At Risk" },
  { key: "overdue", label: "Overdue" },
];

function ProjectDetailDrawer({ project, tasks, deliverables, history, onClose }) {
  const badge = statusBadge(project.status);
  const completedDeliverables = deliverables.filter((item) => item.status === "complete").length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose} />
      <div className="relative w-full max-w-3xl h-full overflow-y-auto bg-white shadow-2xl">
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 style={{ ...fontDisplay, color: colors.primary }} className="text-3xl font-bold">{project.title}</h2>
              <div className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>
                {project.client} · {project.am}
              </div>
            </div>
            <button onClick={onClose} aria-label="Close project details" className="rounded-full p-2 hover:bg-slate-100">
              <X size={18} color={colors.primary} />
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
              <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Status</div>
              <div className="mt-2 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>{badge.label}</div>
            </div>
            <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
              <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Progress</div>
              <div className="mt-2 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>{project.progress}%</div>
            </div>
            <div className="rounded-xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
              <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Deliverables</div>
              <div className="mt-2 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>
                {completedDeliverables}/{deliverables.length} complete
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <section className="rounded-xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.primary, ...fontBody }}>
                <FileText size={16} /> Deliverables
              </div>
              <span className="text-xs uppercase font-semibold" style={{ color: colors.muted, ...fontBody }}>{project.priority} priority</span>
            </div>
            <div className="mt-4 space-y-3">
              {deliverables.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg p-4" style={{ background: item.status === "complete" ? "#F4F7F1" : "#FFFFFF", border: `1px solid ${colors.border}` }}>
                  <div>
                    <div className="font-semibold" style={{ color: colors.primary, ...fontBody }}>{item.title}</div>
                    <div className="text-xs mt-1" style={{ color: colors.muted, ...fontBody }}>{item.due}</div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: item.status === "complete" ? colors.onTrack : colors.secondary, color: colors.neutral }}>
                    {item.status === "complete" ? "Complete" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.primary, ...fontBody }}>
                <Clock3 size={16} /> Daily tasks
              </div>
              <span className="text-sm" style={{ ...fontBody, color: colors.muted }}>{tasks.length} tasks</span>
            </div>
            {tasks.length === 0 ? (
              <p className="mt-4 text-sm" style={{ color: colors.muted, ...fontBody }}>No daily tasks added yet; use the planner to assign work for this project.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-lg p-4" style={{ border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold" style={{ color: colors.primary, ...fontBody }}>{task.title}</div>
                      <span className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>{task.role}</span>
                    </div>
                    <p className="mt-2 text-sm" style={{ color: colors.muted, ...fontBody }}>{task.note || "No extra details."}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.primary, ...fontBody }}>
              <CheckCircle size={16} /> History
            </div>
            <div className="mt-4 space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-lg p-4" style={{ background: "#FFFFFF", border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center justify-between gap-3 text-sm" style={{ color: colors.muted, ...fontBody }}>
                    <span>{entry.time}</span>
                    <span>{entry.actor}</span>
                  </div>
                  <p className="mt-2" style={{ color: colors.primary, ...fontBody }}>{entry.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const session = getSession();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const visibleProjects = useMemo(() => {
    const base = session?.role === "AM" ? PROJECTS.filter((project) => project.am === session.name) : PROJECTS;
    return base.filter((project) => {
      const searchValue = query.toLowerCase().trim();
      const matchesQuery =
        project.title.toLowerCase().includes(searchValue) ||
        project.client.toLowerCase().includes(searchValue) ||
        project.am.toLowerCase().includes(searchValue);
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, session]);

  const selectedProject = selectedProjectId ? PROJECTS.find((project) => project.id === selectedProjectId) : null;
  const selectedDeliverables = selectedProject ? PROJECT_DELIVERABLES[selectedProject.id] || [] : [];
  const selectedHistory = selectedProject ? PROJECT_HISTORY[selectedProject.id] || [] : [];
  const selectedTasks = selectedProject ? getStoredTasks().filter((task) => task.projectId === selectedProject.id) : [];

  const summary = useMemo(() => {
    const total = visibleProjects.length;
    const onTrack = visibleProjects.filter((project) => project.status === "on_track").length;
    const atRisk = visibleProjects.filter((project) => project.status === "at_risk").length;
    const overdue = visibleProjects.filter((project) => project.status === "overdue").length;
    const avgProgress = total ? Math.round(visibleProjects.reduce((sum, project) => sum + project.progress, 0) / total) : 0;
    return { total, onTrack, atRisk, overdue, avgProgress };
  }, [visibleProjects]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl sm:text-3xl font-bold">
            {session?.role === "AM" ? "My Projects" : "Projects"}
          </h1>
          <p style={{ ...fontBody, color: colors.muted }} className="mt-2 max-w-2xl text-sm">
            {session?.role === "AM"
              ? "Track your assigned work, delivery status, and next milestones."
              : "Studio-level project portfolio and delivery status across clients."}
          </p>
        </div>

        <label className="flex items-center gap-2 rounded px-3 py-2 w-full sm:w-96" style={{ border: `1px solid ${colors.border}` }}>
          <Search size={16} color={colors.muted} />
          <input
            aria-label="Search projects"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, clients, or AM..."
            className="text-sm outline-none w-full"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Projects</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{summary.total}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>On Track</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.onTrack }}>{summary.onTrack}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>At Risk</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.secondary }}>{summary.atRisk}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Overdue</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.danger }}>{summary.overdue}</div>
        </div>
        <div className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Avg progress</div>
          <div className="mt-2 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{summary.avgProgress}%</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setStatusFilter(filter.key)}
            aria-pressed={statusFilter === filter.key}
            className="text-xs font-semibold px-3 py-2 rounded"
            style={{
              border: `1px solid ${colors.primary}`,
              background: statusFilter === filter.key ? colors.primary : "transparent",
              color: statusFilter === filter.key ? colors.neutral : colors.primary,
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleProjects.length === 0 ? (
          <div className="rounded-lg p-6" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <p style={{ ...fontBody, color: colors.muted }}>No matching projects found. Try a different search or filter.</p>
          </div>
        ) : (
          visibleProjects.map((project) => {
            const badge = statusBadge(project.status);
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                className="rounded-xl p-5 text-left transition-transform duration-200"
                style={{
                  background: colors.neutral,
                  border: `1px solid ${colors.border}`,
                  transform: "translateY(0px)",
                }}
                onMouseEnter={(event) => (event.currentTarget.style.transform = "translateY(-6px)")}
                onMouseLeave={(event) => (event.currentTarget.style.transform = "translateY(0px)")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 style={{ ...fontDisplay, color: colors.primary }} className="text-xl font-semibold">{project.title}</h2>
                    <div className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>
                      {project.client} · {project.am}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ color: colors.neutral, background: badge.color }}>
                    {badge.label}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Priority</div>
                    <div className="mt-1 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>{project.priority}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Progress</div>
                    <div className="mt-1 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>{project.progress}%</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Delivery</div>
                    <div className="mt-1 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>
                      {project.status === "overdue" ? "Needs immediate attention" : project.status === "at_risk" ? "At risk" : "On track"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-3 rounded-full" style={{ background: colors.tertiary }}>
                  <div className="h-3 rounded-full" style={{ width: `${project.progress}%`, background: badge.color }} />
                </div>
              </button>
            );
          })
        )}
      </div>

      {selectedProject && (
        <ProjectDetailDrawer
          project={selectedProject}
          tasks={selectedTasks}
          deliverables={selectedDeliverables}
          history={selectedHistory}
          onClose={() => setSelectedProjectId(null)}
        />
      )}
    </div>
  );
}
