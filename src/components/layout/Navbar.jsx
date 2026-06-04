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
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 break-words text-sm text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <p className="break-words font-semibold text-slate-800">
              {user?.name || "User"}
            </p>
            <p className="mt-1 inline-flex w-fit rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-blue-700">
              {user?.role || "Member"}
            </p>
          </div>

          <button
            className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 sm:w-auto"
            onClick={logoutUser}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      <nav className="mx-auto mt-4 flex max-w-[1600px] gap-2 overflow-x-auto pb-1 md:hidden">
        {mobileLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
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
