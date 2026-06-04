"use client";

import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/common/Badge";
import Card from "@/components/common/Card";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

const emptyList = [];

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
  return (
    item?.assignedTo?.name ||
    item?.assignedMember?.name ||
    item?.member?.name ||
    item?.name ||
    "Unassigned"
  );
}

function getMemberEmail(item) {
  return item?.email || item?.member?.email || item?.assignedMember?.email || "No email";
}

function getCount(item) {
  return item?.count ?? item?.total ?? item?.totalTasks ?? 0;
}

function countMapToList(data, keys, fieldName) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return emptyList;
  }

  return keys.map((key) => ({
    [fieldName]: key,
    _id: key,
    count: data[key] || 0,
  }));
}

function getLabel(item, fallback) {
  return item?.status || item?.priority || item?._id || fallback;
}

function formatStatus(status) {
  const labels = {
    todo: "Todo",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return labels[status] || status || "Unknown";
}

function getPriorityBadgeVariant(priority) {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  if (priority === "low") return "info";

  return "default";
}

function getStatusVariant(status) {
  if (status === "completed") return "success";
  if (status === "in_progress") return "purple";
  if (status === "todo") return "info";

  return "default";
}

function getProgressPercent(value, total) {
  if (!total) return 0;

  return Math.round((value / total) * 100);
}

function StatCard({ accent, description, icon, label, value }) {
  return (
    <Card className="group min-h-[150px] overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg shadow-sm ${accent}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 break-words text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Card>
  );
}

function Section({ title, subtitle, children, className = "" }) {
  return (
    <Card className={className}>
      <div className="mb-5 min-w-0">
        <h2 className="break-words text-lg font-bold tracking-tight text-slate-950">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 break-words text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

function ProgressRow({ label, value, total, color = "bg-blue-600" }) {
  const percent = getProgressPercent(value, total);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="break-words font-semibold capitalize text-slate-700">
          {label}
        </span>
        <span className="shrink-0 font-bold text-slate-950">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardSummary() {
      try {
        const response = await api.get("/api/dashboard/summary");

        setSummary(response.data?.data || null);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Something went wrong. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardSummary();
  }, []);

  const recentActivities = summary?.recentActivities || emptyList;
  const upcomingDeadlines = summary?.upcomingDeadlines || emptyList;
  const highPriorityTasks = summary?.highPriorityTasks || emptyList;
  const tasksByPriority = useMemo(() => {
    return countMapToList(summary?.tasksByPriority, ["high", "medium", "low"], "priority");
  }, [summary?.tasksByPriority]);

  const taskStatusDistribution = useMemo(() => {
    return countMapToList(
      summary?.taskStatusDistribution,
      ["todo", "in_progress", "completed"],
      "status",
    );
  }, [summary?.taskStatusDistribution]);

  const memberWorkload = summary?.memberWorkload || emptyList;

  const totalPriorityTasks = useMemo(() => {
    return tasksByPriority.reduce((total, item) => total + getCount(item), 0);
  }, [tasksByPriority]);

  const totalStatusTasks = useMemo(() => {
    return taskStatusDistribution.reduce((total, item) => total + getCount(item), 0);
  }, [taskStatusDistribution]);

  const today = formatDate(new Date());

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of your projects and team performance"
    >
      {loading ? <Loader text="Loading dashboard..." /> : null}

      {!loading && error ? (
        <Card>
          <ErrorMessage message={error} />
        </Card>
      ) : null}

      {!loading && !error && !summary ? (
        <EmptyState
          title="No dashboard data"
          description="Create projects and tasks to see insights."
        />
      ) : null}

      {!loading && !error && summary ? (
        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50 p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Project Overview
                </h1>
                <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-slate-600 sm:text-base">
                  Track projects, tasks, deadlines, and team productivity.
                </p>
              </div>

              <div className="w-full rounded-2xl border border-blue-100 bg-white/80 px-5 py-4 shadow-sm sm:w-auto">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Today
                </p>
                <p className="mt-1 break-words text-lg font-bold text-slate-950">
                  {today}
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              accent="bg-blue-100 text-blue-700"
              icon="P"
              label="Total Projects"
              value={summary.totalProjects || 0}
              description="All projects in your workspace"
            />
            <StatCard
              accent="bg-violet-100 text-violet-700"
              icon="T"
              label="Total Tasks"
              value={summary.totalTasks || 0}
              description="All tasks across every project"
            />
            <StatCard
              accent="bg-green-100 text-green-700"
              icon="C"
              label="Completed Tasks"
              value={summary.completedTasks || 0}
              description="Tasks finished by the team"
            />
            <StatCard
              accent="bg-amber-100 text-amber-700"
              icon="W"
              label="Pending Tasks"
              value={summary.pendingTasks || 0}
              description="Tasks waiting for completion"
            />
            <StatCard
              accent="bg-red-100 text-red-700"
              icon="O"
              label="Overdue Tasks"
              value={summary.overdueTasks || 0}
              description="Tasks past their deadline"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
            <div className="min-w-0 space-y-6">
              <Section
                title="Recent Activities"
                subtitle="Latest collaboration updates across your workspace"
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
                        <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="break-words text-sm font-semibold text-slate-800">
                            {activity.message || "Activity update"}
                          </p>
                          <p className="mt-1 break-words text-xs text-slate-500">
                            {activity.user?.name || "System"} -{" "}
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
                subtitle="Team capacity and completion progress"
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
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                          key={member._id || member.member?._id || index}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-bold text-slate-900">
                                {getMemberName(member)}
                              </p>
                              <p className="mt-1 break-words text-xs text-slate-500">
                                {getMemberEmail(member)}
                              </p>
                            </div>
                            <Badge variant="purple">{percent}% complete</Badge>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-lg font-bold text-slate-950">
                                {totalTasks}
                              </p>
                              <p className="text-xs text-slate-500">Total</p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-lg font-bold text-green-700">
                                {completedTasks}
                              </p>
                              <p className="text-xs text-slate-500">Done</p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-lg font-bold text-amber-700">
                                {pendingTasks}
                              </p>
                              <p className="text-xs text-slate-500">Pending</p>
                            </div>
                          </div>

                          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
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
            </div>

            <div className="min-w-0 space-y-6">
              <Section title="Upcoming Deadlines" subtitle="Tasks coming due soon">
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((task, index) => (
                      <div
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        key={task._id || index}
                      >
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

              <Section title="High Priority Tasks" subtitle="Work that needs attention">
                {highPriorityTasks.length > 0 ? (
                  <div className="space-y-3">
                    {highPriorityTasks.map((task, index) => (
                      <div
                        className="rounded-2xl border border-red-100 bg-red-50/50 p-4"
                        key={task._id || index}
                      >
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

                          <Badge
                            variant={getPriorityBadgeVariant(task.priority)}
                            className="shrink-0 capitalize"
                          >
                            {task.priority || "priority"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No high priority tasks" />
                )}
              </Section>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Section
              title="Task Status Distribution"
              subtitle="Progress across todo, in progress, and completed work"
            >
              {taskStatusDistribution.length > 0 ? (
                <div className="space-y-5">
                  {taskStatusDistribution.map((item, index) => {
                    const status = getLabel(item, "Unknown");
                    const count = getCount(item);

                    return (
                      <div key={status || index}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <Badge variant={getStatusVariant(status)}>
                            {formatStatus(status)}
                          </Badge>
                          <span className="text-sm font-bold text-slate-950">
                            {count}
                          </span>
                        </div>
                        <ProgressRow
                          color={
                            status === "completed"
                              ? "bg-green-600"
                              : status === "in_progress"
                                ? "bg-violet-600"
                                : "bg-blue-600"
                          }
                          label={`${getProgressPercent(count, totalStatusTasks)}%`}
                          total={totalStatusTasks}
                          value={count}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No status data" />
              )}
            </Section>

            <Section
              title="Tasks by Priority"
              subtitle="Priority mix across your task pipeline"
            >
              {tasksByPriority.length > 0 ? (
                <div className="space-y-5">
                  {tasksByPriority.map((item, index) => {
                    const priority = getLabel(item, "Unknown");
                    const count = getCount(item);

                    return (
                      <div key={priority || index}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <Badge
                            variant={getPriorityBadgeVariant(priority)}
                            className="capitalize"
                          >
                            {priority}
                          </Badge>
                          <span className="text-sm font-bold text-slate-950">
                            {count}
                          </span>
                        </div>
                        <ProgressRow
                          color={
                            priority === "high"
                              ? "bg-red-600"
                              : priority === "medium"
                                ? "bg-amber-500"
                                : "bg-blue-600"
                          }
                          label={`${getProgressPercent(count, totalPriorityTasks)}%`}
                          total={totalPriorityTasks}
                          value={count}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No priority data" />
              )}
            </Section>
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
