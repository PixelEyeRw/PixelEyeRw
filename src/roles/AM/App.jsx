import React, { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, Briefcase, CalendarDays, BarChart3, Settings as SettingsIcon } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import AMDashboard from "../../pages/AMDashboard";
import AMProjectList from "../../pages/AMProjectList";
import AMTaskProgressPage from "../../pages/AMTaskProgressPage";
import AMClientUpdatesPage from "../../pages/AMClientUpdatesPage";
import AMKpiBonusPage from "../../pages/AMKpiBonusPage";
import ClientsPage from "../../pages/ClientsPage";
import ProjectsPage from "../../pages/ProjectsPage";
import CalendarPage from "../../pages/CalendarPage";
import ReportsPage from "../../pages/ReportsPage";
import SettingsPage from "../../pages/SettingsPage";
import AMIncoming from "../../pages/AMIncoming";
import AMDailyPlanner from "../../pages/AMDailyPlanner";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../../lib/theme";
import {
  INITIAL_AM_PROJECT_LIST,
  INITIAL_AM_TASK_PROGRESS,
  INITIAL_AM_CLIENT_UPDATES,
  INITIAL_AM_KPI_FLAGS,
} from "../../lib/mockData";
import {
  getSession,
  getStoredAMProjectList,
  saveStoredAMProjectList,
  getStoredAMTaskProgress,
  saveStoredAMTaskProgress,
  getStoredAMClientUpdates,
  saveStoredAMClientUpdates,
  getStoredAMKpiFlags,
  saveStoredAMKpiFlags,
  getStoredAMSelectedProject,
  saveStoredAMSelectedProject,
} from "../../lib/teamData";
import { kpiSummary } from "../../lib/amWorkbook";

const AM_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clients", label: "Clients", icon: Users },
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function AMApp({ onSignOut }) {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectRows, setProjectRows] = useState([]);
  const [taskRows, setTaskRows] = useState([]);
  const [clientUpdates, setClientUpdates] = useState([]);
  const [kpiFlags, setKpiFlags] = useState(INITIAL_AM_KPI_FLAGS);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  useEffect(() => {
    const session = getSession();
    const owner = session?.name || "Adelphe";

    const storedProjects = getStoredAMProjectList();
    const effectiveProjects = storedProjects.length
      ? storedProjects
      : INITIAL_AM_PROJECT_LIST.filter((row) => row.accountOwner === owner);
    setProjectRows(effectiveProjects);
    if (!storedProjects.length) saveStoredAMProjectList(effectiveProjects);

    const storedTasks = getStoredAMTaskProgress();
    const effectiveTasks = storedTasks.length ? storedTasks : INITIAL_AM_TASK_PROGRESS;
    setTaskRows(effectiveTasks);
    if (!storedTasks.length) saveStoredAMTaskProgress(effectiveTasks);

    const storedUpdates = getStoredAMClientUpdates();
    const effectiveUpdates = storedUpdates.length ? storedUpdates : INITIAL_AM_CLIENT_UPDATES;
    setClientUpdates(effectiveUpdates);
    if (!storedUpdates.length) saveStoredAMClientUpdates(effectiveUpdates);

    const storedFlags = getStoredAMKpiFlags();
    if (storedFlags) {
      setKpiFlags(storedFlags);
    } else {
      saveStoredAMKpiFlags(INITIAL_AM_KPI_FLAGS);
    }

    const selected = getStoredAMSelectedProject();
    const defaultProject = effectiveProjects[0]?.projectId || "";
    setSelectedProjectId(selected || defaultProject);
    if (!selected) saveStoredAMSelectedProject(defaultProject);
  }, []);

  const workbookSummary = useMemo(
    () =>
      kpiSummary({
        projects: projectRows,
        tasks: taskRows,
        updates: clientUpdates,
        flags: kpiFlags,
        selectedProjectId,
      }),
    [projectRows, taskRows, clientUpdates, kpiFlags, selectedProjectId]
  );

  const handleProjectRowsChange = (nextRows) => {
    setProjectRows(nextRows);
    saveStoredAMProjectList(nextRows);
    if (!nextRows.find((row) => row.projectId === selectedProjectId)) {
      const fallback = nextRows[0]?.projectId || "";
      setSelectedProjectId(fallback);
      saveStoredAMSelectedProject(fallback);
    }
  };

  const handleTaskRowsChange = (nextRows) => {
    setTaskRows(nextRows);
    saveStoredAMTaskProgress(nextRows);
  };

  const handleClientUpdatesChange = (nextRows) => {
    setClientUpdates(nextRows);
    saveStoredAMClientUpdates(nextRows);
  };

  const handleKpiFlagsChange = (nextFlags) => {
    setKpiFlags(nextFlags);
    saveStoredAMKpiFlags(nextFlags);
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    saveStoredAMSelectedProject(projectId);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ ...fontBody, background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <Sidebar active={page} onNavigate={setPage} navItems={AM_NAV_ITEMS} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <Topbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setPage("incoming")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="incoming"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>Incoming</button>
            <button onClick={() => setPage("daily")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="daily"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>Daily Planner</button>
            <button onClick={() => setPage("project-list")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="project-list"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>Project List</button>
            <button onClick={() => setPage("task-progress")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="task-progress"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>Task Progress</button>
            <button onClick={() => setPage("client-updates")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="client-updates"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>Client Updates</button>
            <button onClick={() => setPage("kpi-bonus")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="kpi-bonus"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>KPI & Bonus</button>
          </div>
          <div>
            <button onClick={onSignOut} className="rounded px-3 py-2 text-sm font-semibold" style={{ border: `1px solid ${colors.border}` }}>Sign out</button>
          </div>
        </div>

        {page === "dashboard" && (
          <AMDashboard
            summary={workbookSummary}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
            projects={projectRows}
          />
        )}
        {page === "clients" && <ClientsPage onNavigate={setPage} />}
        {page === "projects" && <ProjectsPage />}
        {page === "calendar" && <CalendarPage />}
        {page === "reports" && <ReportsPage />}
        {page === "settings" && <SettingsPage />}
        {page === "incoming" && <AMIncoming />}
        {page === "daily" && <AMDailyPlanner />}
        {page === "project-list" && <AMProjectList rows={projectRows} onRowsChange={handleProjectRowsChange} />}
        {page === "task-progress" && <AMTaskProgressPage rows={taskRows} onRowsChange={handleTaskRowsChange} />}
        {page === "client-updates" && <AMClientUpdatesPage rows={clientUpdates} onRowsChange={handleClientUpdatesChange} />}
        {page === "kpi-bonus" && (
          <AMKpiBonusPage
            summary={workbookSummary}
            flags={kpiFlags}
            onFlagsChange={handleKpiFlagsChange}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
            projects={projectRows}
          />
        )}
      </div>
    </div>
  );
}
