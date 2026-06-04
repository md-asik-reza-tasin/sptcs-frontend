"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/common/Badge";
import Card from "@/components/common/Card";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

function formatDate(date) {
  if (!date) return "No date";

  return new Date(date).toLocaleString();
}

function getProjectName(item) {
  return item?.project?.name || item?.projectName || "No project";
}

function getMemberName(item) {
  return item?.assignedTo?.name || item?.member?.name || item?.assignedMember?.name || "Unassigned";
}

function getMemberEmail(item) {
  return item?.email || item?.member?.email || "No email";
}

function getCount(item) {
  return item?.count ?? item?.total ?? 0;
}

function getPriorityBadgeVariant(priority) {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";

  return "default";
}

function StatCard({ label, value, description }) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </Card>
  );
}

function Section({ title, children }) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-slate-950">{title}</h2>
      {children}
    </Card>
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
            "Failed to load dashboard summary.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardSummary();
  }, []);

  const recentActivities = summary?.recentActivities || [];
  const upcomingDeadlines = summary?.upcomingDeadlines || [];
  const highPriorityTasks = summary?.highPriorityTasks || [];
  const tasksByPriority = summary?.tasksByPriority || [];
  const taskStatusDistribution = summary?.taskStatusDistribution || [];
  const memberWorkload = summary?.memberWorkload || [];

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of your projects and tasks"
    >
      {loading ? <Loader text="Loading dashboard..." /> : null}

      {!loading && error ? <ErrorMessage message={error} /> : null}

      {!loading && !error && !summary ? (
        <EmptyState
          title="No dashboard data"
          description="Create projects and tasks to see dashboard insights."
        />
      ) : null}

      {!loading && !error && summary ? (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Total Projects"
              value={summary.totalProjects || 0}
              description="All active and completed projects"
            />
            <StatCard
              label="Total Tasks"
              value={summary.totalTasks || 0}
              description="All tasks across every project"
            />
            <StatCard
              label="Completed Tasks"
              value={summary.completedTasks || 0}
              description="Tasks finished by the team"
            />
            <StatCard
              label="Pending Tasks"
              value={summary.pendingTasks || 0}
              description="Tasks still waiting for completion"
            />
            <StatCard
              label="Overdue Tasks"
              value={summary.overdueTasks || 0}
              description="Tasks past their due date"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Section title="Recent Activities">
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                      key={activity._id || index}
                    >
                      <p className="text-sm font-medium text-slate-800">
                        {activity.message || "Activity update"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {activity.user?.name || "System"} -{" "}
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No activities yet" />
              )}
            </Section>

            <Section title="Upcoming Deadlines">
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDeadlines.map((task, index) => (
                    <div
                      className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                      key={task._id || index}
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {task.title || "Untitled task"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {getProjectName(task)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Assigned to {getMemberName(task)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-700">
                        Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No upcoming deadlines" />
              )}
            </Section>

            <Section title="High Priority Tasks">
              {highPriorityTasks.length > 0 ? (
                <div className="space-y-4">
                  {highPriorityTasks.map((task, index) => (
                    <div
                      className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                      key={task._id || index}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {task.title || "Untitled task"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {getProjectName(task)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Assigned to {getMemberName(task)}
                          </p>
                        </div>

                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
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
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Section title="Tasks by Priority">
              {tasksByPriority.length > 0 ? (
                <div className="space-y-3">
                  {tasksByPriority.map((item, index) => (
                    <div
                      className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3"
                      key={item.priority || item._id || index}
                    >
                      <span className="text-sm font-medium capitalize text-slate-700">
                        {item.priority || item._id || "Unknown"}
                      </span>
                      <span className="text-sm font-bold text-slate-950">
                        {getCount(item)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No priority data" />
              )}
            </Section>

            <Section title="Task Status Distribution">
              {taskStatusDistribution.length > 0 ? (
                <div className="space-y-3">
                  {taskStatusDistribution.map((item, index) => (
                    <div
                      className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3"
                      key={item.status || item._id || index}
                    >
                      <span className="text-sm font-medium capitalize text-slate-700">
                        {item.status || item._id || "Unknown"}
                      </span>
                      <span className="text-sm font-bold text-slate-950">
                        {getCount(item)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No status data" />
              )}
            </Section>
          </section>

          <Section title="Member Workload">
            {memberWorkload.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4 font-semibold">Member</th>
                      <th className="py-3 pr-4 font-semibold">Email</th>
                      <th className="py-3 pr-4 font-semibold">Total Tasks</th>
                      <th className="py-3 pr-4 font-semibold">Completed</th>
                      <th className="py-3 pr-4 font-semibold">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberWorkload.map((member, index) => (
                      <tr
                        className="border-b border-slate-100 last:border-b-0"
                        key={member._id || member.member?._id || index}
                      >
                        <td className="py-3 pr-4 font-medium text-slate-800">
                          {member.name || member.member?.name || "Unknown"}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {getMemberEmail(member)}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {member.totalTasks || 0}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {member.completedTasks || 0}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {member.pendingTasks || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No workload data" />
            )}
          </Section>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
