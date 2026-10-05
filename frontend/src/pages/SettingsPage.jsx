import React, { useEffect, useMemo, useState } from "react";
import { Upload, Mail, Link2 } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { apiGet, apiPost, apiPut, buildInviteLink, defaultProfile, getSession } from "../lib/teamData";

const ROLE_ACCESS = {
  "Operations Manager": "Manage studio operations, clients, intakes, and workload.",
  "Account Manager": "Manage assigned clients, projects, submissions, and updates.",
  Production: "Work on assigned projects and tasks.",
  Director: "View and manage studio-wide operations.",
};

// GET  /api/om/roles
// POST /api/om/roles
// PATCH /api/om/roles/:id
export default function SettingsPage() {
  const [roles, setRoles] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Account Manager");
  const [inviteMessage, setInviteMessage] = useState("");
  const [invites, setInvites] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [profileError, setProfileError] = useState("");
  const session = getSession();
  const roleText = session?.role?.toLowerCase() || "";
  const isOmOrDirector = roleText.includes("operation") || roleText.includes("operations") || roleText.includes("director") || roleText.includes("ops");

  useEffect(() => {
    apiGet("/profile")
      .then(setProfile)
      .catch((error) => setProfileError(error.message || "Could not load profile."));
    apiGet("/invites")
      .then(setInvites)
      .catch((error) => console.error("Could not load invitations:", error));
    if (isOmOrDirector) apiGet("/om/roles").then(setRoles).catch((error) => console.error("Could not load roles:", error));
  }, []);

  const profileAvatar = useMemo(() => profile.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", [profile.avatar]);


  const handleProfileChange = (field, value) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
    apiPut("/profile", updatedProfile)
      .catch((error) => setProfileError(error.message || "Could not save profile."));
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
      apiPut("/profile", updatedProfile)
        .catch((error) => setProfileError(error.message || "Could not save profile photo."));
    };
    reader.readAsDataURL(file);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const created = await apiPost("/invites", { email: inviteEmail.trim(), role: inviteRole, createdBy: session?.id });
      const newInvite = { ...created, link: buildInviteLink(created.token) };
      setInvites((current) => [newInvite, ...current]);
      setInviteMessage(`Invite created for ${inviteEmail.trim()}. Share the signup link before it expires.`);
      setInviteEmail("");
      setInviteRole("Account Manager");
    } catch (error) {
      setInviteMessage(error.message || "Could not create invite.");
    }
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
            <input value={profile.role} readOnly className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
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
        {profileError && <p className="mt-3 text-sm" role="alert" style={{ ...fontBody, color: colors.danger }}>{profileError}</p>}
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
              <option>Director</option>
              <option>Account Manager</option>
              <option>Operations Manager</option>
              <option>Production</option>
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
              {invite.link && <div className="flex items-center gap-2">
                <span className="rounded px-2 py-1 text-xs" style={{ background: colors.onTrack, color: colors.neutral }}>{invite.link}</span>
                <button onClick={() => navigator.clipboard?.writeText(invite.link)} className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold" style={{ background: colors.secondary, color: colors.neutral }}>
                  <Link2 size={12} /> Copy
                </button>
              </div>}
            </div>
          ))}
        </div>
      </div>
      )}

{isOmOrDirector && (
      <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-4">System Roles</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: colors.muted, ...fontBody }} className="text-xs uppercase">
              <th className="pb-2">Role</th>
              <th className="pb-2">Users</th>
              <th className="pb-2">Access</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                <td className="py-3 font-semibold" style={{ color: colors.primary, ...fontBody }}>{r.name}</td>
                <td className="py-3" style={{ color: colors.muted, ...fontBody }}>{r.users}</td>
                <td className="py-3" style={{ color: colors.muted, ...fontBody }}>{ROLE_ACCESS[r.name]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}