import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ReassignModal from "./components/ReassignModal";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ProjectsPage from "./pages/ProjectsPage";
import CalendarPage from "./pages/CalendarPage";
import ReportsPage from "./pages/ReportsPage";
import WorkloadPage from "./pages/WorkloadPage";
import SettingsPage from "./pages/SettingsPage";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "./lib/theme";
import { INITIAL_AMS, INITIAL_DELETED } from "./lib/mockData";
import { getStoredAccounts, getStoredInvites, saveStoredAccounts, saveStoredInvites } from "./lib/teamData";

function InviteSignup({ token, onComplete }) {
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

// This is the one place that owns cross-page state: the AM list and the
// deleted-task log. Reassign actions on Dashboard and Workload both call the
// same handler here, so both pages stay in sync without prop drilling a
// global store — swap these useState calls for TanStack Query once the API
// exists and every page below keeps working unchanged.
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [ams, setAms] = useState(INITIAL_AMS);
  const [deleted, setDeleted] = useState(INITIAL_DELETED);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [inviteToken, setInviteToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("invite");
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleIntake = (form) => console.log("POST /api/om/projects", form);
  const handleRestore = (id) => setDeleted((prev) => prev.map((d) => (d.id === id ? { ...d, restored: true } : d)));
  const handleReassignConfirm = (targetId) => {
    setAms((prev) => {
      const fromId = reassignTarget.id;
      const moved = 3; // demo only — real flow moves specific selected projects/tasks
      return prev.map((a) => {
        if (a.id === fromId) return { ...a, activeProjects: Math.max(0, a.activeProjects - moved) };
        if (a.id === targetId) return { ...a, activeProjects: a.activeProjects + moved };
        return a;
      });
    });
    setReassignTarget(null);
  };

  const handleInviteComplete = () => {
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
    setInviteToken(null);
  };

  if (inviteToken) {
    return <InviteSignup token={inviteToken} onComplete={handleInviteComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ ...fontBody, background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <Sidebar active={page} onNavigate={setPage} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <Topbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        {page === "dashboard" && (
          <DashboardPage ams={ams} deleted={deleted} onIntake={handleIntake} onRestore={handleRestore} onReassign={setReassignTarget} />
        )}
        {page === "clients" && <ClientsPage onNavigate={setPage} />}
        {page === "projects" && <ProjectsPage />}
        {page === "calendar" && <CalendarPage />}
        {page === "reports" && <ReportsPage ams={ams} />}
        {page === "workload" && <WorkloadPage ams={ams} onReassign={setReassignTarget} />}
        {page === "settings" && <SettingsPage />}
      </div>
      {reassignTarget && (
        <ReassignModal am={reassignTarget} ams={ams} onClose={() => setReassignTarget(null)} onConfirm={handleReassignConfirm} />
      )}
    </div>
  );
}
