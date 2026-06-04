"use client";

import useAuth from "@/hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-700">
        <p className="text-sm font-medium">Checking authentication...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
