import React, { lazy, Suspense, useEffect, useState } from "react";
import SignInPage from "./pages/SignInPage";
import InviteSignup from "./pages/InviteSignup";
import { apiGet, apiPost, clearSession, saveSession } from "./lib/teamData";

const OMApp = lazy(() => import("./roles/OM/App"));
const AMApp = lazy(() => import("./roles/AM/App"));
const ProductionApp = lazy(() => import("./roles/Production/App"));
const DirectorApp = lazy(() => import("./roles/Director/App"));

function mapRoleToKey(role) {
  if (!role) return "production";
  const r = role.toLowerCase();
  if (r.includes("operation")) return "om";
  if (r.includes("account")) return "am";
  if (r.includes("director")) return "director";
  return "production";
}

export default function App() {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

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

  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener("pixeleye:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("pixeleye:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    const handleSaveError = (event) => window.alert(`Save failed: ${event.detail || "The server did not accept the change."}`);
    window.addEventListener("pixeleye:api-save-error", handleSaveError);
    return () => window.removeEventListener("pixeleye:api-save-error", handleSaveError);
  }, []);

  useEffect(() => {
    apiGet("/auth/session")
      .then((user) => {
        setSession(user);
        saveSession(user);
      })
      .catch(() => {
        clearSession();
        setSession(null);
      })
      .finally(() => setSessionLoading(false));
  }, []);

  const handleInviteComplete = () => setInviteToken(null);

  const handleSignIn = (user) => {
    setSession(user);
    saveSession(user);
  };

  const handleSignOut = async () => {
    try {
      await apiPost("/auth/logout", {});
    } finally {
      setSession(null);
      clearSession();
    }
  };

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9F6" }}>Loading...</div>;
  }

  if (inviteToken) {
    return <InviteSignup token={inviteToken} onComplete={handleInviteComplete} />;
  }

  if (!session) {
    return <SignInPage onSignIn={handleSignIn} />;
  }

  const roleKey = mapRoleToKey(session.role);
  if (roleKey === "om") return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9F6" }}>Loading...</div>}><OMApp onSignOut={handleSignOut} /></Suspense>;
  if (roleKey === "am") return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9F6" }}>Loading...</div>}><AMApp onSignOut={handleSignOut} /></Suspense>;
  if (roleKey === "production") return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9F6" }}>Loading...</div>}><ProductionApp onSignOut={handleSignOut} /></Suspense>;
  if (roleKey === "director") return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF9F6" }}>Loading...</div>}><DirectorApp onSignOut={handleSignOut} /></Suspense>;

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


