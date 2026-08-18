import React, { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Users, Briefcase, CalendarDays, BarChart3, Settings as SettingsIcon, Clipboard } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import AMDashboard from "../../pages/AMDashboard";
import AMProjectList from "../../pages/AMProjectList";
import AMTaskProgressPage from "../../pages/AMTaskProgressPage";
import AMClientUpdatesPage from "../../pages/AMClientUpdatesPage";
import AMKpiBonusPage from "../../pages/AMKpiBonusPage";
import AMNewProjectPage from "../../pages/AMNewProjectPage";
import ClientsPage from "../../pages/ClientsPage";
import ProjectsPage from "../../pages/ProjectsPage";
import CalendarPage from "../../pages/CalendarPage";
import ReportsPage from "../../pages/ReportsPage";
import SettingsPage from "../../pages/SettingsPage";
import AMIncoming from "../../pages/AMIncoming";
import OMTaskBoard from "../../pages/OMTaskBoard";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../../lib/theme";
import {
  INITIAL_AM_PROJECT_LIST,
  INITIAL_AM_TASK_PROGRESS,
  INITIAL_AM_CLIENT_UPDATES,
  INITIAL_AM_KPI_FLAGS,
  INITIAL_OM_TASK_BOARD,
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
  getStoredOMTaskBoard,
  saveStoredOMTaskBoard,
  getStoredAMProjectSubmissions,
} from "../../lib/teamData";
import { kpiSummary } from "../../lib/amWorkbook";

function hasLegacyProjectValues(rows) {
  return rows.some((row) => String(row.projectId || "").startsWith("P-"));
}

function hasLegacyTaskValues(rows) {
  return rows.some((row) => String(row.projectId || "").startsWith("P-") || row.status === "Waiting Approval");
}

function hasLegacyClientValues(rows) {
  return rows.some((row) => Number(row.satisfactionScore) === 9 && row.notes === "Example only");
}

const AM_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "task-board", label: "My Daily Tasks", icon: Clipboard },
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
  const [taskBoardRows, setTaskBoardRows] = useState([]);

  const approvedSubmissionData = (submissions, owner) => {
    const approved = submissions.filter((submission) => submission.status === "Approved" && submission.submittedBy === owner);
    return {
      projects: approved.map((submission) => ({
        id: submission.id,
        projectId: submission.projectId,
        client: submission.client,
        project: submission.project,
        accountOwner: submission.submittedBy,
        projectLead: submission.deliverables[0]?.assignee || submission.submittedBy,
        startDate: submission.submittedAt.slice(0, 10),
        targetDeadline: submission.deadline || submission.deliverables.reduce((latest, item) => item.deadline > latest ? item.deadline : latest, ""),
        priority: submission.priority,
        riskLevel: "Low",
        overallStatus: "In Progress",
        taskStage: submission.deliverables[0]?.stage || "Deliverables",
        revenueSource: 0,
        costSource: 0,
      })),
      tasks: approved.flatMap((submission) => submission.deliverables.map((item) => ({
        id: item.id,
        projectId: submission.projectId,
        client: submission.client,
        project: submission.project,
        stage: item.stage,
        deliverableName: item.name,
        mainTask: item.mainTask || item.name,
        role: item.role,
        owner: item.assignee || item.customAssignee || "Unassigned",
        status: item.status || "Not Started",
        progress: item.progress || 0,
        deadline: item.deadline,
        approvalStatus: item.approvalStatus || "Not Required",
        nextAction: item.nextAction || "Begin deliverable",
        deliverableId: item.id,
      }))),
    };
  };

  useEffect(() => {
    const session = getSession();
    const owner = session?.name || "Elena Rossi";
    const submissionData = approvedSubmissionData(getStoredAMProjectSubmissions(), owner);

    const storedProjects = getStoredAMProjectList();
    const useStoredProjects = storedProjects.length > 0 && !hasLegacyProjectValues(storedProjects);
    const effectiveProjects = storedProjects.length
      ? (useStoredProjects ? storedProjects : INITIAL_AM_PROJECT_LIST.filter((row) => row.accountOwner === owner))
      : INITIAL_AM_PROJECT_LIST.filter((row) => row.accountOwner === owner);
    const mergedProjects = [...effectiveProjects, ...submissionData.projects.filter((row) => !effectiveProjects.some((existing) => existing.projectId === row.projectId))];
    setProjectRows(mergedProjects);
    if (!useStoredProjects || submissionData.projects.length) saveStoredAMProjectList(mergedProjects);

    const storedTasks = getStoredAMTaskProgress();
    const useStoredTasks = storedTasks.length > 0 && !hasLegacyTaskValues(storedTasks);
    const effectiveTasks = useStoredTasks ? storedTasks : INITIAL_AM_TASK_PROGRESS;
    const mergedTasks = [...effectiveTasks, ...submissionData.tasks.filter((row) => !effectiveTasks.some((existing) => existing.id === row.id))];
    setTaskRows(mergedTasks);
    if (!useStoredTasks || submissionData.tasks.length) saveStoredAMTaskProgress(mergedTasks);

    const storedUpdates = getStoredAMClientUpdates();
    const useStoredUpdates = storedUpdates.length > 0 && !hasLegacyClientValues(storedUpdates);
    const effectiveUpdates = useStoredUpdates ? storedUpdates : INITIAL_AM_CLIENT_UPDATES;
    setClientUpdates(effectiveUpdates);
    if (!useStoredUpdates) saveStoredAMClientUpdates(effectiveUpdates);

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

    const storedTaskBoard = getStoredOMTaskBoard();
    if (storedTaskBoard.length > 0) {
      setTaskBoardRows(storedTaskBoard);
    } else {
      setTaskBoardRows(INITIAL_OM_TASK_BOARD);
      saveStoredOMTaskBoard(INITIAL_OM_TASK_BOARD);
    }
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

  const handleTaskBoardRowsChange = (nextRows) => {
    setTaskBoardRows(nextRows);
    saveStoredOMTaskBoard(nextRows);
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
            <button onClick={() => setPage("new-project")} className={`rounded px-3 py-2 text-sm font-semibold ${page==="new-project"?"opacity-100":"opacity-80"}`} style={{ border: `1px solid ${colors.border}` }}>New Project</button>
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
        {page === "task-board" && <OMTaskBoard rows={taskBoardRows} onRowsChange={handleTaskBoardRowsChange} />}
        {page === "clients" && <ClientsPage onNavigate={setPage} />}
        {page === "projects" && <ProjectsPage />}
        {page === "calendar" && <CalendarPage />}
        {page === "reports" && <ReportsPage />}
        {page === "settings" && <SettingsPage />}
        {page === "incoming" && <AMIncoming />}
        {page === "new-project" && <AMNewProjectPage onSubmitted={() => setPage("new-project")} />}
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
