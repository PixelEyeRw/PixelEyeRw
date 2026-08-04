import React, { useState } from "react";
import { X } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";

// POST /api/om/account-managers/:id/reassign — moves projects/tasks to another AM
export default function ReassignModal({ am, ams, onClose, onConfirm }) {
  const [target, setTarget] = useState("");
  const options = ams.filter((a) => a.id !== am.id);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div className="rounded-lg p-6 w-96" style={{ background: colors.neutral }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-xl">
            Reassign workload
          </h3>
          <button onClick={onClose} aria-label="Close">
            <X size={18} color={colors.muted} />
          </button>
        </div>
        <p style={{ ...fontBody, color: colors.muted }} className="text-sm mb-4">
          {am.name} is over capacity ({am.activeProjects}/{am.capacityMax} active projects).
        </p>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full rounded p-2 mb-4"
          style={{ ...fontBody, border: `1px solid ${colors.border}` }}
        >
          <option value="">Select account manager...</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.activeProjects}/{o.capacityMax})
            </option>
          ))}
        </select>
        <button
          disabled={!target}
          onClick={() => onConfirm(target)}
          className="w-full rounded py-2 font-semibold disabled:opacity-40"
          style={{ ...fontBody, background: colors.primary, color: colors.neutral }}
        >
          Confirm reassignment
        </button>
      </div>
    </div>
  );
}