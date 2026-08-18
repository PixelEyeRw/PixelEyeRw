import React, { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { colors, fontBody, fontDisplay } from "../lib/theme";
import { getSession, getStoredAMProjectSubmissions, saveStoredAMProjectSubmissions } from "../lib/teamData";
import { PRODUCTION_ROLES, TEAM_MEMBERS } from "../lib/mockData";

const emptyDeliverable = () => ({
  id: `deliverable_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  description: "",
  deadline: "",
  role: PRODUCTION_ROLES[0]?.name || "",
  assignee: "",
  customAssignee: "",
  mainTask: "",
});

export default function AMNewProjectPage({ onSubmitted = () => {} }) {
  const session = getSession();
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");
  const [comment, setComment] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [deliverables, setDeliverables] = useState([emptyDeliverable()]);
  const [message, setMessage] = useState("");

  const updateDeliverable = (id, field, value) => {
    setDeliverables((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!client.trim() || !project.trim() || !objective.trim() || !description.trim()) {
      setMessage("Client, project, objective, and description are required.");
      return;
    }
    const validDeliverables = deliverables.filter((item) => item.name.trim() && item.deadline);
    if (!validDeliverables.length) {
      setMessage("Add at least one deliverable with a deadline.");
      return;
    }

    const submission = {
      id: `submission_${Date.now()}`,
      projectId: `AM-${Date.now().toString().slice(-6)}`,
      client: client.trim(),
      project: project.trim(),
      objective: objective.trim(),
      description: description.trim(),
      priority,
      deadline,
      comment: comment.trim(),
      attachmentName,
      deliverables: validDeliverables.map((item, index) => ({
        ...item,
        name: item.name.trim(),
        description: item.description.trim(),
        mainTask: item.mainTask.trim() || item.name.trim(),
        stage: `Deliverable ${index + 1}`,
        assignee: item.assignee === "custom" ? item.customAssignee.trim() : item.assignee,
        status: "Not Started",
        progress: 0,
        approvalStatus: "Not Required",
        nextAction: "Begin deliverable",
      })),
      submittedBy: session?.name || "Account Manager",
      submittedAt: new Date().toISOString(),
      status: "Pending Review",
    };

    const next = [submission, ...getStoredAMProjectSubmissions()];
    saveStoredAMProjectSubmissions(next);
    setMessage("Project submitted for Operations Manager review.");
    setClient("");
    setProject("");
    setObjective("");
    setDescription("");
    setPriority("Medium");
    setDeadline("");
    setComment("");
    setAttachmentName("");
    setDeliverables([emptyDeliverable()]);
    onSubmitted(submission);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ ...fontDisplay, color: colors.primary }}>Start New Project</h1>
        <p className="mt-2 text-sm" style={{ ...fontBody, color: colors.muted }}>Create a project brief, add its deliverables, and submit it to Operations for approval.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <h2 className="text-lg font-semibold" style={{ ...fontBody, color: colors.primary }}>Project details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Client" value={client} onChange={setClient} placeholder="Client name" />
            <Field label="Project name" value={project} onChange={setProject} placeholder="Project title" />
            <Field label="Objective" value={objective} onChange={setObjective} placeholder="What should this project achieve?" />
            <Field label="Target deadline" type="date" value={deadline} onChange={setDeadline} />
            <label className="space-y-1 text-sm" style={fontBody}>
              <span className="text-xs uppercase font-semibold" style={{ color: colors.muted }}>Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full rounded p-2" style={{ border: `1px solid ${colors.border}` }}>
                <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
              </select>
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextArea label="Description" value={description} onChange={setDescription} placeholder="Scope, context, dependencies, and constraints" />
            <TextArea label="Comment for Operations" value={comment} onChange={setComment} placeholder="Anything the OM should know before approval" />
          </div>
          <label className="mt-4 block text-sm" style={fontBody}>
            <span className="text-xs uppercase font-semibold block mb-1" style={{ color: colors.muted }}>Attach document</span>
            <span className="flex items-center gap-2 rounded p-2" style={{ border: `1px solid ${colors.border}` }}>
              <Upload size={15} color={colors.muted} />
              <input type="file" onChange={(event) => setAttachmentName(event.target.files?.[0]?.name || "")} className="text-xs" />
            </span>
            {attachmentName && <span className="text-xs mt-1 block" style={{ color: colors.muted }}>{attachmentName}</span>}
          </label>
        </section>

        <section className="rounded-xl p-5" style={{ background: colors.neutral, border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold" style={{ ...fontBody, color: colors.primary }}>Deliverables</h2>
              <p className="mt-1 text-sm" style={{ ...fontBody, color: colors.muted }}>Each deliverable becomes one Project Progress row after approval.</p>
            </div>
            <button type="button" onClick={() => setDeliverables((current) => [...current, emptyDeliverable()])} className="inline-flex items-center gap-1 rounded px-3 py-2 text-xs font-semibold" style={{ background: colors.primary, color: colors.neutral }}><Plus size={14} /> Add deliverable</button>
          </div>
          <div className="mt-4 space-y-4">
            {deliverables.map((item, index) => (
              <div key={item.id} className="rounded-lg p-4" style={{ background: "#FAF9F6", border: `1px solid ${colors.border}` }}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>Deliverable {index + 1}</h3>
                  {deliverables.length > 1 && <button type="button" onClick={() => setDeliverables((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Remove deliverable" className="p-1"><Trash2 size={15} color={colors.danger} /></button>}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Deliverable name" value={item.name} onChange={(value) => updateDeliverable(item.id, "name", value)} placeholder="What will be delivered?" />
                  <Field label="Deadline" type="date" value={item.deadline} onChange={(value) => updateDeliverable(item.id, "deadline", value)} />
                  <Field label="Main task" value={item.mainTask} onChange={(value) => updateDeliverable(item.id, "mainTask", value)} placeholder="Editable task label" />
                  <label className="space-y-1 text-sm" style={fontBody}>
                    <span className="text-xs uppercase font-semibold" style={{ color: colors.muted }}>Role</span>
                    <select value={item.role} onChange={(event) => updateDeliverable(item.id, "role", event.target.value)} className="w-full rounded p-2" style={{ border: `1px solid ${colors.border}` }}>
                      {PRODUCTION_ROLES.map((role) => <option key={role.id} value={role.name}>{role.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm" style={fontBody}>
                    <span className="text-xs uppercase font-semibold" style={{ color: colors.muted }}>Assigned person</span>
                    <select value={item.assignee} onChange={(event) => updateDeliverable(item.id, "assignee", event.target.value)} className="w-full rounded p-2" style={{ border: `1px solid ${colors.border}` }}>
                      <option value="">Select a person or type a name</option>
                      {TEAM_MEMBERS.filter((member) => member.role.toLowerCase() === item.role.toLowerCase()).map((member) => <option key={member.id} value={member.name}>{member.name}</option>)}
                      <option value="custom">Type a name manually</option>
                    </select>
                  </label>
                  {item.assignee === "custom" && <Field label="Person name" value={item.customAssignee} onChange={(value) => updateDeliverable(item.id, "customAssignee", value)} placeholder="Assigned person's name" />}
                  <TextArea label="Deliverable description" value={item.description} onChange={(value) => updateDeliverable(item.id, "description", value)} placeholder="Acceptance criteria or notes" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {message && <div className="rounded-lg p-3 text-sm" style={{ background: "#EFF6FF", border: `1px solid ${colors.border}`, color: colors.primary, ...fontBody }}>{message}</div>}
        <button type="submit" className="rounded px-5 py-3 text-sm font-semibold" style={{ background: colors.primary, color: colors.neutral, ...fontBody }}>Submit for review</button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return <label className="space-y-1 text-sm" style={fontBody}><span className="text-xs uppercase font-semibold" style={{ color: colors.muted }}>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded p-2" style={{ border: `1px solid ${colors.border}` }} /></label>;
}

function TextArea({ label, value, onChange, placeholder }) {
  return <label className="space-y-1 text-sm" style={fontBody}><span className="text-xs uppercase font-semibold" style={{ color: colors.muted }}>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} className="w-full rounded p-2" style={{ border: `1px solid ${colors.border}` }} /></label>;
}
