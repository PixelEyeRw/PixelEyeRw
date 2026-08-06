import React, { useState } from "react";
import { Gauge, BarChart3, Settings as SettingsIcon } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../../lib/theme";
import MyTasks from "../../pages/MyTasks";
import ReportsPage from "../../pages/ReportsPage";
import SettingsPage from "../../pages/SettingsPage";

const PRODUCTION_NAV_ITEMS = [
  { key: "mytasks", label: "My Tasks", icon: Gauge },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function ProductionApp({ onSignOut }) {
  const [page, setPage] = useState("mytasks");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

        {page === "mytasks" && <MyTasks />}
        {page === "reports" && <ReportsPage />}
        {page === "settings" && <SettingsPage />}
        {!["mytasks", "reports", "settings"].includes(page) && <MyTasks />}
      </div>
    </div>
  );
}
