import React, { useState, useMemo } from "react";
import { User, CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { colors, fontDisplay, fontBody } from "../lib/theme";

export default function EmployeeCards({ employees = [], dailyTasks = [], projects = [] }) {
  const [expandedCard, setExpandedCard] = useState(null);

  const enrichedEmployees = useMemo(() => {
    return employees.map((employee) => {
      const employeeTasks = dailyTasks.filter((task) => task.employeeId === employee.id);
      const employeeProjects = projects.filter((project) => project.am === employee.name);
      
      const completedTasks = employeeTasks.filter((task) => task.status === "done").length;
      const inProgressTasks = employeeTasks.filter((task) => task.status === "in-progress").length;
      const totalTasks = employeeTasks.length;
      
      // Determine delivery performance
      let performanceStatus = "good";
      let performanceIcon = TrendingUp;
      let performanceColor = colors.onTrack;
      
      if (employee.onTimeDeliveryRate < 80) {
        performanceStatus = "needs-attention";
        performanceIcon = TrendingDown;
        performanceColor = colors.danger;
      } else if (employee.onTimeDeliveryRate < 90) {
        performanceStatus = "moderate";
        performanceIcon = AlertCircle;
        performanceColor = colors.warn;
      }
      
      return {
        ...employee,
        dailyTasks: employeeTasks,
        ongoingProjects: employeeProjects,
        completedTasks,
        inProgressTasks,
        totalTasks,
        performanceStatus,
        performanceIcon,
        performanceColor,
      };
    });
  }, [employees, dailyTasks, projects]);

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ ...fontDisplay, color: colors.primary }}>
          Team Activity & Performance
        </h2>
        <p className="text-sm" style={{ ...fontBody, color: colors.muted }}>
          {enrichedEmployees.length} active team members
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {enrichedEmployees.map((employee) => {
          const isExpanded = expandedCard === employee.id;
          const PerformanceIcon = employee.performanceIcon;

          return (
            <div
              key={employee.id}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: colors.neutral,
                border: `1px solid ${colors.border}`,
                boxShadow: isExpanded ? "0 8px 16px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: colors.primary, color: colors.neutral }}
                  >
                    {employee.avatar ? (
                      <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ ...fontBody, color: colors.primary }}>
                      {employee.name}
                    </div>
                    <div className="text-xs" style={{ ...fontBody, color: colors.muted }}>
                      {employee.role}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCard(employee.id)}
                  className="p-1 rounded hover:bg-gray-100"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <ChevronUp size={18} color={colors.muted} /> : <ChevronDown size={18} color={colors.muted} />}
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-lg p-2 text-center" style={{ background: colors.tertiary }}>
                  <div className="text-xs font-semibold" style={{ ...fontBody, color: colors.muted }}>
                    Tasks
                  </div>
                  <div className="text-lg font-bold mt-1" style={{ ...fontBody, color: colors.primary }}>
                    {employee.totalTasks}
                  </div>
                </div>
                <div className="rounded-lg p-2 text-center" style={{ background: colors.tertiary }}>
                  <div className="text-xs font-semibold" style={{ ...fontBody, color: colors.muted }}>
                    Done
                  </div>
                  <div className="text-lg font-bold mt-1" style={{ ...fontBody, color: colors.onTrack }}>
                    {employee.completedTasks}
                  </div>
                </div>
                <div className="rounded-lg p-2 text-center" style={{ background: colors.tertiary }}>
                  <div className="text-xs font-semibold" style={{ ...fontBody, color: colors.muted }}>
                    Projects
                  </div>
                  <div className="text-lg font-bold mt-1" style={{ ...fontBody, color: colors.primary }}>
                    {employee.ongoingProjects.length}
                  </div>
                </div>
              </div>

              {/* On-Time Delivery Performance */}
              <div
                className="rounded-lg p-3 flex items-center justify-between mb-3"
                style={{ background: `${employee.performanceColor}15`, border: `1px solid ${employee.performanceColor}` }}
              >
                <div>
                  <div className="text-xs font-semibold" style={{ ...fontBody, color: colors.muted }}>
                    On-Time Delivery
                  </div>
                  <div className="text-lg font-bold mt-1" style={{ ...fontBody, color: employee.performanceColor }}>
                    {employee.onTimeDeliveryRate}%
                  </div>
                </div>
                <PerformanceIcon size={24} color={employee.performanceColor} />
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="space-y-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                  {/* Daily Tasks */}
                  <div>
                    <div className="text-xs font-semibold uppercase mb-2" style={{ ...fontBody, color: colors.muted }}>
                      Today's Tasks
                    </div>
                    {employee.dailyTasks.length === 0 ? (
                      <div className="text-xs" style={{ ...fontBody, color: colors.muted }}>
                        No tasks logged today
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {employee.dailyTasks.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-lg p-2"
                            style={{ background: colors.tertiary, border: `1px solid ${colors.border}` }}
                          >
                            <div className="flex items-start gap-2">
                              {task.status === "done" ? (
                                <CheckCircle size={14} color={colors.onTrack} className="flex-shrink-0 mt-0.5" />
                              ) : (
                                <Clock size={14} color={colors.warn} className="flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium" style={{ ...fontBody, color: colors.primary }}>
                                  {task.task}
                                </div>
                                {task.comment && (
                                  <div className="text-xs mt-1" style={{ ...fontBody, color: colors.muted }}>
                                    {task.comment}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ongoing Projects */}
                  <div>
                    <div className="text-xs font-semibold uppercase mb-2" style={{ ...fontBody, color: colors.muted }}>
                      Ongoing Projects
                    </div>
                    {employee.ongoingProjects.length === 0 ? (
                      <div className="text-xs" style={{ ...fontBody, color: colors.muted }}>
                        No active projects
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {employee.ongoingProjects.slice(0, 3).map((project) => (
                          <div
                            key={project.id}
                            className="rounded p-2 text-xs"
                            style={{ background: colors.tertiary, ...fontBody, color: colors.primary }}
                          >
                            <div className="font-medium">{project.title}</div>
                            <div className="text-xs mt-0.5" style={{ color: colors.muted }}>
                              {project.client} • {project.progress}% complete
                            </div>
                          </div>
                        ))}
                        {employee.ongoingProjects.length > 3 && (
                          <div className="text-xs text-center pt-1" style={{ ...fontBody, color: colors.muted }}>
                            +{employee.ongoingProjects.length - 3} more projects
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
