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

const roleOptions = [
  { label: "All Roles", value: "" },
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Member", value: "member" },
];

function getRoleVariant(role) {
  if (role === "admin") return "danger";
  if (role === "manager") return "warning";
  return "success";
}

function formatDate(date) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState({ search: "", role: "" });

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/users", {
          params: { ...appliedFilters, page, limit },
        });

        setUsers(response.data?.data || []);
        setTotalPages(response.data?.pages || 1);
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

    fetchUsers();
  }, [appliedFilters, page]);

  function handleSearch() {
    setAppliedFilters({ search, role });
    setPage(1);
  }

  function handleReset() {
    setSearch("");
    setRole("");
    setAppliedFilters({ search: "", role: "" });
    setPage(1);
  }

  return (
    <DashboardLayout
      title="Team Members"
      subtitle="Manage users and project members"
    >
      <div className="space-y-6">
        <Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Search"
              name="search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members by name or email"
              value={search}
            />
            <Select
              label="Role"
              name="role"
              onChange={(event) => setRole(event.target.value)}
              options={roleOptions}
              value={role}
            />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-auto" disabled={loading} onClick={handleSearch}>Search</Button>
            <Button className="w-full sm:w-auto" disabled={loading} onClick={handleReset} variant="outline">Reset</Button>
          </div>
        </Card>

        {loading && users.length === 0 ? (
          <Loader text="Loading team members..." />
        ) : null}
        {!loading && error ? <ErrorMessage message={error} /> : null}
        {!loading && !error && users.length === 0 ? (
          <EmptyState
            title="No team members found"
            description="Try adjusting your search or role filter."
          />
        ) : null}

        {!loading && !error && users.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {users.map((user) => (
                <Card className="space-y-3" key={user._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-semibold text-slate-950">{user.name}</h2>
                      <p className="break-words text-sm text-slate-600">{user.email}</p>
                    </div>
                    <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">Joined:</span>{" "}
                    {formatDate(user.createdAt)}
                  </p>
                </Card>
              ))}
            </div>

            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">Showing {users.length} of {total} members</p>
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
    </DashboardLayout>
  );
}
