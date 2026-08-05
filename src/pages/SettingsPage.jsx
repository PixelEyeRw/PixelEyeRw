import React, { useEffect, useMemo, useState } from "react";
import { Plus, X, Upload, Mail, Link2 } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { CAPABILITIES, INITIAL_ROLES } from "../lib/mockData";
import { buildInviteLink, createInviteToken, defaultProfile, getStoredInvites, getStoredProfile, saveStoredInvites, saveStoredProfile, getSession } from "../lib/teamData";

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
  const [profile, setProfile] = useState(defaultProfile);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Account Manager");
  const [inviteMessage, setInviteMessage] = useState("");
  const [invites, setInvites] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    setProfile(getStoredProfile());
    setInvites(getStoredInvites());
  }, []);

  const session = getSession();
  const roleText = session?.role?.toLowerCase() || "";
  const isOmOrDirector = roleText.includes("operation") || roleText.includes("operations") || roleText.includes("director") || roleText.includes("ops");

  const profileAvatar = useMemo(() => profile.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", [profile.avatar]);

  const saveEdit = (data) => {
    setRoles((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...data } : r)));
    setEditing(null);
  };
  const saveNew = (data) => {
    setRoles((prev) => [...prev, { id: `role${prev.length + 1}`, users: 0, active: true, ...data }]);
    setCreating(false);
  };
  const toggleActive = (id) => setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));

  const handleProfileChange = (field, value) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result;
      const updatedProfile = { ...profile, avatar: imageData };
      setProfile(updatedProfile);
      setAvatarPreview(imageData);
      saveStoredProfile(updatedProfile);
    };
    reader.readAsDataURL(file);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const token = createInviteToken();
    const newInvite = {
      id: token,
      email: inviteEmail.trim(),
      role: inviteRole,
      createdAt: new Date().toISOString(),
      status: "Pending",
      link: buildInviteLink(token),
    };
    const nextInvites = [newInvite, ...invites];
    setInvites(nextInvites);
    saveStoredInvites(nextInvites);
    setInviteMessage(`Invite sent to ${inviteEmail.trim()} with a secure signup link.`);
    setInviteEmail("");
    setInviteRole("Account Manager");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-3xl font-bold">Settings</h1>

      <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <img src={profileAvatar} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
            <div>
              <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg">Team Profile</h3>
              <p style={{ ...fontBody, color: colors.muted }} className="text-sm">Upload a photo and fill in your personal details for smoother collaboration.</p>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm font-semibold" style={{ background: colors.primary, color: colors.neutral, ...fontBody }}>
            <Upload size={14} /> Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Full name</label>
            <input value={profile.name} onChange={(e) => handleProfileChange("name", e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Email</label>
            <input value={profile.email} onChange={(e) => handleProfileChange("email", e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Role</label>
            <input value={profile.role} onChange={(e) => handleProfileChange("role", e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Title</label>
            <input value={profile.title} onChange={(e) => handleProfileChange("title", e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Phone</label>
            <input value={profile.phone} onChange={(e) => handleProfileChange("phone", e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Bio</label>
            <textarea value={profile.bio} onChange={(e) => handleProfileChange("bio", e.target.value)} rows={3} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
        </div>
      </div>

{isOmOrDirector && (
      <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg">Invite Team Members</h3>
            <p style={{ ...fontBody, color: colors.muted }} className="text-sm">Send Gmail-based invites and hand them a pre-filled signup link.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1.3fr_0.9fr_auto]">
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Email address</label>
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@gmail.com" className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Role</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }}>
              <option>Account Manager</option>
              <option>Content Lead</option>
              <option>Designer</option>
              <option>Video Editor</option>
            </select>
          </div>
          <button onClick={handleInvite} className="flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-semibold" style={{ background: colors.primary, color: colors.neutral, ...fontBody }}>
            <Mail size={14} /> Send invite
          </button>
        </div>
        {inviteMessage && <p className="mt-3 text-sm" style={{ ...fontBody, color: colors.secondary }}>{inviteMessage}</p>}

        <div className="mt-5 space-y-2">
          {invites.map((invite) => (
            <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3 text-sm" style={{ borderColor: colors.border, ...fontBody }}>
              <div>
                <div className="font-semibold" style={{ color: colors.primary }}>{invite.email}</div>
                <div style={{ color: colors.muted }}>{invite.role} · {invite.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded px-2 py-1 text-xs" style={{ background: colors.onTrack, color: colors.neutral }}>{invite.link}</span>
                <button onClick={() => navigator.clipboard?.writeText(invite.link)} className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold" style={{ background: colors.secondary, color: colors.neutral }}>
                  <Link2 size={12} /> Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

{isOmOrDirector && (
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
      )}
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