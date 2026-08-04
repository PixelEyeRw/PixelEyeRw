import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { CAPABILITIES, INITIAL_ROLES } from "../lib/mockData";

function RoleEditor({ role, onClose, onSave }) {
  const [name, setName] = useState(role?.name || "");
  const [perms, setPerms] = useState(role?.permissions || { view_tasks: true });
  const toggle = (key) => setPerms((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="rounded-lg p-6 w-[28rem]" style={{ background: colors.neutral }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-xl">
            {role ? "Edit Role" : "Create Role"}
          </h3>
          <button onClick={onClose}><X size={18} color={colors.muted} /></button>
        </div>
        <label style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase block mb-1">Role name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Social Media Manager"
          className="w-full rounded p-2 mb-4 text-sm"
          style={{ ...fontBody, border: `1px solid ${colors.border}` }}
        />
        <div style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase mb-2">Permissions</div>
        <div className="space-y-2 mb-2 max-h-64 overflow-y-auto">
          {CAPABILITIES.map((c) => (
            <label key={c.key} className="flex items-center gap-2 text-sm" style={{ ...fontBody, color: colors.primary, opacity: c.locked ? 0.6 : 1 }}>
              <input type="checkbox" checked={!!perms[c.key]} disabled={c.locked} onChange={() => toggle(c.key)} />
              {c.label}
              {c.locked && <span style={{ color: colors.muted }} className="text-xs">(always on)</span>}
            </label>
          ))}
        </div>
        <p style={{ color: colors.muted, ...fontBody }} className="text-xs mb-4">
          Need more than these toggles? Custom fields & screens are configured after saving, from the role's detail view.
        </p>
        <button
          disabled={!name}
          onClick={() => onSave({ name, permissions: perms })}
          className="w-full rounded py-2.5 text-sm font-semibold disabled:opacity-40"
          style={{ ...fontBody, background: colors.primary, color: colors.neutral }}
        >
          Save Role
        </button>
      </div>
    </div>
  );
}

// GET  /api/om/roles
// POST /api/om/roles
// PATCH /api/om/roles/:id
export default function SettingsPage() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const saveEdit = (data) => {
    setRoles((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...data } : r)));
    setEditing(null);
  };
  const saveNew = (data) => {
    setRoles((prev) => [...prev, { id: `role${prev.length + 1}`, users: 0, active: true, ...data }]);
    setCreating(false);
  };
  const toggleActive = (id) => setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));

  return (
    <div className="p-6 space-y-6">
      <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-3xl font-bold">Settings</h1>

      <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg">Roles & Permissions</h3>
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold" style={{ background: colors.primary, color: colors.neutral, ...fontBody }}>
            <Plus size={12} /> Create Role
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: colors.muted, ...fontBody }} className="text-xs uppercase">
              <th className="pb-2">Role</th>
              <th className="pb-2">Users</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                <td className="py-3 font-semibold" style={{ color: colors.primary, ...fontBody }}>{r.name}</td>
                <td className="py-3" style={{ color: colors.muted, ...fontBody }}>{r.users}</td>
                <td className="py-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ background: r.active ? colors.onTrack : colors.muted, color: colors.neutral, ...fontBody }}>
                    {r.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 flex gap-3">
                  <button onClick={() => setEditing(r)} className="text-xs font-semibold" style={{ color: colors.secondary, ...fontBody }}>Edit</button>
                  <button onClick={() => toggleActive(r.id)} className="text-xs font-semibold" style={{ color: colors.muted, ...fontBody }}>
                    {r.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-4">General</h3>
        <label style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase block mb-1">Studio name</label>
        <input defaultValue="Marketing Flow" className="w-full rounded p-2 text-sm mb-4" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
        <label style={{ ...fontBody, color: colors.muted }} className="text-xs uppercase block mb-1">Notification email</label>
        <input defaultValue="ops@marketingflow.studio" className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
      </div>

      {editing && <RoleEditor role={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
      {creating && <RoleEditor role={null} onClose={() => setCreating(false)} onSave={saveNew} />}
    </div>
  );
}