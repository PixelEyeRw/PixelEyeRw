import React, { useEffect, useState } from "react";
import { fontBody, colors } from "../../../lib/theme";
import { apiGet } from "../../../lib/teamData";

export default function ReassignModal({ am, ams, onClose, onConfirm }) {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [targetAmId, setTargetAmId] = useState("");

  useEffect(() => {
    if (!am) return;
    apiGet("/om/projects")
      .then((rows) => setProjects(rows.filter((project) => project.am === am.name)))
      .catch((error) => window.alert(error.message || "Could not load projects for reassignment."));
  }, [am]);

  if (!am) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded p-6 z-10 w-full max-w-lg" style={{ ...fontBody }}>
        <h3 className="text-lg font-semibold" style={{ color: colors.primary }}>Reassign work from {am.name}</h3>
        <p className="text-sm mt-2" style={{ color: colors.muted }}>Move one project to another Account Manager.</p>
        <label className="block mt-4 text-xs font-semibold" style={{ color: colors.muted }}>Project
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-1 w-full rounded p-2 text-sm" style={{ border: `1px solid ${colors.border}`, ...fontBody }}>
            <option value="">Select a project</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.title} · {project.client}</option>)}
          </select>
        </label>
        <label className="block mt-3 text-xs font-semibold" style={{ color: colors.muted }}>New Account Manager
          <select value={targetAmId} onChange={(event) => setTargetAmId(event.target.value)} className="mt-1 w-full rounded p-2 text-sm" style={{ border: `1px solid ${colors.border}`, ...fontBody }}>
            <option value="">Select an account manager</option>
            {ams.filter((manager) => manager.id !== am.id).map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
          </select>
        </label>
        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded" style={{ border: `1px solid ${colors.border}` }}>Cancel</button>
          <button disabled={!projectId || !targetAmId} onClick={() => onConfirm({ projectId, accountManagerId: targetAmId })} className="px-3 py-2 rounded disabled:opacity-50" style={{ background: colors.primary, color: colors.neutral }}>Reassign</button>
        </div>
      </div>
    </div>
  );
}
