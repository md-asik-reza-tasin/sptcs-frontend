"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Input from "@/components/common/Input";
import Loader from "@/components/common/Loader";
import Select from "@/components/common/Select";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
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
        setTotalPages(response.data?.pages || 1);
        setTotal(response.data?.total || 0);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load projects.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [appliedFilters, page]);

  function handleSearch() {
    setAppliedFilters({ search, status, sort });
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
    setPage(1);
  }

  function goToPreviousPage() {
    setPage((currentPage) => Math.max(currentPage - 1, 1));
  }

  function goToNextPage() {
    setPage((currentPage) => Math.min(currentPage + 1, totalPages));
  }

  return (
    <DashboardLayout title="Projects" subtitle="Manage all team projects">
      <div className="space-y-6">
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
            <Button disabled={loading} onClick={handleSearch}>
              Search
            </Button>
            <Button
              disabled={loading}
              onClick={handleReset}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </Card>

        {loading ? <Loader text="Loading projects..." /> : null}

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
              {projects.map((project) => (
                <Card className="flex flex-col gap-4" key={project._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
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
                </Card>
              ))}
            </div>

            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Showing {projects.length} of {total} projects
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    disabled={page <= 1 || loading}
                    onClick={goToPreviousPage}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <p className="text-sm font-medium text-slate-700">
                    Page {page} / {totalPages}
                  </p>
                  <Button
                    disabled={page >= totalPages || loading}
                    onClick={goToNextPage}
                    size="sm"
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
