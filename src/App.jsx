import React, { useState } from "react";
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
import { fontBody, GOOGLE_FONTS_IMPORT } from "./lib/theme";
import { INITIAL_AMS, INITIAL_DELETED } from "./lib/mockData";

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

  return (
    <div className="min-h-screen flex" style={{ ...fontBody, background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Topbar />
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
