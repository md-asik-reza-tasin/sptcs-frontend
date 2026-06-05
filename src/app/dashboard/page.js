"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Badge from "@/components/common/Badge";
import Card from "@/components/common/Card";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import ChartCard from "@/components/dashboard/ChartCard";
import KpiCard from "@/components/dashboard/KpiCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

const emptyList = [];
const CHART_COLORS = {
  blue: "#2563eb",
  green: "#16a34a",
  amber: "#f59e0b",
  red: "#dc2626",
  purple: "#7c3aed",
  slate: "#64748b",
};

const statusColors = {
  Todo: CHART_COLORS.blue,
  "In Progress": CHART_COLORS.amber,
  Completed: CHART_COLORS.green,
};

const priorityColors = {
  High: CHART_COLORS.red,
  Medium: CHART_COLORS.amber,
  Low: CHART_COLORS.blue,
};

function formatDate(date) {
  if (!date) return "No date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "No date";

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getProjectName(item) {
  return item?.project?.name || item?.projectName || "No project";
}

function getMemberName(item) {
  return item?.assignedMember?.name || item?.member?.name || item?.memberName || "Unassigned";
}

function getMemberEmail(item) {
  return item?.member?.email || item?.email || item?.assignedMember?.email || "No email";
}

function getProgressPercent(completedTasks, totalTasks) {
  if (!totalTasks) return 0;

  return Math.round((completedTasks / totalTasks) * 100);
}

function hasChartData(data) {
  return data.some((item) => Number(item.value || item.progress || item.completionRate) > 0);
}

function getPriorityBadgeVariant(priority) {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  if (priority === "low") return "info";

  return "default";
}

function getStatusVariant(status) {
  if (status === "completed") return "success";
  if (status === "in_progress") return "warning";
  return "info";
}

function formatStatus(status) {
  const labels = {
    todo: "Todo",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return labels[status] || status || "Unknown";
}

function Section({ title, description, children }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="mb-5 min-w-0">
        <h2 className="break-words text-lg font-bold text-slate-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 break-words text-sm text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload || {};

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-bold text-slate-900">{label || item.name || item.projectName || item.memberName}</p>
      {item.totalTasks !== undefined ? <p>Total: {item.totalTasks}</p> : null}
      {item.completedTasks !== undefined ? <p>Completed: {item.completedTasks}</p> : null}
      {item.pendingTasks !== undefined ? <p>Pending: {item.pendingTasks}</p> : null}
      {item.progress !== undefined ? <p>Progress: {item.progress}%</p> : null}
      {item.completionRate !== undefined ? <p>Completion: {item.completionRate}%</p> : null}
      {item.value !== undefined ? <p>Count: {item.value}</p> : null}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardSummary() {
      setError("");

      try {
        const response = await api.get("/api/dashboard/summary");

        setSummary(response.data?.data || null);
      } catch (error) {
        setError(getErrorMessage(error, "Failed to load dashboard analytics."));
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardSummary();
  }, []);

  const recentActivities = summary?.recentActivities || emptyList;
  const upcomingDeadlines = summary?.upcomingDeadlines || emptyList;
  const highPriorityTasks = summary?.highPriorityTasks || emptyList;
  const tasksByPriority = summary?.tasksByPriority || emptyList;
  const taskStatusDistribution = summary?.taskStatusDistribution || emptyList;
  const projectProgressTrend = summary?.projectProgressTrend || emptyList;
  const teamProductivityOverview = summary?.teamProductivityOverview || emptyList;
  const memberWorkload = summary?.memberWorkload || emptyList;

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Project progress and productivity analytics"
    >
      {loading ? <Loader text="Loading dashboard analytics..." /> : null}

      {!loading && error ? (
        <Card>
          <ErrorMessage message={error} />
        </Card>
      ) : null}

      {!loading && !error && !summary ? (
        <EmptyState
          title="No dashboard data"
          description="Create projects and tasks to see analytics."
        />
      ) : null}

      {!loading && !error && summary ? (
        <div className="space-y-6">
          <section className="overflow-hidden rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="break-words text-3xl font-bold text-slate-950 sm:text-4xl">
                  Analytics Overview
                </h1>
                <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-slate-600 sm:text-base">
                  Monitor project progress, workload balance, priorities, and delivery risk from one dashboard.
                </p>
              </div>
              <div className="w-full rounded-md border border-slate-200 bg-slate-50 px-5 py-4 sm:w-auto">
                <p className="text-xs font-bold uppercase text-slate-500">Today</p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {formatDate(new Date())}
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              accent="bg-blue-600"
              label="Total Projects"
              value={summary.totalProjects || 0}
              description="Projects visible to your role"
            />
            <KpiCard
              accent="bg-purple-600"
              label="Total Tasks"
              value={summary.totalTasks || 0}
              description="Tasks tracked in the workspace"
            />
            <KpiCard
              accent="bg-green-600"
              label="Completed Tasks"
              value={summary.completedTasks || 0}
              description="Tasks with completed status"
            />
            <KpiCard
              accent="bg-amber-500"
              label="Pending Tasks"
              value={summary.pendingTasks || 0}
              description="Tasks still in todo status"
            />
            <KpiCard
              accent="bg-red-600"
              label="Overdue Tasks"
              value={summary.overdueTasks || 0}
              description="Open tasks past deadline"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartCard
              title="Task Status Distribution"
              description="Todo, in-progress, and completed task mix"
            >
              {hasChartData(taskStatusDistribution) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={taskStatusDistribution}
                      dataKey="value"
                      innerRadius={64}
                      nameKey="name"
                      outerRadius={104}
                      paddingAngle={3}
                    >
                      {taskStatusDistribution.map((item) => (
                        <Cell
                          fill={statusColors[item.name] || CHART_COLORS.slate}
                          key={item.name}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<AnalyticsTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No task status data" />
              )}
            </ChartCard>

            <ChartCard
              title="Tasks by Priority"
              description="Priority distribution across current tasks"
            >
              {hasChartData(tasksByPriority) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tasksByPriority}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<AnalyticsTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {tasksByPriority.map((item) => (
                        <Cell
                          fill={priorityColors[item.name] || CHART_COLORS.blue}
                          key={item.name}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No priority data" />
              )}
            </ChartCard>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartCard
              title="Project Progress Trend"
              description="Completion percentage across recent projects"
            >
              {projectProgressTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={projectProgressTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="projectName" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<AnalyticsTooltip />} />
                    <Bar
                      dataKey="progress"
                      fill={CHART_COLORS.purple}
                      name="Progress"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No project progress data" />
              )}
            </ChartCard>

            <ChartCard
              title="Team Productivity Overview"
              description="Completion rate and task ownership by member"
            >
              {teamProductivityOverview.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={teamProductivityOverview}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="memberName" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip content={<AnalyticsTooltip />} />
                    <Bar
                      dataKey="completionRate"
                      fill={CHART_COLORS.green}
                      name="Completion Rate"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No productivity data" />
              )}
            </ChartCard>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
            <Section
              title="Recent Activities"
              description="Latest collaboration updates"
            >
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div className="flex gap-4" key={activity._id || index}>
                      <div className="flex flex-col items-center">
                        <span className="mt-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                        {index !== recentActivities.length - 1 ? (
                          <span className="mt-2 h-full min-h-10 w-px bg-slate-200" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 rounded-md bg-slate-50 px-4 py-3">
                        <p className="break-words text-sm font-semibold text-slate-800">
                          {activity.message || "Activity update"}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-500">
                          {activity.user?.name || "System"}
                          {activity.user?.role ? ` (${activity.user.role})` : ""} -{" "}
                          {formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No activities yet" />
              )}
            </Section>

            <Section
              title="Member Workload Summary"
              description="Task ownership and completion progress"
            >
              {memberWorkload.length > 0 ? (
                <div className="space-y-4">
                  {memberWorkload.map((member, index) => {
                    const totalTasks = member.totalTasks || 0;
                    const completedTasks = member.completedTasks || 0;
                    const pendingTasks = member.pendingTasks || 0;
                    const percent = getProgressPercent(completedTasks, totalTasks);

                    return (
                      <div
                        className="rounded-md border border-slate-100 bg-slate-50 p-4"
                        key={member.member?._id || index}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-bold text-slate-900">
                              {getMemberName(member)}
                            </p>
                            <p className="mt-1 break-words text-xs text-slate-500">
                              {getMemberEmail(member)}
                            </p>
                          </div>
                          <Badge variant="success">{percent}%</Badge>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-md bg-white px-2 py-2">
                            <p className="font-bold text-slate-950">{totalTasks}</p>
                            <p className="text-slate-500">Total</p>
                          </div>
                          <div className="rounded-md bg-white px-2 py-2">
                            <p className="font-bold text-green-700">{completedTasks}</p>
                            <p className="text-slate-500">Done</p>
                          </div>
                          <div className="rounded-md bg-white px-2 py-2">
                            <p className="font-bold text-amber-700">{pendingTasks}</p>
                            <p className="text-slate-500">Pending</p>
                          </div>
                        </div>
                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No workload data" />
              )}
            </Section>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Section title="Upcoming Deadlines" description="Open tasks coming due soon">
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDeadlines.map((task, index) => (
                    <div className="rounded-md border border-slate-100 bg-slate-50 p-4" key={task._id || index}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold text-slate-900">
                            {task.title || "Untitled task"}
                          </p>
                          <p className="mt-1 break-words text-xs text-slate-500">
                            {getProjectName(task)}
                          </p>
                          <p className="mt-1 break-words text-xs text-slate-500">
                            Assigned to {getMemberName(task)}
                          </p>
                        </div>
                        <Badge variant="info" className="shrink-0">
                          {formatDate(task.dueDate)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No upcoming deadlines" />
              )}
            </Section>

            <Section title="High Priority Tasks" description="Important open work">
              {highPriorityTasks.length > 0 ? (
                <div className="space-y-3">
                  {highPriorityTasks.map((task, index) => (
                    <div className="rounded-md border border-red-100 bg-red-50/50 p-4" key={task._id || index}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold text-slate-900">
                            {task.title || "Untitled task"}
                          </p>
                          <p className="mt-1 break-words text-xs text-slate-500">
                            {getProjectName(task)}
                          </p>
                          <p className="mt-1 break-words text-xs text-slate-500">
                            Assigned to {getMemberName(task)}
                          </p>
                          <p className="mt-1 break-words text-xs text-slate-500">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getStatusVariant(task.status)}>
                            {formatStatus(task.status)}
                          </Badge>
                          <Badge variant={getPriorityBadgeVariant(task.priority)}>
                            {task.priority || "priority"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No high priority tasks" />
              )}
            </Section>
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
