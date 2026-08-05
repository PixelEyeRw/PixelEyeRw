import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { healthBadge } from "../lib/status";
import { CLIENTS } from "../lib/mockData";

function ClientDrawer({ client, onClose, onViewProjects }) {
  const badge = healthBadge(client.health);
  return (
    <div className="fixed inset-0 flex justify-end z-50" style={{ background: "rgba(0,0,0,0.35)" }}>
      <div className="w-96 h-full p-6" style={{ background: colors.neutral }}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl">{client.name}</h3>
          <button onClick={onClose}><X size={18} color={colors.muted} /></button>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded" style={{ ...fontBody, color: colors.neutral, background: badge.color }}>
          {badge.label}
        </span>
        <div className="mt-6 space-y-4" style={fontBody}>
          <div>
            <div style={{ color: colors.muted }} className="text-xs uppercase">Account Manager</div>
            <div style={{ color: colors.primary }} className="text-sm font-semibold">{client.am}</div>
          </div>
          <div>
            <div style={{ color: colors.muted }} className="text-xs uppercase">Active Projects</div>
            <div style={{ color: colors.primary }} className="text-sm font-semibold">{client.projects}</div>
          </div>
          <div>
            <div style={{ color: colors.muted }} className="text-xs uppercase">Last Activity</div>
            <div style={{ color: colors.primary }} className="text-sm font-semibold">{client.lastActivity}</div>
          </div>
        </div>
        <button
          onClick={onViewProjects}
          className="mt-8 w-full rounded py-2.5 text-sm font-semibold"
          style={{ ...fontBody, background: colors.primary, color: colors.neutral }}
        >
          View all projects for this client
        </button>
      </div>
    </div>
  );
}

// GET /api/om/clients?health=&q=
export default function ClientsPage({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () =>
      CLIENTS.filter((c) => {
        const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = filter === "all" || c.health === filter;
        return matchesQuery && matchesFilter;
      }),
    [query, filter]
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl sm:text-3xl font-bold">Clients</h1>
        <label className="flex items-center gap-2 rounded px-3 py-2 w-full sm:w-72" style={{ border: `1px solid ${colors.border}` }}>
          <Search size={14} color={colors.muted} />
          <input aria-label="Search clients" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients..." className="text-sm outline-none w-full" />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "on_track", label: "On Track" },
          { key: "at_risk", label: "At Risk" },
          { key: "overdue", label: "Overdue" },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className="text-xs font-semibold px-3 py-1.5 rounded"
            style={{
              border: `1px solid ${colors.primary}`,
              background: filter === f.key ? colors.primary : "transparent",
              color: filter === f.key ? colors.neutral : colors.primary,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-x-auto" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr style={{ color: colors.muted }} className="text-xs uppercase">
              <th className="p-4">Client</th>
              <th className="p-4">Account Manager</th>
              <th className="p-4">Active Projects</th>
              <th className="p-4">Health</th>
              <th className="p-4">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const badge = healthBadge(c.health);
              return (
                <tr key={c.id} onClick={() => setSelected(c)} className="cursor-pointer" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <td className="p-4 font-semibold" style={{ color: colors.primary }}>{c.name}</td>
                  <td className="p-4" style={{ color: colors.muted }}>{c.am}</td>
                  <td className="p-4" style={{ color: colors.muted }}>{c.projects}</td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded" style={{ color: colors.neutral, background: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="p-4" style={{ color: colors.muted }}>{c.lastActivity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <ClientDrawer
          client={selected}
          onClose={() => setSelected(null)}
          onViewProjects={() => {
            setSelected(null);
            onNavigate("projects");
          }}
        />
      )}
    </div>
  );
}