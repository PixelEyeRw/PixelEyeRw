import React, { useEffect, useState } from "react";
import { PlusCircle, ClipboardList, FileText, CheckCircle2, CalendarDays } from "lucide-react";
import { fontBody, fontDisplay, colors } from "../lib/theme";
import { getSession, getStoredIntakes, saveStoredIntakes, getStoredAMProjectSubmissions, saveStoredAMProjectSubmissions } from "../lib/teamData";

export default function IntakePage() {
  const [session, setSession] = useState(null);
  const [intakes, setIntakes] = useState([]);
  const [client, setClient] = useState("");
  const [projectName, setProjectName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [projectSubmissions, setProjectSubmissions] = useState([]);

  useEffect(() => {
    setSession(getSession());
    setIntakes(getStoredIntakes());
    setProjectSubmissions(getStoredAMProjectSubmissions());
  }, []);

  const updateSubmissionStatus = (submissionId, status) => {
    const next = projectSubmissions.map((submission) => (
      submission.id === submissionId
        ? { ...submission, status, reviewedBy: session?.name || "Operations Manager", reviewedAt: new Date().toISOString() }
        : submission
    ));
    setProjectSubmissions(next);
    saveStoredAMProjectSubmissions(next);
  };

  const saveIntakes = (next) => {
    saveStoredIntakes(next);
    setIntakes(next);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!client.trim() || !projectName.trim()) {
      setStatusMessage("Please add a client and project name.");
      return;
    }

    const next = [
      {
        id: `intake_${Date.now()}`,
        client: client.trim(),
        projectName: projectName.trim(),
        priority,
        notes: notes.trim(),
        createdBy: session?.name || "Operations Manager",
        createdAt: new Date().toLocaleString(),
        status: "Pending review",
      },
      ...intakes,
    ];

    saveIntakes(next);
    setClient("");
    setProjectName("");
    setPriority("medium");
    setNotes("");
    setStatusMessage("Intake request created successfully.");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.secondary, ...fontBody }}>
            <PlusCircle size={18} /> New intake
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2" style={{ ...fontDisplay, color: colors.primary }}>Create intake request</h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ ...fontBody, color: colors.muted }}>
            Submit a new studio intake and route it to the account management and production pipeline.
          </p>
        </div>
        <div className="rounded-3xl p-4" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Your role</div>
          <div className="mt-2 text-base font-semibold" style={{ ...fontBody, color: colors.primary }}>{session?.role || "Operations Manager"}</div>
          <div className="mt-1 text-sm" style={{ ...fontBody, color: colors.muted }}>Submitting as {session?.name || "the OM"}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Client</span>
              <input
                value={client}
                onChange={(event) => setClient(event.target.value)}
                placeholder="Client name"
                className="w-full rounded-xl p-3 text-sm"
                style={{ border: `1px solid ${colors.border}`, ...fontBody }}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Project name</span>
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Project brief title"
                className="w-full rounded-xl p-3 text-sm"
                style={{ border: `1px solid ${colors.border}`, ...fontBody }}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <label className="space-y-2">
              <span className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-xl p-3 text-sm"
                style={{ border: `1px solid ${colors.border}`, ...fontBody }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Requested delivery</span>
              <input
                type="date"
                className="w-full rounded-xl p-3 text-sm"
                style={{ border: `1px solid ${colors.border}`, ...fontBody }}
              />
            </label>
          </div>

          <label className="block mt-4 space-y-2">
            <span className="text-xs uppercase font-semibold" style={{ ...fontBody, color: colors.muted }}>Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Describe the intake request, scope, and any key dependencies."
              className="w-full rounded-xl p-3 text-sm"
              style={{ border: `1px solid ${colors.border}`, ...fontBody }}
            />
          </label>

          {statusMessage && (
            <div className="rounded-2xl p-3 mt-4" style={{ background: "#EFF6FF", border: `1px solid ${colors.border}`, ...fontBody, color: colors.primary }}>
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ background: colors.primary, color: colors.neutral, ...fontBody }}
          >
            <FileText size={16} /> Submit intake request
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.primary, ...fontBody }}>
              <ClipboardList size={16} /> Intake guidance
            </div>
            <div className="mt-4 space-y-3 text-sm" style={{ ...fontBody, color: colors.muted }}>
              <p>Use this form to create a new intake request for the studio.</p>
              <p>Include the client, project name, priority, and any dependencies for AMs or production.</p>
              <p>High-priority intake should be routed immediately to the account team.</p>
            </div>
          </div>

          <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.primary, ...fontBody }}>
              <CalendarDays size={16} /> Recent intake requests
            </div>
            <div className="mt-4 space-y-3">
              {intakes.length === 0 ? (
                <p style={{ ...fontBody, color: colors.muted }} className="text-sm">No intake requests yet. Create one to kick off a new project.</p>
              ) : (
                intakes.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-2xl p-3" style={{ background: colors.tertiary, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold" style={{ ...fontBody, color: colors.primary }}>{item.projectName}</div>
                        <div className="text-xs" style={{ ...fontBody, color: colors.muted }}>{item.client}</div>
                      </div>
                      <span className="text-xs font-semibold rounded-full px-2 py-1" style={{ background: colors.primary, color: colors.neutral, ...fontBody }}>{item.priority}</span>
                    </div>
                    <div className="mt-2 text-xs" style={{ ...fontBody, color: colors.muted }}>{item.createdAt}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: colors.primary, ...fontBody }}>
              <CheckCircle2 size={16} /> Workflow roles
            </div>
            <div className="mt-4 text-sm" style={{ ...fontBody, color: colors.muted }}>
              This intake will be visible to AMs and production when they log in, so the Operations Manager can track new requests and align priorities with the studio pipeline.
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-3xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ ...fontBody, color: colors.primary }}>AM project submissions</h2>
            <p className="mt-1 text-sm" style={{ ...fontBody, color: colors.muted }}>Approve a submitted project to make it visible in the AM Project List and generate its Project Progress rows.</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {projectSubmissions.length === 0 ? (
            <p className="text-sm" style={{ ...fontBody, color: colors.muted }}>No AM project submissions awaiting review.</p>
          ) : projectSubmissions.map((submission) => (
            <div key={submission.id} className="rounded-2xl p-4" style={{ background: colors.tertiary, border: `1px solid ${colors.border}` }}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="font-semibold" style={{ ...fontBody, color: colors.primary }}>{submission.project}</div>
                  <div className="text-sm" style={{ ...fontBody, color: colors.muted }}>{submission.client} · {submission.submittedBy} · {submission.deliverables.length} deliverables</div>
                  <div className="mt-2 text-sm" style={{ ...fontBody, color: colors.primary }}>{submission.objective}</div>
                  {submission.attachmentName && <div className="mt-1 text-xs" style={{ ...fontBody, color: colors.muted }}>Attachment: {submission.attachmentName}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: submission.status === "Approved" ? colors.onTrack : submission.status === "Rejected" ? colors.danger : colors.warn, color: colors.neutral }}>{submission.status}</span>
                  {submission.status === "Pending Review" && (
                    <>
                      <button type="button" onClick={() => updateSubmissionStatus(submission.id, "Rejected")} className="rounded px-3 py-2 text-xs font-semibold" style={{ border: `1px solid ${colors.danger}`, color: colors.danger }}>Reject</button>
                      <button type="button" onClick={() => updateSubmissionStatus(submission.id, "Approved")} className="rounded px-3 py-2 text-xs font-semibold" style={{ background: colors.primary, color: colors.neutral }}>Approve</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
