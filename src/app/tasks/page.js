"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Input from "@/components/common/Input";
import Loader from "@/components/common/Loader";
import Modal from "@/components/common/Modal";
import Select from "@/components/common/Select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/layout/RoleGuard";
import TaskComments from "@/components/tasks/TaskComments";
import TaskForm from "@/components/tasks/TaskForm";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/api";
import { getErrorMessage, mapTaskErrorToField } from "@/lib/errors";

const limit = 10;

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

const priorityOptions = [
  { label: "All Priority", value: "" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const deadlineOptions = [
  { label: "All Deadlines", value: "" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Overdue", value: "overdue" },
];

const sortOptions = [
  { label: "Latest Created", value: "latest" },
  { label: "Nearest Deadline", value: "nearestDeadline" },
  { label: "Recently Updated", value: "recentlyUpdated" },
];

const statusUpdateOptions = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

function formatDate(date) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
}

function formatLabel(value) {
  if (!value) return "Unknown";
  return value.replace("_", " ");
}

function getStatusVariant(status) {
  if (status === "completed") return "success";
  if (status === "in_progress") return "warning";
  return "info";
}

function getPriorityVariant(priority) {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  return "info";
}

function getProjectName(task) {
  return task.project?.name || "No project";
}

function getMemberName(task) {
  return task.assignedMember?.name || task.assignedTo?.name || "Unassigned";
}

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [deleteErrors, setDeleteErrors] = useState({});
  const [statusErrors, setStatusErrors] = useState({});
  const [commentError, setCommentError] = useState("");
  const [search, setSearch] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedMember, setAssignedMember] = useState("");
  const [deadlineStatus, setDeadlineStatus] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState("");
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    project: "",
    status: "",
    priority: "",
    assignedMember: "",
    deadlineStatus: "",
    sort: "latest",
  });
  const isMember = user?.role === "member";
  const canManageTasks = user?.role === "admin" || user?.role === "manager";

  const projectOptions = [
    { label: "All Projects", value: "" },
    ...projects.map((project) => ({ label: project.name, value: project._id })),
  ];

  const userOptions = [
    { label: "All Members", value: "" },
    ...users.map((user) => ({
      label: `${user.name} (${user.role})`,
      value: user._id,
    })),
  ];

  useEffect(() => {
    async function fetchLookups() {
      if (authLoading || !canManageTasks) return;

      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          api.get("/api/projects", { params: { limit: 100 } }),
          api.get("/api/users", { params: { limit: 100 } }),
        ]);

        setProjects(projectsResponse.data?.data || []);
        setUsers(usersResponse.data?.data || []);
      } catch (error) {
        setPageError(getErrorMessage(error));
      }
    }

    fetchLookups();
  }, [authLoading, canManageTasks]);

  useEffect(() => {
    async function fetchTasks() {
      if (authLoading || !user) return;

      setLoading(true);
      setPageError("");

      try {
        const params = {
          ...appliedFilters,
          page,
          limit,
        };

        if (isMember) {
          delete params.assignedMember;
          delete params.project;
        }

        const response = await api.get("/api/tasks", {
          params,
        });

        setTasks(response.data?.data || []);
        setTotalPages(response.data?.pages || 1);
        setTotal(response.data?.total || 0);
      } catch (error) {
        setPageError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [appliedFilters, authLoading, isMember, page, refreshKey, user]);

  function refetchTasks() {
    setRefreshKey((currentKey) => currentKey + 1);
  }

  function handleSearch() {
    setAppliedFilters({
      search,
      project: isMember ? "" : project,
      status,
      priority,
      assignedMember: isMember ? "" : assignedMember,
      deadlineStatus,
      sort,
    });
    setPage(1);
    setPageError("");
  }

  function handleReset() {
    setSearch("");
    setProject("");
    setStatus("");
    setPriority("");
    setAssignedMember("");
    setDeadlineStatus("");
    setSort("latest");
    setAppliedFilters({
      search: "",
      project: "",
      status: "",
      priority: "",
      assignedMember: "",
      deadlineStatus: "",
      sort: "latest",
    });
    setPage(1);
    setPageError("");
    setCreateErrors({});
    setEditErrors({});
    setDeleteErrors({});
    setStatusErrors({});
    setCommentError("");
  }

  function openCreateModal() {
    setCreateErrors({});
    setPageError("");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setCreateErrors({});
    setIsCreateModalOpen(false);
  }

  function openEditModal(task) {
    setSelectedTask(task);
    setEditErrors({});
    setPageError("");
    setIsEditTaskModalOpen(true);
  }

  function closeEditModal() {
    setSelectedTask(null);
    setEditErrors({});
    setIsEditTaskModalOpen(false);
  }

  function closeCommentsModal() {
    setCommentError("");
    setSelectedTaskForComments(null);
    setIsCommentsModalOpen(false);
  }

  async function handleCreateTask(formData) {
    setCreating(true);
    setCreateErrors({});

    try {
      await api.post("/api/tasks", formData);
      closeCreateModal();
      setPage(1);
      refetchTasks();
    } catch (error) {
      setCreateErrors(mapTaskErrorToField(getErrorMessage(error)));
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateTask(formData) {
    if (!selectedTask) return;

    setUpdatingTask(true);
    setEditErrors({});

    try {
      await api.patch(`/api/tasks/${selectedTask._id}`, formData);
      closeEditModal();
      refetchTasks();
    } catch (error) {
      setEditErrors(mapTaskErrorToField(getErrorMessage(error)));
    } finally {
      setUpdatingTask(false);
    }
  }

  async function handleDeleteTask(task) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setDeletingTaskId(task._id);
    setDeleteErrors((currentErrors) => ({
      ...currentErrors,
      [task._id]: "",
    }));

    try {
      await api.delete(`/api/tasks/${task._id}`);
      refetchTasks();
    } catch (error) {
      setDeleteErrors((currentErrors) => ({
        ...currentErrors,
        [task._id]: getErrorMessage(error),
      }));
    } finally {
      setDeletingTaskId("");
    }
  }

  async function handleStatusChange(task, newStatus) {
    setUpdatingStatusId(task._id);
    setStatusErrors((currentErrors) => ({
      ...currentErrors,
      [task._id]: "",
    }));

    try {
      await api.patch(`/api/tasks/${task._id}/status`, { status: newStatus });
      refetchTasks();
    } catch (error) {
      setStatusErrors((currentErrors) => ({
        ...currentErrors,
        [task._id]: getErrorMessage(error),
      }));
    } finally {
      setUpdatingStatusId("");
    }
  }

  async function openCommentsModal(task) {
    setCommentError("");

    try {
      const response = await api.get(`/api/tasks/${task._id}`);
      setSelectedTaskForComments(response.data?.data || task);
      setIsCommentsModalOpen(true);
    } catch (error) {
      setCommentError(getErrorMessage(error));
      setSelectedTaskForComments(task);
      setIsCommentsModalOpen(true);
    }
  }

  async function handleCommentAdded() {
    if (!selectedTaskForComments) return;

    try {
      setCommentError("");
      const response = await api.get(`/api/tasks/${selectedTaskForComments._id}`);
      setSelectedTaskForComments(response.data?.data || selectedTaskForComments);
      refetchTasks();
    } catch (error) {
      setCommentError(getErrorMessage(error));
    }
  }

  return (
    <DashboardLayout
      title={isMember ? "My Tasks" : "Tasks"}
      subtitle={
        isMember
          ? "Track and update tasks assigned to you"
          : "Track and manage assigned tasks"
      }
    >
      <RoleGuard allowedRoles={["admin", "manager", "member"]}>
      <div className="space-y-6">
        {canManageTasks ? (
          <div className="flex justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={openCreateModal}
            >
              Create Task
            </Button>
          </div>
        ) : null}

        <Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              label="Search"
              name="search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              value={search}
            />
            {canManageTasks ? (
              <Select
                label="Project"
                name="project"
                onChange={(event) => setProject(event.target.value)}
                options={projectOptions}
                value={project}
              />
            ) : null}
            <Select
              label="Status"
              name="status"
              onChange={(event) => setStatus(event.target.value)}
              options={statusOptions}
              value={status}
            />
            <Select
              label="Priority"
              name="priority"
              onChange={(event) => setPriority(event.target.value)}
              options={priorityOptions}
              value={priority}
            />
            {canManageTasks ? (
              <Select
                label="Assigned Member"
                name="assignedMember"
                onChange={(event) => setAssignedMember(event.target.value)}
                options={userOptions}
                value={assignedMember}
              />
            ) : null}
            <Select
              label="Deadline"
              name="deadlineStatus"
              onChange={(event) => setDeadlineStatus(event.target.value)}
              options={deadlineOptions}
              value={deadlineStatus}
            />
            <Select
              label="Sort"
              name="sort"
              onChange={(event) => setSort(event.target.value)}
              options={sortOptions}
              value={sort}
            />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-auto" disabled={loading} onClick={handleSearch}>
              Search
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={loading}
              onClick={handleReset}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </Card>

        {loading && tasks.length === 0 ? <Loader text="Loading tasks..." /> : null}
        {!loading && pageError ? <ErrorMessage message={pageError} /> : null}
        {!loading && !pageError && tasks.length === 0 ? (
          <EmptyState
            title={isMember ? "No assigned tasks" : "No tasks found"}
            description={
              isMember
                ? "Tasks assigned to you will appear here."
                : "Create your first task or adjust your filters."
            }
          />
        ) : null}

        {!loading && !pageError && tasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tasks.map((task) => (
                <Card className="space-y-4" key={task._id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-semibold text-slate-950">{task.title}</h2>
                      <p className="mt-2 break-words text-sm text-slate-600">{task.description}</p>
                    </div>
                    <div className="flex shrink-0 flex-row flex-wrap gap-2 sm:flex-col">
                      <Badge variant={getStatusVariant(task.status)}>{formatLabel(task.status)}</Badge>
                      <Badge variant={getPriorityVariant(task.priority)}>{formatLabel(task.priority)}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p><span className="font-medium text-slate-800">Project:</span> {getProjectName(task)}</p>
                    <p><span className="font-medium text-slate-800">Assigned:</span> {getMemberName(task)}</p>
                    <p><span className="font-medium text-slate-800">Due:</span> {formatDate(task.dueDate)}</p>
                    <p><span className="font-medium text-slate-800">Created:</span> {formatDate(task.createdAt)}</p>
                  </div>

                  <Select
                    disabled={updatingStatusId === task._id}
                    error={statusErrors[task._id]}
                    label="Update Status"
                    name={`status-${task._id}`}
                    onChange={(event) => handleStatusChange(task, event.target.value)}
                    options={statusUpdateOptions}
                    value={task.status}
                  />

                  {task.attachments?.length > 0 ? (
                    <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Attachments
                      </p>
                      <div className="space-y-1">
                        {task.attachments.map((attachment, index) => (
                          <a
                            className="block break-all text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
                            href={attachment}
                            key={`${attachment}-${index}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {attachment}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button className="w-full" onClick={() => openCommentsModal(task)} size="sm" variant="outline">
                      {isMember ? "View Comments" : "Comments"}
                    </Button>
                    {canManageTasks ? (
                      <Button className="w-full" onClick={() => openCommentsModal(task)} size="sm" variant="ghost">Add Comment</Button>
                    ) : null}
                    {canManageTasks ? (
                      <>
                        <Button
                          className="w-full"
                          onClick={() => {
                            openEditModal(task);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          Edit
                        </Button>
                        <Button
                          className="w-full"
                          disabled={deletingTaskId === task._id}
                          onClick={() => handleDeleteTask(task)}
                          size="sm"
                          variant="danger"
                        >
                          {deletingTaskId === task._id ? "Deleting..." : "Delete"}
                        </Button>
                      </>
                    ) : null}
                  </div>
                  <ErrorMessage message={deleteErrors[task._id]} />
                </Card>
              ))}
            </div>

            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Showing {tasks.length} of {total} tasks</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button className="w-full sm:w-auto" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(value - 1, 1))} size="sm" variant="outline">Previous</Button>
                  <p className="text-sm font-medium text-slate-700">Page {page} / {totalPages}</p>
                  <Button className="w-full sm:w-auto" disabled={page >= totalPages || loading} onClick={() => setPage((value) => Math.min(value + 1, totalPages))} size="sm" variant="outline">Next</Button>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Create New Task">
        <TaskForm externalErrors={createErrors} loading={creating} onCancel={closeCreateModal} onSubmit={handleCreateTask} projects={projects} users={users} />
      </Modal>

      <Modal isOpen={isEditTaskModalOpen} onClose={closeEditModal} title="Edit Task">
        <TaskForm externalErrors={editErrors} initialData={selectedTask} loading={updatingTask} onCancel={closeEditModal} onSubmit={handleUpdateTask} projects={projects} users={users} />
      </Modal>

      <Modal isOpen={isCommentsModalOpen} onClose={closeCommentsModal} title={`Comments - ${selectedTaskForComments?.title || ""}`}>
        <ErrorMessage message={commentError} />
        <TaskComments task={selectedTaskForComments} onCommentAdded={handleCommentAdded} />
      </Modal>
      </RoleGuard>
    </DashboardLayout>
  );
}
