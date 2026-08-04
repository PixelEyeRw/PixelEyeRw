import React, { useMemo, useState } from "react";
import { Download, Search, RotateCcw, ArrowLeftRight } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { capacityStatus } from "../lib/status";
import { ACTIVITY } from "../lib/mockData";

function SummaryCard({ label, value, sub, subColor, highlight }) {
  return (
    <div
      className="flex-1 rounded-lg p-4"
      style={{ border: `1px solid ${highlight ? colors.danger : colors.border}`, background: colors.neutral }}
    >
      <div className="text-xs uppercase tracking-wide" style={{ ...fontBody, color: colors.muted }}>
        {label}
      </div>
      <div className="text-3xl font-bold mt-2" style={{ ...fontDisplay, color: highlight ? colors.danger : colors.primary }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1" style={{ ...fontBody, color: subColor || colors.muted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function IntakePanel({ ams, onSubmit }) {
  const [form, setForm] = useState({ client: "", title: "", amId: "", priority: "MID" });

  const submit = () => {
    if (!form.client || !form.title || !form.amId) return;
    onSubmit(form);
    setForm({ client: "", title: "", amId: "", priority: "MID" });
  };

  return (
    <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
      <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-4">
        Intake Panel
      </h3>
      <label style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase block mb-1">
        Client name
      </label>
      <input
        value={form.client}
        onChange={(e) => setForm({ ...form, client: e.target.value })}
        placeholder="e.g. Acme Corp"
        className="w-full rounded p-2 mb-3 text-sm"
        style={{ ...fontBody, border: `1px solid ${colors.border}` }}
      />
      <label style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase block mb-1">
        Project title
      </label>
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Q4 Campaign"
        className="w-full rounded p-2 mb-3 text-sm"
        style={{ ...fontBody, border: `1px solid ${colors.border}` }}
      />
      <label style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase block mb-1">
        Assign account manager
      </label>
      <select
        value={form.amId}
        onChange={(e) => setForm({ ...form, amId: e.target.value })}
        className="w-full rounded p-2 mb-3 text-sm"
        style={{ ...fontBody, border: `1px solid ${colors.border}` }}
      >
        <option value="">Search managers...</option>
        {ams.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      <label style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase block mb-2">
        Priority tier
      </label>
      <div className="flex gap-2 mb-4">
        {["LOW", "MID", "HIGH"].map((p) => (
          <button
            key={p}
            onClick={() => setForm({ ...form, priority: p })}
            className="flex-1 rounded py-1.5 text-xs font-semibold"
            style={{
              ...fontBody,
              border: `1px solid ${colors.primary}`,
              background: form.priority === p ? colors.primary : "transparent",
              color: form.priority === p ? colors.neutral : colors.primary,
            }}
          >
            {p}
          </button>
        ))}
      </div>
      <button
        onClick={submit}
        className="w-full rounded py-2.5 text-sm font-semibold tracking-wide"
        style={{ ...fontBody, background: colors.primary, color: colors.neutral }}
      >
        INITIALIZE PROJECT
      </button>
    </div>
  );
}

function AccountManagerOverview({ ams, onReassign }) {
  return (
    <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg">
          Account Manager Overview
        </h3>
        <span style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">
          Sort by: Workload
        </span>
      </div>
      <div className="space-y-3">
        {ams.map((am) => {
          const pct = am.activeProjects / am.capacityMax;
          const status = capacityStatus(pct);
          return (
            <div key={am.id} className="flex items-center justify-between rounded p-3" style={{ border: `1px solid ${colors.border}` }}>
              <div>
                <div style={{ ...fontBody, color: colors.primary }} className="font-semibold text-sm">{am.name}</div>
                <div style={{ ...fontBody, color: colors.muted }} className="text-xs">{am.title}</div>
              </div>
              <div style={{ ...fontBody, color: colors.muted }} className="text-xs text-center w-16">{am.clients} clients</div>
              <div style={{ ...fontBody, color: colors.muted }} className="text-xs text-center w-20">{am.activeProjects} projects</div>
              <div className="flex items-center gap-2 w-40 justify-end">
                <span className="text-xs font-semibold px-2 py-1 rounded" style={{ ...fontBody, color: colors.neutral, background: status.color }}>
                  {status.label}
                </span>
                {pct >= 1 && (
                  <button onClick={() => onReassign(am)} title="Reassign workload" className="p-1.5 rounded" style={{ border: `1px solid ${colors.primary}` }}>
                    <ArrowLeftRight size={14} color={colors.primary} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeletedTaskLog({ rows, onRestore }) {
  return (
    <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg">
          Deleted Task Accountability Log
        </h3>
        <div className="flex items-center gap-2 rounded px-3 py-1.5" style={{ border: `1px solid ${colors.border}` }}>
          <Search size={14} color={colors.muted} />
          <input placeholder="Search by user or task..." className="text-xs outline-none" style={fontBody} />
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase">
            <th className="pb-2">Timestamp</th>
            <th className="pb-2">Deleted task</th>
            <th className="pb-2">Responsible actor</th>
            <th className="pb-2">Reason code</th>
            <th className="pb-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderTop: `1px solid ${colors.border}` }}>
              <td className="py-3" style={{ ...fontBody, color: colors.muted }}>{row.timestamp}</td>
              <td className="py-3 font-semibold" style={{ ...fontBody, color: colors.primary }}>{row.task}</td>
              <td className="py-3" style={{ ...fontBody, color: colors.muted }}>{row.actor}</td>
              <td className="py-3">
                <span className="text-xs px-2 py-1 rounded" style={{ ...fontBody, background: colors.tertiary, color: colors.primary }}>
                  {row.reason}
                </span>
              </td>
              <td className="py-3">
                {row.restored ? (
                  <span style={{ ...fontBody, color: colors.onTrack }} className="text-xs font-semibold">Restored</span>
                ) : (
                  <button onClick={() => onRestore(row.id)} className="flex items-center gap-1 text-xs font-semibold" style={{ ...fontBody, color: colors.secondary }}>
                    <RotateCcw size={12} /> Restore
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LiveActivity() {
  return (
    <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
      <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-4">
        Live Activity
      </h3>
      <div className="space-y-4">
        {ACTIVITY.map((e) => (
          <div key={e.id}>
            <div style={{ ...fontBody, color: colors.primary }} className="text-xs font-bold uppercase">{e.actor}</div>
            <div style={{ ...fontBody, color: colors.muted }} className="text-sm">{e.text}</div>
            <div style={{ ...fontBody, color: colors.muted }} className="text-xs mt-0.5">{e.time}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between text-xs mb-1" style={fontBody}>
          <span style={{ color: colors.primary }} className="font-semibold">Studio Efficiency</span>
          <span style={{ color: colors.primary }} className="font-semibold">92%</span>
        </div>
        <div className="w-full rounded-full h-2" style={{ background: colors.tertiary }}>
          <div className="h-2 rounded-full" style={{ width: "92%", background: colors.secondary }} />
        </div>
      </div>
    </div>
  );
}

// GET /api/om/summary is derived client-side here from the AM list, but should
// be its own live-updating endpoint once real-time sync (websocket) is wired in.
export default function DashboardPage({ ams, deleted, onIntake, onRestore, onReassign }) {
  const summary = useMemo(
    () => ({
      activeClients: ams.reduce((s, a) => s + a.clients, 0),
      liveProjects: ams.reduce((s, a) => s + a.activeProjects, 0),
    }),
    [ams]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div style={{ color: colors.secondary }} className="text-xs uppercase font-bold tracking-wider">
            AgencyFlow Command
          </div>
          <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-3xl font-bold">
            Operations Overview
          </h1>
        </div>
        <button className="flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold" style={{ background: colors.primary, color: colors.neutral }}>
          <Download size={14} /> Export Ops Report
        </button>
      </div>

      <div className="flex gap-4">
        <SummaryCard label="Active Clients" value={summary.activeClients} sub="+3 this month" subColor={colors.onTrack} />
        <SummaryCard label="Live Projects" value={summary.liveProjects} sub="42 in Production Phase" />
        <SummaryCard label="Overdue Tasks" value={9} sub="Critical Attention Required" subColor={colors.danger} highlight />
        <SummaryCard label="Avg Progress" value="68%" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <IntakePanel ams={ams} onSubmit={onIntake} />
            <AccountManagerOverview ams={ams} onReassign={onReassign} />
          </div>
          <DeletedTaskLog rows={deleted} onRestore={onRestore} />
        </div>
        <div>
          <LiveActivity />
        </div>
      </div>
    </div>
  );
}