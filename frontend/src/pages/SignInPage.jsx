import React, { useState } from "react";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../lib/theme";
import { getStoredAccounts } from "../lib/teamData";

export default function SignInPage({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const accounts = getStoredAccounts();
    const match = accounts.find((a) => a.email === email && a.password === password);
    if (!match) return setMessage("Invalid email or password.");
    onSignIn(match);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <div className="w-full max-w-md rounded-xl border p-8 shadow-sm" style={{ background: colors.neutral, borderColor: colors.border }}>
        <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Sign in to PixelEye</h1>
        <p className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>Enter the email and password for your account.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <div>
            <label className="text-xs uppercase block mb-1" style={{ ...fontBody, color: colors.muted }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded p-2 text-sm" style={{ ...fontBody, border: `1px solid ${colors.border}` }} />
          </div>
          <button type="submit" className="w-full rounded py-2.5 text-sm font-semibold" style={{ ...fontBody, background: colors.primary, color: colors.neutral }}>Sign in</button>
        </form>
        {message && <p className="mt-4 text-sm" style={{ ...fontBody, color: colors.secondary }}>{message}</p>}
      </div>
    </div>
  );
}
