import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import ReassignModal from "./components/ReassignModal";
import DashboardPage from "../../pages/DashboardPage";
import ClientsPage from "../../pages/ClientsPage";
import ProjectsPage from "../../pages/ProjectsPage";
import CalendarPage from "../../pages/CalendarPage";
import ReportsPage from "../../pages/ReportsPage";
import WorkloadPage from "../../pages/WorkloadPage";
import SettingsPage from "../../pages/SettingsPage";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../../lib/theme";
import { INITIAL_AMS, INITIAL_DELETED } from "../../lib/mockData";

export default function OMApp({ onSignOut, isDirector = false }) {
  const [page, setPage] = useState("dashboard");
  const [ams, setAms] = useState(INITIAL_AMS);
  const [deleted, setDeleted] = useState(INITIAL_DELETED);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleIntake = (form) => console.log("POST /api/om/projects", form);
  const handleRestore = (id) => setDeleted((prev) => prev.map((d) => (d.id === id ? { ...d, restored: true } : d)));
  const handleReassignConfirm = (targetId) => {
    setAms((prev) => {
      const fromId = reassignTarget.id;
      const moved = 3;
      return prev.map((a) => {
        if (a.id === fromId) return { ...a, activeProjects: Math.max(0, a.activeProjects - moved) };
        if (a.id === targetId) return { ...a, activeProjects: a.activeProjects + moved };
        return a;
      });
    });
    setReassignTarget(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ ...fontBody, background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <Sidebar active={page} onNavigate={setPage} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <Topbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="px-4 py-2 flex items-center justify-between">
          {isDirector ? (
            <div style={{ color: colors.primary, ...fontBody }} className="text-sm font-semibold">Director view — company-wide</div>
          ) : (
            <div />
          )}
          <div>
            <button onClick={onSignOut} className="rounded px-3 py-2 text-sm font-semibold" style={{ border: `1px solid ${colors.border}` }}>Sign out</button>
          </div>
        </div>
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
