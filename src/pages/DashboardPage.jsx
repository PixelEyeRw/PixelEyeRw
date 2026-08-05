import React from "react";
import { fontBody, colors } from "../lib/theme";

export default function DashboardPage({ ams = [], deleted = [], onIntake = () => {}, onRestore = () => {}, onReassign = () => {} }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Dashboard (placeholder)</h1>
      <p style={{ ...fontBody, color: colors.muted }} className="mt-2">This is a lightweight placeholder for the Dashboard page.</p>
    </div>
  );
}
