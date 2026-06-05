"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/common/Badge";
import Card from "@/components/common/Card";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loader from "@/components/common/Loader";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/layout/RoleGuard";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

function formatDate(date) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
}

function getEntityVariant(entityType) {
  if (entityType === "project") return "info";
  if (entityType === "task") return "warning";
  if (entityType === "member") return "success";
  return "default";
}

function ActivitiesContent() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/activities");
        setActivities(response.data?.data || []);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  return (
    <>
      <div className="space-y-6">
        {loading ? <Loader text="Loading activities..." /> : null}
        {!loading && error ? <ErrorMessage message={error} /> : null}
        {!loading && !error && activities.length === 0 ? (
          <EmptyState
            title="No activities yet"
            description="Recent system activities will appear here."
          />
        ) : null}

        {!loading && !error && activities.length > 0 ? (
          <Card>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                  key={activity._id || index}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-slate-900">
                        {activity.message || "Activity update"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {activity.user?.name || "System"}{" "}
                        {activity.user?.role ? `(${activity.user.role})` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{activity.action || "action"}</Badge>
                      <Badge variant={getEntityVariant(activity.entityType)}>
                        {activity.entityType || "activity"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </>
  );
}

export default function ActivitiesPage() {
  return (
    <DashboardLayout
      title="Activities"
      subtitle="View recent system activities"
    >
      <RoleGuard allowedRoles={["admin", "manager", "member"]}>
        <ActivitiesContent />
      </RoleGuard>
    </DashboardLayout>
  );
}
