import React from "react";
import { colors, fontBody, fontDisplay } from "../lib/theme";

const REFERRAL_OPTIONS = ["No", "Yes"];

export default function AMClientUpdatesPage({ rows = [], onRowsChange = () => {} }) {
  const updateRow = (rowId, field, value) => {
    onRowsChange(rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-bold" style={{ ...fontDisplay, color: colors.primary }}>Client Update Fields - Account Manager Edits</h1>
      <div className="rounded-xl overflow-x-auto" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <table className="min-w-[1200px] w-full text-sm" style={{ ...fontBody }}>
          <thead>
            <tr style={{ background: colors.primary, color: colors.neutral }}>
              {[
                "Client",
                "Meeting Notes",
                "Client Feedback",
                "Satisfaction Score",
                "Next Client Action",
                "Upsell Opportunity",
                "Referral Asked?",
                "Notes",
              ].map((heading) => (
                <th key={heading} className="text-left px-3 py-2 font-semibold whitespace-nowrap">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b" style={{ borderColor: colors.border }}>
                <td className="px-3 py-2 whitespace-nowrap">{row.client}</td>
                <td className="px-3 py-2 min-w-[180px]">
                  <input value={row.meetingNotes} onChange={(event) => updateRow(row.id, "meetingNotes", event.target.value)} className="w-full rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }} />
                </td>
                <td className="px-3 py-2 min-w-[180px]">
                  <input value={row.clientFeedback} onChange={(event) => updateRow(row.id, "clientFeedback", event.target.value)} className="w-full rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }} />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={row.satisfactionScore}
                    onChange={(event) => updateRow(row.id, "satisfactionScore", Math.max(0, Math.min(10, Number(event.target.value) || 0)))}
                    className="w-16 rounded px-2 py-1 text-xs"
                    style={{ border: `1px solid ${colors.border}` }}
                  />
                </td>
                <td className="px-3 py-2 min-w-[180px]">
                  <input value={row.nextClientAction} onChange={(event) => updateRow(row.id, "nextClientAction", event.target.value)} className="w-full rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }} />
                </td>
                <td className="px-3 py-2 min-w-[160px]">
                  <input value={row.upsellOpportunity} onChange={(event) => updateRow(row.id, "upsellOpportunity", event.target.value)} className="w-full rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }} />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <select value={row.referralAsked} onChange={(event) => updateRow(row.id, "referralAsked", event.target.value)} className="rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }}>
                    {REFERRAL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 min-w-[180px]">
                  <input value={row.notes} onChange={(event) => updateRow(row.id, "notes", event.target.value)} className="w-full rounded px-2 py-1 text-xs" style={{ border: `1px solid ${colors.border}` }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
