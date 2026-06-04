"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import useAuth from "@/hooks/useAuth";

function DashboardContent() {
  const { logoutUser } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-600">
            Welcome to your project management dashboard.
          </p>
        </div>

        <button
          className="w-fit rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          onClick={logoutUser}
          type="button"
        >
          Logout
        </button>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
