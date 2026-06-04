"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

const mobileLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Tasks", href: "/tasks" },
  { label: "Team", href: "/users" },
  { label: "Activities", href: "/activities" },
];

export default function Navbar({ title, subtitle }) {
  const { user, logoutUser } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-slate-950 sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 break-words text-sm text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <div className="min-w-0 text-sm">
            <p className="break-words font-semibold text-slate-800">
              {user?.name || "User"}
            </p>
            <p className="break-words text-slate-500">
              {user?.role || "Member"}
            </p>
          </div>

          <button
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            onClick={logoutUser}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
