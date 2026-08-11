import React, { useState, useEffect } from "react";
import { Gauge, BarChart3, Settings as SettingsIcon } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../../lib/theme";
import OMTaskBoard from "../../pages/OMTaskBoard";
import ReportsPage from "../../pages/ReportsPage";
import SettingsPage from "../../pages/SettingsPage";
import { INITIAL_OM_TASK_BOARD } from "../../lib/mockData";
import { getStoredOMTaskBoard, saveStoredOMTaskBoard } from "../../lib/teamData";

const PRODUCTION_NAV_ITEMS = [
  { key: "mytasks", label: "My Daily Tasks", icon: Gauge },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function ProductionApp({ onSignOut }) {
  const [page, setPage] = useState("mytasks");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [taskBoardRows, setTaskBoardRows] = useState([]);

  useEffect(() => {
    const storedTaskBoard = getStoredOMTaskBoard();
    if (storedTaskBoard.length > 0) {
      setTaskBoardRows(storedTaskBoard);
    } else {
      setTaskBoardRows(INITIAL_OM_TASK_BOARD);
      saveStoredOMTaskBoard(INITIAL_OM_TASK_BOARD);
    }
  }, []);

  const handleTaskBoardRowsChange = (nextRows) => {
    setTaskBoardRows(nextRows);
    saveStoredOMTaskBoard(nextRows);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ ...fontBody, background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <Sidebar
        active={page}
        onNavigate={setPage}
        navItems={PRODUCTION_NAV_ITEMS}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <Topbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="px-4 py-2 flex justify-end">
          <button onClick={onSignOut} className="rounded px-3 py-2 text-sm font-semibold" style={{ border: `1px solid ${colors.border}` }}>Sign out</button>
        </div>

        {page === "mytasks" && <OMTaskBoard rows={taskBoardRows} onRowsChange={handleTaskBoardRowsChange} />}
        {page === "reports" && <ReportsPage />}
        {page === "settings" && <SettingsPage />}
        {!["mytasks", "reports", "settings"].includes(page) && <OMTaskBoard rows={taskBoardRows} onRowsChange={handleTaskBoardRowsChange} />}
      </div>
    </div>
  );
}
