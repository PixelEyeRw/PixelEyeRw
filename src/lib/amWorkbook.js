export function toRwf(amount) {
  const numeric = Number(amount) || 0;
  return `RWF ${numeric.toLocaleString()}`;
}

export function projectProfit(project) {
  const revenue = Number(project?.revenueSource) || 0;
  const cost = Number(project?.costSource) || 0;
  return Math.max(0, revenue - cost);
}

export function selectedProjectById(projects, projectId) {
  if (!projects.length) return null;
  return projects.find((project) => project.projectId === projectId) || projects[0] || null;
}

export function averageTaskProgress(tasks, projectId) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);
  if (!projectTasks.length) return 0;
  return Math.round(projectTasks.reduce((sum, task) => sum + (Number(task.progress) || 0), 0) / projectTasks.length);
}

export function projectApproval(tasks, projectId) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);
  if (!projectTasks.length) return "Not Required";
  const waitingClient = projectTasks.some((task) => task.approvalStatus === "Waiting Client Approval");
  if (waitingClient) return "Waiting Client Approval";
  const waitingInternal = projectTasks.some((task) => task.approvalStatus === "Waiting Internal Approval");
  if (waitingInternal) return "Waiting Internal Approval";
  const waitingOm = projectTasks.some((task) => task.approvalStatus === "Waiting OM Approval");
  if (waitingOm) return "Waiting OM Approval";
  return "Approved";
}

export function riskFromProgress(progress) {
  if (progress < 40) return "High";
  if (progress < 75) return "Medium";
  return "Low";
}

export function kpiSummary({ projects, tasks, updates, flags, selectedProjectId }) {
  const project = selectedProjectById(projects, selectedProjectId);
  if (!project) {
    return {
      project: null,
      revenueSource: 0,
      costSource: 0,
      profitSource: 0,
      satisfactionSource: 0,
      eligibility: "Not Eligible",
      bonusAmount: 0,
      progress: 0,
      approvalStatus: "Not Required",
      riskLevel: "Low",
    };
  }

  const revenueSource = Number(project.revenueSource) || 0;
  const costSource = Number(project.costSource) || 0;
  const profitSource = projectProfit(project);
  const update = updates.find((item) => item.client === project.client);
  const satisfactionSource = Number(update?.satisfactionScore) || 0;
  const progress = averageTaskProgress(tasks, project.projectId);
  const approvalStatus = projectApproval(tasks, project.projectId);
  const riskLevel = project.riskLevel || riskFromProgress(progress);

  const gateA = Boolean(flags?.paymentReceived);
  const gateB = Boolean(flags?.projectDelivered);
  const gateC = Boolean(flags?.relationshipMaintained);
  const gateD = satisfactionSource >= 8;
  const eligibility = gateA && gateB && gateC && gateD ? "Eligible" : "Not Eligible";
  const bonusAmount = eligibility === "Eligible" ? Math.round(profitSource * 0.05) : 0;

  return {
    project,
    revenueSource,
    costSource,
    profitSource,
    satisfactionSource,
    eligibility,
    bonusAmount,
    progress,
    approvalStatus,
    riskLevel,
  };
}
