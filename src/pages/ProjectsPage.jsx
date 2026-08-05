import React from "react";
import { fontBody, colors } from "../lib/theme";

export default function ProjectsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Projects (placeholder)</h1>
      <p style={{ ...fontBody, color: colors.muted }} className="mt-2">Projects listing will be here.</p>
    </div>
  );
}
