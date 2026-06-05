"use client";

import Link from "next/link";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";
import useAuth from "@/hooks/useAuth";

export default function RoleGuard({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader text="Checking permissions..." />;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Card>
        <div className="mx-auto max-w-xl py-10 text-center">
          <h2 className="text-2xl font-bold text-slate-950">Access Denied</h2>
          <p className="mt-3 text-sm text-slate-600">
            You do not have permission to view this page.
          </p>
          <Link
            className="mt-6 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
            href="/dashboard"
          >
            Go to Dashboard
          </Link>
        </div>
      </Card>
    );
  }

  return children;
}
