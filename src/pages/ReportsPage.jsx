import React, { useState } from "react";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { colors, fontDisplay, fontBody } from "../lib/theme";
import { REPORT_SHORTCUTS, COMPLETION_TREND } from "../lib/mockData";

// GET /api/om/reports/:type
export default function ReportsPage({ ams }) {
  const [generating, setGenerating] = useState(null);
  const generate = (key) => {
    setGenerating(key);
    setTimeout(() => setGenerating(null), 900); // demo only — real call hits the endpoint above
  };
  const perAm = ams.map((a) => ({ am: a.name, projects: a.activeProjects }));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 style={{ ...fontDisplay, color: colors.primary }} className="text-2xl sm:text-3xl font-bold">Reports</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REPORT_SHORTCUTS.map((s) => (
          <div key={s.key} className="rounded-lg p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div style={{ ...fontDisplay, color: colors.primary }} className="text-base font-bold mb-1">{s.label}</div>
            <div style={{ color: colors.muted, ...fontBody }} className="text-xs mb-4">{s.desc}</div>
            <button
              onClick={() => generate(s.key)}
              className="flex items-center justify-center gap-2 w-full rounded py-2 text-xs font-semibold"
              style={{ background: colors.primary, color: colors.neutral, ...fontBody }}
            >
              <Download size={12} />
              {generating === s.key ? "Generating..." : "Generate"}
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-4">Active Projects per AM</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perAm}>
              <XAxis dataKey="am" tick={{ fontSize: 11, fontFamily: "Montserrat" }} stroke={colors.muted} />
              <YAxis tick={{ fontSize: 11, fontFamily: "Montserrat" }} stroke={colors.muted} />
              <Tooltip />
              <Bar dataKey="projects" fill={colors.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <h3 style={{ ...fontDisplay, color: colors.primary }} className="text-lg mb-4">On-Time Delivery Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={COMPLETION_TREND}>
              <CartesianGrid stroke={colors.border} strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: "Montserrat" }} stroke={colors.muted} />
              <YAxis tick={{ fontSize: 11, fontFamily: "Montserrat" }} stroke={colors.muted} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="onTime" stroke={colors.onTrack} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}