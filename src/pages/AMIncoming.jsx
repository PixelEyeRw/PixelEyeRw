import React, { useEffect, useState } from "react";
import { fontBody, colors } from "../lib/theme";
import { getSession } from "../lib/teamData";
import { PROJECTS } from "../lib/mockData";
import { getAMAcknowledgements, saveAMAcknowledgements } from "../lib/teamData";

export default function AMIncoming() {
  const [incoming, setIncoming] = useState([]);
  const [acks, setAcks] = useState([]);
  const session = getSession();

  useEffect(() => {
    const curAcks = getAMAcknowledgements();
    setAcks(curAcks);
    if (!session) return setIncoming([]);
    const myProjects = PROJECTS.filter((p) => p.am === session.name);
    const notAcked = myProjects.filter((p) => !curAcks.find((a) => a.accountId === session.id && a.projectId === p.id));
    setIncoming(notAcked);
  }, [session]);

  const handleAcknowledge = (projectId) => {
    if (!session) return;
    const next = [...acks, { accountId: session.id, projectId, acknowledgedAt: new Date().toISOString() }];
    saveAMAcknowledgements(next);
    setAcks(next);
    setIncoming((prev) => prev.filter((p) => p.id !== projectId));
  };

  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Incoming Assignments</h1>
        <p style={{ ...fontBody, color: colors.muted }} className="mt-2">Please sign in to view your assignments.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold" style={{ ...fontBody, color: colors.primary }}>Incoming Assignments</h1>
      <p style={{ ...fontBody, color: colors.muted }} className="mt-2">New assignments from the OM appear here for acknowledgment.</p>

      <div className="mt-4 space-y-3">
        {incoming.length === 0 && <div style={{ ...fontBody, color: colors.muted }}>No new incoming assignments.</div>}
        {incoming.map((p) => (
          <div key={p.id} className="rounded border p-3 flex items-start justify-between" style={{ borderColor: colors.border }}>
            <div>
              <div className="font-semibold" style={{ color: colors.primary, ...fontBody }}>{p.title}</div>
              <div className="text-sm" style={{ color: colors.muted, ...fontBody }}>{p.client} · Priority: {p.priority}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleAcknowledge(p.id)} className="px-3 py-2 rounded text-sm font-semibold" style={{ background: colors.primary, color: colors.neutral, ...fontBody }}>Acknowledge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
