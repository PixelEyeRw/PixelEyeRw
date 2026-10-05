import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, AlertTriangle, BriefcaseBusiness, CircleDollarSign, ClipboardCheck, Users } from "lucide-react";
import { apiGet } from "../lib/teamData";
import { colors, fontBody, fontDisplay } from "../lib/theme";

function isOpenStatus(status) {
  return !["completed", "complete", "delivered", "cancelled", "done"].includes(String(status || "").toLowerCase());
}

function isOverdue(item) {
  if (!item.deadline || !isOpenStatus(item.status)) return false;
  return new Date(`${item.deadline.slice(0, 10)}T23:59:59`) < new Date();
}

export default function DirectorDashboardPage({ onNavigate }) {
  const [data, setData] = useState({ users: [], projects: [], clients: [], projectTasks: [], dailyTasks: [], submissions: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet("/accounts"),
      apiGet("/om/projects"),
      apiGet("/om/clients"),
      apiGet("/om/tasks"),
      apiGet("/daily-tasks"),
      apiGet("/am/project-submissions"),
    ])
      .then(([users, projects, clients, projectTasks, dailyTasks, submissions]) => {
        setData({ users, projects, clients, projectTasks, dailyTasks, submissions });
      })
      .catch((requestError) => setError(requestError.message || "Could not load company data."));
  }, []);

  const summary = useMemo(() => {
    const openProjects = data.projects.filter((project) => isOpenStatus(project.status));
    const pendingSubmissions = data.submissions.filter((submission) => submission.status === "Pending Review");
    const allTasks = [...data.projectTasks, ...data.dailyTasks];
    const overdueTasks = allTasks.filter(isOverdue);
    const revenue = data.projects.reduce((sum, project) => sum + (Number(project.revenueSource) || 0), 0);
    const cost = data.projects.reduce((sum, project) => sum + (Number(project.costSource) || 0), 0);
    return {
      openProjects,
      pendingSubmissions,
      overdueTasks,
      revenue,
      cost,
      profit: revenue - cost,
    };
  }, [data]);

  const teamRows = useMemo(() => data.users.map((user) => {
    const projectCount = data.projects.filter((project) => project.am === user.name).length;
    const assignedTasks = [...data.projectTasks, ...data.dailyTasks].filter((task) => (
      task.owner === user.name || task.employeeName === user.name || task.assignedTo === user.name
    )).length;
    return { ...user, projectCount, assignedTasks };
  }), [data]);

  const priorityProjects = summary.openProjects
    .slice()
    .sort((left, right) => Number(isOverdue(right)) - Number(isOverdue(left)) || Number(right.progress) - Number(left.progress))
    .slice(0, 6);

  return (
    <main className="p-4 sm:p-6 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase" style={{ color: colors.secondary, ...fontBody }}>Director · Company-wide</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold" style={{ color: colors.primary, ...fontDisplay }}>Company Control Center</h1>
          <p className="mt-2 text-sm" style={{ color: colors.muted, ...fontBody }}>People, delivery, approvals, and financial exposure from live workspace data.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => onNavigate("intake")} label="Review intake" />
          <ActionButton onClick={() => onNavigate("task-board")} label="Team tasks" />
          <ActionButton onClick={() => onNavigate("workload")} label="Workload" />
          <ActionButton onClick={() => onNavigate("financials")} label="Financials" />
          <ActionButton onClick={() => onNavigate("settings")} label="People & access" />
        </div>
      </header>

      {error && <p className="text-sm" role="alert" style={{ color: colors.danger, ...fontBody }}>{error}</p>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Users} label="Team members" value={data.users.length} />
        <Metric icon={BriefcaseBusiness} label="Open projects" value={summary.openProjects.length} />
        <Metric icon={ClipboardCheck} label="Awaiting approval" value={summary.pendingSubmissions.length} />
        <Metric icon={AlertTriangle} label="Overdue tasks" value={summary.overdueTasks.length} tone={summary.overdueTasks.length ? colors.danger : colors.onTrack} />
        <Metric icon={CircleDollarSign} label="Recorded profit" value={`RWF ${summary.profit.toLocaleString()}`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="overflow-hidden rounded-lg border" style={{ borderColor: colors.border, background: colors.neutral }}>
          <div className="flex items-center justify-between border-b p-4" style={{ borderColor: colors.border }}>
            <div>
              <h2 className="font-semibold" style={{ color: colors.primary, ...fontBody }}>People and workload</h2>
              <p className="mt-1 text-xs" style={{ color: colors.muted, ...fontBody }}>Current assignments by employee and access role.</p>
            </div>
            <button onClick={() => onNavigate("settings")} className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: colors.secondary, ...fontBody }}>Manage <ArrowRight size={14} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead><tr className="text-xs uppercase" style={{ color: colors.muted, ...fontBody }}><th className="p-3">Employee</th><th className="p-3">System role</th><th className="p-3">Projects</th><th className="p-3">Tasks</th></tr></thead>
              <tbody>
                {teamRows.map((user) => (
                  <tr key={user.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                    <td className="p-3 font-semibold" style={{ color: colors.primary }}>{user.name}</td>
                    <td className="p-3" style={{ color: colors.muted }}>{user.role}</td>
                    <td className="p-3" style={{ color: colors.muted }}>{user.projectCount}</td>
                    <td className="p-3" style={{ color: colors.muted }}>{user.assignedTasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border" style={{ borderColor: colors.border, background: colors.neutral }}>
          <div className="flex items-center justify-between border-b p-4" style={{ borderColor: colors.border }}>
            <div>
              <h2 className="font-semibold" style={{ color: colors.primary, ...fontBody }}>Projects needing attention</h2>
              <p className="mt-1 text-xs" style={{ color: colors.muted, ...fontBody }}>Open projects, prioritized by overdue delivery and progress.</p>
            </div>
            <button onClick={() => onNavigate("projects")} className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: colors.secondary, ...fontBody }}>All projects <ArrowRight size={14} /></button>
          </div>
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {priorityProjects.length === 0 && <p className="p-4 text-sm" style={{ color: colors.muted, ...fontBody }}>No open projects.</p>}
            {priorityProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold" style={{ color: colors.primary, ...fontBody }}>{project.title}</div>
                  <div className="mt-1 text-xs" style={{ color: colors.muted, ...fontBody }}>{project.client} · {project.am || "Unassigned"}</div>
                </div>
                <span className="shrink-0 text-xs font-semibold" style={{ color: project.status === "overdue" ? colors.danger : colors.muted }}>{project.progress}% · {project.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Metric label="Client portfolio" value={data.clients.length} detail="Active client records" />
        <Metric label="Project revenue" value={`RWF ${summary.revenue.toLocaleString()}`} detail={`Recorded costs: RWF ${summary.cost.toLocaleString()}`} />
      </section>
    </main>
  );
}

function ActionButton({ label, onClick }) {
  return <button onClick={onClick} className="rounded border px-3 py-2 text-sm font-semibold" style={{ borderColor: colors.border, color: colors.primary, ...fontBody }}>{label}</button>;
}

function Metric({ icon: Icon, label, value, detail, tone }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: colors.border, background: colors.neutral }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase" style={{ color: colors.muted, ...fontBody }}>{label}</span>
        {Icon && <Icon size={16} color={tone || colors.secondary} />}
      </div>
      <div className="mt-2 text-xl font-semibold" style={{ color: tone || colors.primary, ...fontBody }}>{value}</div>
      {detail && <div className="mt-1 text-xs" style={{ color: colors.muted, ...fontBody }}>{detail}</div>}
    </div>
  );
}
