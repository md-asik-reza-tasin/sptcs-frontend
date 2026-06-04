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
import ProjectForm from "@/components/projects/ProjectForm";
import api from "@/lib/api";

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
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
      setError("");

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
        setError(
          error.response?.data?.message ||
            "Something went wrong. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [appliedFilters, page]);

  function handleSearch() {
    setAppliedFilters({ search, status, sort });
    setShowAllProjects(false);
    setPage(1);
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
  }

  function refetchProjects() {
    setAppliedFilters((currentFilters) => ({ ...currentFilters }));
  }

  function openEditModal(project) {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setSelectedProject(null);
    setIsEditModalOpen(false);
  }

  async function handleCreateProject(formData) {
    setCreating(true);
    setError("");

    try {
      await api.post("/api/projects", formData);

      setIsCreateModalOpen(false);
      setPage(1);
      refetchProjects();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateProject(formData) {
    if (!selectedProject) return;

    setUpdating(true);
    setError("");

    try {
      await api.patch(`/api/projects/${selectedProject._id}`, formData);

      closeEditModal();
      refetchProjects();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
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
    setError("");

    try {
      await api.delete(`/api/projects/${project._id}`);
      refetchProjects();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setDeletingId("");
    }
  }

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 6);

  return (
    <DashboardLayout title="Projects" subtitle="Manage all team projects">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsCreateModalOpen(true)}
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

        {!loading && error ? <ErrorMessage message={error} /> : null}

        {!loading && !error && projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Create your first project or adjust your filters."
          />
        ) : null}

        {!loading && !error && projects.length > 0 ? (
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
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <ProjectForm
          loading={creating}
          onCancel={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Project"
      >
        <ProjectForm
          initialData={selectedProject}
          loading={updating}
          onCancel={closeEditModal}
          onSubmit={handleUpdateProject}
        />
      </Modal>
    </DashboardLayout>
  );
}
