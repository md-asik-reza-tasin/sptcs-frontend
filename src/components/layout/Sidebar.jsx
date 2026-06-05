"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

const navigationLinks = [
  { label: "Dashboard", href: "/dashboard", roles: ["admin", "manager", "member"] },
  { label: "Projects", href: "/projects", roles: ["admin", "manager"] },
  { label: "Tasks", href: "/tasks", roles: ["admin", "manager"] },
  { label: "My Tasks", href: "/tasks", roles: ["member"] },
  { label: "Team Members", href: "/users", roles: ["admin", "manager"] },
  { label: "Activities", href: "/activities", roles: ["admin", "manager", "member"] },
  { label: "Notifications", href: "/notifications", roles: ["admin", "manager", "member"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleLinks = navigationLinks.filter((link) =>
    link.roles.includes(user?.role),
  );

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[270px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-950 md:block">
      <div className="mb-8 rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-900">
        <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          SPTCS
        </p>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Project Management System
        </p>
      </div>

      <nav className="space-y-2">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              className={`group flex items-center gap-3 break-words rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              }`}
              href={link.href}
              key={link.href}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isActive ? "bg-white" : "bg-slate-300 group-hover:bg-blue-500 dark:bg-slate-600 dark:group-hover:bg-blue-400"
                }`}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-50 via-violet-50 to-white p-4 ring-1 ring-blue-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:ring-slate-800">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Smart Collaboration</p>
        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
          Manage projects faster
        </p>
      </div>
    </aside>
  );
}
