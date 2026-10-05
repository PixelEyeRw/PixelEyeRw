import React, { useEffect, useState } from "react";
import { LayoutDashboard, Users, Briefcase, CalendarDays, BarChart3, Gauge, Settings as SettingsIcon, PlusCircle, ClipboardList, Package, ListTodo, CircleDollarSign } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import ReassignModal from "./components/ReassignModal";
import DashboardPage from "../../pages/DashboardPage";
import IntakePage from "../../pages/IntakePage";
import OMTaskBoard from "../../pages/OMTaskBoard";
import ClientsPage from "../../pages/ClientsPage";
import ProjectsPage from "../../pages/ProjectsPage";
import CalendarPage from "../../pages/CalendarPage";
import ReportsPage from "../../pages/ReportsPage";
import WorkloadPage from "../../pages/WorkloadPage";
import SettingsPage from "../../pages/SettingsPage";
import DeliverablesPage from "../../pages/DeliverablesPage";
import DirectorDashboardPage from "../../pages/DirectorDashboardPage";
import AMProjectList from "../../pages/AMProjectList";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../../lib/theme";
import { INITIAL_DELETED } from "../../lib/mockData";
import { apiGet, apiPut, getStoredAMProjectList, getStoredOMTaskBoard, saveStoredAMProjectList, saveStoredOMTaskBoard } from "../../lib/teamData";

function hasLegacySheetValues(rows) {
  return rows.some((row) => String(row.projectId || "").startsWith("P-"));
}

const OM_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "intake", label: "Intake", icon: PlusCircle },
  { key: "task-board", label: "Team Daily Tasks", icon: ClipboardList },
  { key: "deliverables", label: "Deliverables", icon: Package },
  { key: "clients", label: "Clients", icon: Users },
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "workload", label: "Workload", icon: Gauge },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function OMApp({ onSignOut, isDirector = false }) {
  const [page, setPage] = useState("dashboard");
  const [ams, setAms] = useState([]);
  const [deleted, setDeleted] = useState(INITIAL_DELETED);
  const [taskRows, setTaskRows] = useState([]);
  const [financialRows, setFinancialRows] = useState([]);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navItems = isDirector
    ? [...OM_NAV_ITEMS, { key: "financials", label: "Financials", icon: CircleDollarSign }, { key: "my-todos", label: "My To-Dos", icon: ListTodo }]
    : OM_NAV_ITEMS;

  useEffect(() => {
    apiGet("/om/account-managers")
      .then(setAms)
      .catch((error) => console.error("Could not load account managers:", error));
    if (isDirector) getStoredAMProjectList().then(setFinancialRows).catch((error) => console.error("Could not load financial project data:", error));

    const loadRows = async () => {
      const storedRows = await getStoredOMTaskBoard();
      setTaskRows(storedRows.filter((row) => !hasLegacySheetValues([row])));
    };

    loadRows();
  }, []);

  const handleTaskRowsChange = (nextRows) => {
    setTaskRows(nextRows);
    saveStoredOMTaskBoard(nextRows);
  };

  const handleFinancialRowsChange = (nextRows) => {
    setFinancialRows(nextRows);
    saveStoredAMProjectList(nextRows);
  };

  const handleIntake = () => setPage("intake");
  const handleRestore = (id) => setDeleted((prev) => prev.map((d) => (d.id === id ? { ...d, restored: true } : d)));
  const handleReassignConfirm = async ({ projectId, accountManagerId }) => {
    try {
      await apiPut(`/om/projects/${projectId}`, { accountManagerId });
      const [nextManagers, nextTasks] = await Promise.all([apiGet("/om/account-managers"), apiGet("/om/tasks")]);
      setAms(nextManagers);
      setTaskRows(nextTasks);
      setReassignTarget(null);
    } catch (error) {
      window.alert(error.message || "Could not reassign the project.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ ...fontBody, background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <Sidebar active={page} onNavigate={setPage} navItems={navItems} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
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
        {page === "dashboard" && (isDirector
          ? <DirectorDashboardPage onNavigate={setPage} />
          : <DashboardPage ams={ams} deleted={deleted} taskRows={taskRows} onNewIntake={handleIntake} onRestore={handleRestore} onReassign={setReassignTarget} />)}
        {page === "intake" && <IntakePage />}
        {page === "task-board" && <OMTaskBoard rows={taskRows} onRowsChange={handleTaskRowsChange} viewMode={isDirector ? "team" : "auto"} />}
        {page === "financials" && isDirector && <AMProjectList rows={financialRows} onRowsChange={handleFinancialRowsChange} />}
        {page === "my-todos" && isDirector && <OMTaskBoard rows={taskRows} onRowsChange={handleTaskRowsChange} viewMode="personal" />}
        {page === "deliverables" && <DeliverablesPage />}
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
