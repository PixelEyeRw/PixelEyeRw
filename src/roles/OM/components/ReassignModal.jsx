import React from "react";
import { fontBody, colors } from "../../../lib/theme";

export default function ReassignModal({ am, ams, onClose, onConfirm }) {
  if (!am) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="bg-white rounded p-6 z-10 w-full max-w-lg" style={{ ...fontBody }}>
        <h3 className="text-lg font-semibold" style={{ color: colors.primary }}>Reassign work from {am.name}</h3>
        <p className="text-sm mt-2" style={{ color: colors.muted }}>Choose a new Account Manager to receive the selected work.</p>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded" style={{ border: `1px solid ${colors.border}` }}>Cancel</button>
          <button onClick={() => onConfirm(ams[0]?.id)} className="px-3 py-2 rounded" style={{ background: colors.primary, color: colors.neutral }}>Reassign</button>
        </div>
      </div>
    </div>
  );
}
