"use client";

import useAuth from "@/hooks/useAuth";

export default function Navbar({ title, subtitle }) {
  const { user, logoutUser } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="text-sm">
            <p className="font-semibold text-slate-800">
              {user?.name || "User"}
            </p>
            <p className="text-slate-500">{user?.role || "Member"}</p>
          </div>

          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={logoutUser}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
