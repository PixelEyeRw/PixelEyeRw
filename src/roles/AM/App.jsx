import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import AMDashboard from "../../pages/AMDashboard";
import ClientsPage from "../../pages/ClientsPage";
import ProjectsPage from "../../pages/ProjectsPage";
import CalendarPage from "../../pages/CalendarPage";
import ReportsPage from "../../pages/ReportsPage";
import WorkloadPage from "../../pages/WorkloadPage";
import SettingsPage from "../../pages/SettingsPage";
import AMIncoming from "../../pages/AMIncoming";
import AMDailyPlanner from "../../pages/AMDailyPlanner";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../../lib/theme";

export default function AMApp({ onSignOut }) {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ ...fontBody, background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <Sidebar active={page} onNavigate={setPage} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <Topbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setPage("incoming")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="incoming"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>Incoming</button>
            <button onClick={() => setPage("daily")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="daily"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>Daily Planner</button>
          </div>
          <div>
            <button onClick={onSignOut} className="rounded px-3 py-2 text-sm font-semibold" style={{ border: `1px solid ${colors.border}` }}>Sign out</button>
          </div>
        </div>

        {page === "dashboard" && <AMDashboard />}
        {page === "clients" && <ClientsPage onNavigate={setPage} />}
        {page === "projects" && <ProjectsPage />}
        {page === "calendar" && <CalendarPage />}
        {page === "reports" && <ReportsPage />}
        {page === "workload" && <WorkloadPage />}
        {page === "settings" && <SettingsPage />}
        {page === "incoming" && <AMIncoming />}
        {page === "daily" && <AMDailyPlanner />}
      </div>
    </div>
  );
}
