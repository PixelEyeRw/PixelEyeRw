import React, { useEffect, useState } from "react";
import SignInPage from "./pages/SignInPage";
import InviteSignup from "./pages/InviteSignup";
import OMApp from "./roles/OM/App";
import AMApp from "./roles/AM/App";
import ProductionApp from "./roles/Production/App";
import DirectorApp from "./roles/Director/App";

const SESSION_KEY = "pixeleye_session";

function mapRoleToKey(role) {
  if (!role) return "production";
  const r = role.toLowerCase();
  if (r.includes("operation")) return "om";
  if (r.includes("account")) return "am";
  if (r.includes("director")) return "director";
  return "production";
}

export default function App() {
  const [session, setSession] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [inviteToken, setInviteToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("invite");
  });

  useEffect(() => {
    // keep URL clean if inviteToken is nullified elsewhere
    if (!inviteToken && typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [inviteToken]);

  const handleInviteComplete = () => setInviteToken(null);

  const handleSignIn = (account) => {
    const sess = { id: account.id, role: account.role, name: account.name, email: account.email };
    setSession(sess);
    if (typeof window !== "undefined") window.localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
  };

  const handleSignOut = () => {
    setSession(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  };

  if (inviteToken) {
    return <InviteSignup token={inviteToken} onComplete={handleInviteComplete} />;
  }

  if (!session) {
    return <SignInPage onSignIn={handleSignIn} />;
  }

  const roleKey = mapRoleToKey(session.role);
  if (roleKey === "om") return <OMApp onSignOut={handleSignOut} />;
  if (roleKey === "am") return <AMApp onSignOut={handleSignOut} />;
  if (roleKey === "production") return <ProductionApp onSignOut={handleSignOut} />;
  if (roleKey === "director") return <DirectorApp onSignOut={handleSignOut} />;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAF9F6" }}>
      <div className="w-full max-w-2xl rounded-xl border p-8 shadow-sm" style={{ background: "white" }}>
        <h2 className="text-lg font-semibold">Welcome, {session.name}</h2>
        <p className="mt-2 text-sm">Your role: {session.role}</p>
        <div className="mt-4">
          <button onClick={handleSignOut} className="px-3 py-2 rounded" style={{ border: "1px solid #ddd" }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}


