import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { fontBody, GOOGLE_FONTS_IMPORT, colors } from "../../lib/theme";
import MyTasks from "../../pages/MyTasks";

export default function ProductionApp({ onSignOut }) {
  const [page, setPage] = useState("mytasks");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ ...fontBody, background: "#FAF9F6" }}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <Sidebar active={page} onNavigate={setPage} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <Topbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="px-4 py-2 flex justify-end">
          <button onClick={onSignOut} className="rounded px-3 py-2 text-sm font-semibold" style={{ border: `1px solid ${colors.border}` }}>Sign out</button>
        </div>

        <MyTasks />
      </div>
    </div>
  );
}
