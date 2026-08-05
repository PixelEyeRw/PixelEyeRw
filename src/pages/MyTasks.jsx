import React from "react";
import { fontBody, colors } from "../lib/theme";

export default function MyTasks() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>My Tasks</h1>
      <p style={{ ...fontBody, color: colors.muted }} className="mt-2">Your personal task queue and kanban view (placeholder).</p>
    </div>
  );
}
