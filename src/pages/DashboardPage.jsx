import React, { useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  Archive,
  RefreshCcw,
  Activity,
  ArrowRight,
  ArrowDownRight,
} from "lucide-react";
import { fontBody, fontDisplay, colors } from "../lib/theme";
import { capacityStatus } from "../lib/status";

export default function DashboardPage({ ams = [], deleted = [], taskRows = [], onNewIntake = () => {}, onRestore = () => {}, onReassign = () => {} }) {
  const summary = useMemo(() => {
    const totalProjects = ams.reduce((sum, am) => sum + am.activeProjects, 0);
    const statusCounts = ams.reduce(
      (counts, am) => {
        const pct = am.activeProjects / am.capacityMax;
        if (pct >= 1) counts.overloaded += 1;
        if (pct >= 0.85 && pct < 1) counts.highLoad += 1;
        return counts;
      },
      { overloaded: 0, highLoad: 0 }
    );
    const averageLoad = ams.length ? Math.round((totalProjects / ams.reduce((sum, am) => sum + am.capacityMax, 0)) * 100) : 0;
    return {
      totalAms: ams.length,
      totalProjects,
      overloaded: statusCounts.overloaded,
      highLoad: statusCounts.highLoad,
      averageLoad,
    };
  }, [ams]);

  const liveSummary = useMemo(() => {
    if (!taskRows.length) {
      return {
        activeClients: ams.reduce((sum, am) => sum + am.clients, 0),
        liveProjects: summary.totalProjects,
        overdueTasks: 0,
        averageProgress: 0,
      };
    }
    const activeClients = new Set(taskRows.map((row) => row.client)).size;
    const liveProjects = new Set(taskRows.map((row) => row.projectId)).size;
    const now = new Date();
    const overdueTasks = taskRows.filter((row) => {
      const deadline = new Date(row.deadline);
      return !Number.isNaN(deadline.getTime()) && deadline < now && Number(row.progress) < 100 && row.status !== "Cancelled";
    }).length;
    const averageProgress = Math.round(taskRows.reduce((sum, row) => sum + (Number(row.progress) || 0), 0) / taskRows.length);
    return { activeClients, liveProjects, overdueTasks, averageProgress };
  }, [taskRows, ams, summary.totalProjects]);

  const handleIntakeClick = () => {
    onNewIntake();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.secondary, ...fontBody }}>
            <LayoutDashboard size={18} /> Operations overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2" style={{ ...fontDisplay, color: colors.primary }}>Operations Manager dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ ...fontBody, color: colors.muted }}>
            Monitor account manager loads, flag production bottlenecks, and keep the studio moving with clear priorities.
          </p>
        </div>
        <button
          type="button"
          onClick={handleIntakeClick}
          className="inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold"
          style={{ background: colors.primary, color: colors.neutral, ...fontBody }}
        >
          <RefreshCcw size={16} /> New intake
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Active clients</div>
          <div className="mt-4 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{liveSummary.activeClients}</div>
          <div className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>Derived from current task sheet</div>
        </div>
        <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Live projects</div>
          <div className="mt-4 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{liveSummary.liveProjects}</div>
          <div className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>In flight now</div>
        </div>
        <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Overdue tasks</div>
          <div className="mt-4 text-3xl font-bold" style={{ ...fontBody, color: colors.danger }}>{liveSummary.overdueTasks}</div>
          <div className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>Past deadline and not complete</div>
        </div>
        <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Average progress</div>
          <div className="mt-4 text-3xl font-bold" style={{ ...fontBody, color: colors.primary }}>{liveSummary.averageProgress}%</div>
          <div className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>Across all current tasks</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ ...fontBody, color: colors.primary }}>Account manager capacity</h2>
              <p className="text-sm" style={{ ...fontBody, color: colors.muted }}>Spot overloaded managers and move work before deadlines slip.</p>
            </div>
            <div className="text-sm font-semibold" style={{ ...fontBody, color: colors.muted }}>{summary.averageLoad}% avg load</div>
          </div>

          <div className="space-y-4">
            {ams.map((am) => {
              const pct = am.activeProjects / am.capacityMax;
              const status = capacityStatus(pct);
              return (
                <div key={am.id} className="rounded-2xl p-4" style={{ background: colors.tertiary, border: `1px solid ${colors.border}` }}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>{am.name}</div>
                      <div className="text-xs" style={{ ...fontBody, color: colors.muted }}>{am.title}</div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: status.color, color: colors.neutral, ...fontBody }}>
                      <Activity size={12} /> {status.label}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl p-3" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
                      <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Active projects</div>
                      <div className="mt-2 text-lg font-semibold" style={{ ...fontBody, color: colors.primary }}>{am.activeProjects}/{am.capacityMax}</div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
                      <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Clients</div>
                      <div className="mt-2 text-lg font-semibold" style={{ ...fontBody, color: colors.primary }}>{am.clients}</div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: colors.border }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 1) * 100}%`, background: status.color }} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onReassign(am)}
                      className="rounded px-3 py-2 text-xs font-semibold"
                      style={{ background: colors.primary, color: colors.neutral, ...fontBody }}
                    >
                      Reassign work
                    </button>
                    <button
                      type="button"
                      onClick={() => onRestore(am.id)}
                      className="rounded border px-3 py-2 text-xs font-semibold"
                      style={{ borderColor: colors.border, color: colors.primary, ...fontBody }}
                    >
                      Audit workload
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>
              <Archive size={16} /> Recent operations history
            </div>
            <p className="text-sm" style={{ ...fontBody, color: colors.muted }}>Latest updates from the operations team and key change events.</p>
            <div className="mt-4 space-y-3">
              { deleted.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl p-3" style={{ background: colors.tertiary, border: `1px solid ${colors.border}` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>{item.task}</div>
                      <div className="text-xs" style={{ ...fontBody, color: colors.muted }}>{item.actor} · {item.timestamp}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRestore(item.id)}
                      className="rounded px-3 py-2 text-xs font-semibold"
                      style={{ background: colors.primary, color: colors.neutral, ...fontBody }}
                    >
                      Restore
                    </button>
                  </div>
                  <div className="mt-3 text-xs" style={{ ...fontBody, color: colors.muted }}>Reason: {item.reason}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>
              <ArrowRight size={16} /> Quick operations updates
            </div>
            <p className="text-sm" style={{ ...fontBody, color: colors.muted }}>Manage intake, assign bandwidth, and keep your AMs aligned.</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl p-4" style={{ background: colors.tertiary, border: `1px solid ${colors.border}` }}>
                <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Action item</div>
                <div className="mt-2 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>Balance workload before next sprint planning.</div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: colors.tertiary, border: `1px solid ${colors.border}` }}>
                <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Insight</div>
                <div className="mt-2 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>{summary.overloaded} AMs are already at or over capacity.</div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: colors.tertiary, border: `1px solid ${colors.border}` }}>
                <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Next step</div>
                <div className="mt-2 text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>Open client intake and routing for the production pipeline.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
