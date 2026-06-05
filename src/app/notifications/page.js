"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
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

  return new Date(date).toLocaleString();
}

function formatType(type) {
  if (!type) return "notification";

  return type.replaceAll("_", " ");
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchNotifications({ showLoading = true } = {}) {
    if (showLoading) {
      setLoading(true);
      setError("");
    }
    
    try {
      const response = await api.get("/api/notifications", {
        params: { limit: 100 },
      });

      setNotifications(response.data?.data || []);
      setUnreadCount(response.data?.unreadCount || 0);
      window.dispatchEvent(new Event("notifications:updated"));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      try {
        const response = await api.get("/api/notifications", {
          params: { limit: 100 },
        });

        if (!ignore) {
          setNotifications(response.data?.data || []);
          setUnreadCount(response.data?.unreadCount || 0);
        }
      } catch (error) {
        if (!ignore) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleMarkAsRead(notification) {
    setActionLoading(notification._id);
    setError("");

    try {
      await api.patch(`/api/notifications/${notification._id}/read`);
      await fetchNotifications({ showLoading: false });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setActionLoading("");
    }
  }

  async function handleMarkAllAsRead() {
    setActionLoading("all");
    setError("");

    try {
      await api.patch("/api/notifications/read-all");
      await fetchNotifications({ showLoading: false });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setActionLoading("");
    }
  }

  return (
    <DashboardLayout title="Notifications" subtitle="View your latest updates">
      <RoleGuard allowedRoles={["admin", "manager", "member"]}>
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Unread: {unreadCount}
            </p>
            <Button
              className="w-full sm:w-auto"
              disabled={actionLoading === "all" || unreadCount === 0}
              onClick={handleMarkAllAsRead}
            >
              {actionLoading === "all" ? "Marking..." : "Mark all as read"}
            </Button>
          </div>

          {loading ? <Loader text="Loading notifications..." /> : null}
          {!loading && error ? <ErrorMessage message={error} /> : null}
          {!loading && !error && notifications.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="Task, project, and comment updates will appear here."
            />
          ) : null}

          {!loading && !error && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card className="space-y-3" key={notification._id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-950 dark:text-slate-100">
                        {notification.message}
                      </p>
                      <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                        {notification.sender?.name || "System"}
                        {notification.sender?.role ? ` (${notification.sender.role})` : ""} -{" "}
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{formatType(notification.type)}</Badge>
                      <Badge variant={notification.isRead ? "success" : "warning"}>
                        {notification.isRead ? "Read" : "Unread"}
                      </Badge>
                    </div>
                  </div>

                  {!notification.isRead ? (
                    <Button
                      className="w-full sm:w-auto"
                      disabled={actionLoading === notification._id}
                      onClick={() => handleMarkAsRead(notification)}
                      size="sm"
                      variant="outline"
                    >
                      {actionLoading === notification._id ? "Marking..." : "Mark as read"}
                    </Button>
                  ) : null}
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
