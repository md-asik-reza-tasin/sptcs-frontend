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
import ProjectForm from "@/components/projects/ProjectForm";
import api from "@/lib/api";
import {
  getErrorMessage,
  mapProjectErrorToField,
  mapProjectMemberErrorToField,
} from "@/lib/errors";

const limit = 10;

const statusOptions = [
  { label: "All Status", value: "" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
];

const sortOptions = [
  { label: "Latest Created", value: "latest" },
  { label: "Nearest Deadline", value: "nearestDeadline" },
  { label: "Recently Updated", value: "recentlyUpdated" },
];

function getStatusVariant(status) {
  if (status === "active") return "info";
  if (status === "completed") return "success";
  if (status === "on_hold") return "warning";

  return "default";
}

function formatDate(date) {
  if (!date) return "No date";

  return new Date(date).toLocaleDateString();
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status.replace("_", " ");
}

function getMemberId(member) {
  return member.user?._id || member.user;
}

function ProjectsContent() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState("");
  const [memberErrors, setMemberErrors] = useState({});
  const [memberForm, setMemberForm] = useState({
    userId: "",
    role: "",
  });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "",
    sort: "latest",
  });

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setPageError("");

      const query = {
        ...appliedFilters,
        page,
        limit,
      };

      try {
        const response = await api.get("/api/projects", {
          params: query,
        });

        setProjects(response.data?.data || []);
        setTotal(response.data?.total || 0);
      } catch (error) {
        setPageError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [appliedFilters, page]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get("/api/users", {
          params: { limit: 100 },
        });

        setUsers(response.data?.data || []);
      } catch (error) {
        setPageError(getErrorMessage(error));
      }
    }

    fetchUsers();
  }, []);

  function handleSearch() {
    setAppliedFilters({ search, status, sort });
    setShowAllProjects(false);
    setPage(1);
    setPageError("");
  }

  function handleReset() {
    const resetFilters = {
      search: "",
      status: "",
      sort: "latest",
    };

    setSearch(resetFilters.search);
    setStatus(resetFilters.status);
    setSort(resetFilters.sort);
    setAppliedFilters(resetFilters);
    setShowAllProjects(false);
    setPage(1);
    setPageError("");
    setCreateErrors({});
    setEditErrors({});
    setDeleteError("");
  }

  function refetchProjects() {
    setAppliedFilters((currentFilters) => ({ ...currentFilters }));
  }

  function openEditModal(project) {
    setSelectedProject(project);
    setEditErrors({});
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setSelectedProject(null);
    setEditErrors({});
    setIsEditModalOpen(false);
  }

  function openCreateModal() {
    setCreateErrors({});
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setCreateErrors({});
    setIsCreateModalOpen(false);
  }

  function handleMemberInputChange(event) {
    const { name, value } = event.target;

    setMemberForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setMemberErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
      form: "",
    }));
  }

  async function fetchProjectCollaboration(projectId) {
    setMembersLoading(true);
    setMemberErrors({});

    try {
      const [membersResponse, workloadResponse] = await Promise.all([
        api.get(`/api/projects/${projectId}/members`),
        api.get(`/api/projects/${projectId}/workload`),
      ]);

      setProjectMembers(membersResponse.data?.data || []);
      setWorkload(workloadResponse.data?.data || []);
    } catch (error) {
      setMemberErrors({ form: getErrorMessage(error) });
    } finally {
      setMembersLoading(false);
    }
  }

  async function openMembersModal(project) {
    setSelectedProject(project);
    setProjectMembers(project.members || []);
    setWorkload([]);
    setMemberForm({ userId: "", role: "" });
    setMemberErrors({});
    setIsMembersModalOpen(true);
    await fetchProjectCollaboration(project._id);
  }

  function closeMembersModal() {
    setSelectedProject(null);
    setProjectMembers([]);
    setWorkload([]);
    setMemberForm({ userId: "", role: "" });
    setMemberErrors({});
    setIsMembersModalOpen(false);
  }

  async function handleAddMember(event) {
    event.preventDefault();

    if (!selectedProject) return;

    if (!memberForm.userId) {
      setMemberErrors({ userId: "User is required" });
      return;
    }

    setAddingMember(true);
    setMemberErrors({});

    try {
      const response = await api.post(`/api/projects/${selectedProject._id}/members`, {
        userId: memberForm.userId,
        role: memberForm.role,
      });

      setSelectedProject(response.data?.data || selectedProject);
      setMemberForm({ userId: "", role: "" });
      await fetchProjectCollaboration(selectedProject._id);
      refetchProjects();
    } catch (error) {
      setMemberErrors(mapProjectMemberErrorToField(getErrorMessage(error)));
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(member) {
    if (!selectedProject) return;

    const memberId = getMemberId(member);

    setRemovingMemberId(memberId);
    setMemberErrors({});

    try {
      await api.delete(`/api/projects/${selectedProject._id}/members/${memberId}`);
      await fetchProjectCollaboration(selectedProject._id);
      refetchProjects();
    } catch (error) {
      setMemberErrors({ form: getErrorMessage(error) });
    } finally {
      setRemovingMemberId("");
    }
  }

  async function handleCreateProject(formData) {
    setCreating(true);
    setCreateErrors({});

    try {
      await api.post("/api/projects", formData);

      closeCreateModal();
      setPage(1);
      refetchProjects();
    } catch (error) {
      setCreateErrors(mapProjectErrorToField(getErrorMessage(error)));
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateProject(formData) {
    if (!selectedProject) return;

    setUpdating(true);
    setEditErrors({});

    try {
      await api.patch(`/api/projects/${selectedProject._id}`, formData);

      closeEditModal();
      refetchProjects();
    } catch (error) {
      setEditErrors(mapProjectErrorToField(getErrorMessage(error)));
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteProject(project) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) return;

    setDeletingId(project._id);
    setDeleteError("");

    try {
      await api.delete(`/api/projects/${project._id}`);
      refetchProjects();
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setDeletingId("");
    }
  }

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 6);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            className="w-full sm:w-auto"
            onClick={openCreateModal}
          >
            Create Project
          </Button>
        </div>

        <Card>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Input
                label="Search"
                name="search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects by name or description"
                value={search}
              />
            </div>

            <Select
              label="Status"
              name="status"
              onChange={(event) => setStatus(event.target.value)}
              options={statusOptions}
              value={status}
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

        {loading && projects.length === 0 ? (
          <Loader text="Loading projects..." />
        ) : null}

        {!loading && pageError ? <ErrorMessage message={pageError} /> : null}
        {!loading && deleteError ? <ErrorMessage message={deleteError} /> : null}

        {!loading && !pageError && projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Create your first project or adjust your filters."
          />
        ) : null}

        {!loading && !pageError && projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((project) => (
                <Card className="flex flex-col gap-4" key={project._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="break-words text-lg font-semibold text-slate-950">
                        {project.name}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    <Badge variant={getStatusVariant(project.status)}>
                      {formatStatus(project.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium text-slate-800">
                        Deadline:
                      </span>{" "}
                      {formatDate(project.deadline)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">
                        Members:
                      </span>{" "}
                      {project.members?.length || 0}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">
                        Created by:
                      </span>{" "}
                      {project.createdBy?.name || "Unknown"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">
                        Created:
                      </span>{" "}
                      {formatDate(project.createdAt)}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => openMembersModal(project)}
                      size="sm"
                      variant="secondary"
                    >
                      Manage Members
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => openEditModal(project)}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      disabled={deletingId === project._id}
                      onClick={() => handleDeleteProject(project)}
                      size="sm"
                      variant="danger"
                    >
                      {deletingId === project._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-600">
                Showing {visibleProjects.length} of {total || projects.length} projects
              </p>

              {projects.length > 6 ? (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setShowAllProjects((currentValue) => !currentValue)}
                  variant="outline"
                >
                  {showAllProjects ? "Show Less" : "View All Projects"}
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Create New Project"
      >
        <ProjectForm
          externalErrors={createErrors}
          loading={creating}
          onCancel={closeCreateModal}
          onSubmit={handleCreateProject}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Project"
      >
        <ProjectForm
          externalErrors={editErrors}
          initialData={selectedProject}
          loading={updating}
          onCancel={closeEditModal}
          onSubmit={handleUpdateProject}
        />
      </Modal>

      <Modal
        isOpen={isMembersModalOpen}
        onClose={closeMembersModal}
        title={`Manage Members - ${selectedProject?.name || ""}`}
      >
        <div className="space-y-6">
          <ErrorMessage message={memberErrors.form} />

          <form className="space-y-4" onSubmit={handleAddMember}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                error={memberErrors.userId}
                label="User"
                name="userId"
                onChange={handleMemberInputChange}
                options={[
                  { label: "Select user", value: "" },
                  ...users.map((user) => ({
                    label: `${user.name} (${user.email}) - ${user.role}`,
                    value: user._id,
                  })),
                ]}
                value={memberForm.userId}
              />
              <Input
                label="Project Role"
                name="role"
                onChange={handleMemberInputChange}
                placeholder="frontend developer"
                value={memberForm.role}
              />
            </div>
            <Button className="w-full sm:w-auto" disabled={addingMember} type="submit">
              {addingMember ? "Adding..." : "Add Member"}
            </Button>
          </form>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Project Members</h3>
            {membersLoading ? <Loader text="Loading members..." /> : null}
            {!membersLoading && projectMembers.length === 0 ? (
              <EmptyState title="No members in this project" />
            ) : null}
            {!membersLoading && projectMembers.length > 0 ? (
              <div className="space-y-3">
                {projectMembers.map((member) => {
                  const memberId = getMemberId(member);

                  return (
                    <div
                      className="flex flex-col gap-3 rounded-md border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      key={member._id || memberId}
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-slate-900">
                          {member.user?.name || "Unknown"}
                        </p>
                        <p className="break-words text-xs text-slate-500">
                          {member.user?.email || "No email"} - {member.user?.role || "member"}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-600">
                          Project role: {member.role || "member"}
                        </p>
                      </div>
                      <Button
                        className="w-full sm:w-auto"
                        disabled={removingMemberId === memberId}
                        onClick={() => handleRemoveMember(member)}
                        size="sm"
                        type="button"
                        variant="danger"
                      >
                        {removingMemberId === memberId ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Workload Summary</h3>
            {!membersLoading && workload.length === 0 ? (
              <EmptyState title="No workload data yet" />
            ) : null}
            {!membersLoading && workload.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {workload.map((item) => (
                  <div
                    className="rounded-md border border-slate-200 p-4"
                    key={item.member?._id}
                  >
                    <p className="break-words text-sm font-semibold text-slate-900">
                      {item.member?.name || "Unknown"}
                    </p>
                    <p className="break-words text-xs text-slate-500">
                      {item.member?.email || "No email"}
                    </p>
                    <p className="mt-1 break-words text-xs text-slate-600">
                      Project role: {item.projectRole || "member"}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-md bg-slate-50 px-2 py-2">
                        <p className="font-bold text-slate-950">{item.totalTasks}</p>
                        <p className="text-slate-500">Total</p>
                      </div>
                      <div className="rounded-md bg-green-50 px-2 py-2">
                        <p className="font-bold text-green-700">{item.completedTasks}</p>
                        <p className="text-slate-500">Done</p>
                      </div>
                      <div className="rounded-md bg-amber-50 px-2 py-2">
                        <p className="font-bold text-amber-700">{item.pendingTasks}</p>
                        <p className="text-slate-500">Pending</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </Modal>
    </>
  );
}

export default function ProjectsPage() {
  return (
    <DashboardLayout title="Projects" subtitle="Manage all team projects">
      <RoleGuard allowedRoles={["admin", "manager"]}>
        <ProjectsContent />
      </RoleGuard>
    </DashboardLayout>
  );
}
