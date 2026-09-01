import React, { useEffect, useState } from "react";
import { fontBody, colors } from "../lib/theme";
import { getStoredAccounts, getStoredInvites, saveStoredAccounts, saveStoredInvites } from "../lib/teamData";

export default function InviteSignup({ token, onComplete }) {
  const [invites, setInvites] = useState([]);
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedInvites = getStoredInvites();
    setInvites(storedInvites);
    const match = storedInvites.find((item) => item.id === token);
    if (match) {
      setInvite(match);
      setForm((prev) => ({ ...prev, email: match.email, role: match.role }));
    }
  }, [token]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password || form.password !== form.confirmPassword) {
      setMessage("Please complete your details and confirm the password.");
      return;
    }

    const accounts = getStoredAccounts();
    const updatedAccounts = [...accounts, { id: `account_${Date.now()}`, name: form.name, email: form.email, role: form.role || "Team Member", password: form.password }];
    saveStoredAccounts(updatedAccounts);

    const nextInvites = invites.map((item) => (item.id === token ? { ...item, status: "Accepted" } : item));
    setInvites(nextInvites);
    saveStoredInvites(nextInvites);
    setMessage("Account created successfully. You can now continue to the dashboard.");
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAF9F6" }}>
      <div className="w-full max-w-xl rounded-xl border p-8 shadow-sm" style={{ background: colors.neutral, borderColor: colors.border }}>
        <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Create your Pixeleye account</h1>
        <p className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>You were invited as {invite?.role || "a team member"}. Finish your profile below.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Full name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Email</label>
            <input value={form.email} readOnly className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}`, background: "#F8F7F4" }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Role</label>
            <input value={form.role} readOnly className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}`, background: "#F8F7F4" }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Confirm password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <button type="submit" className="w-full rounded py-2.5 text-sm font-semibold" style={{ ...fontBody, background: colors.primary, color: colors.neutral }}>Create account</button>
        </form>
        {message && <p className="mt-4 text-sm" style={{ ...fontBody, color: colors.secondary }}>{message}</p>}
      </div>
    </div>
  );
}
