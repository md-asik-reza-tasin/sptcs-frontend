"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Tasks", href: "/tasks" },
  { label: "Team Members", href: "/users" },
  { label: "Activities", href: "/activities" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[270px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-6 md:block">
      <div className="mb-8 rounded-2xl bg-slate-50 px-4 py-4">
        <p className="text-2xl font-bold tracking-tight text-slate-950">
          MPMS
        </p>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Project Management System
        </p>
      </div>

      <nav className="space-y-2">
        {navigationLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              className={`group flex items-center gap-3 break-words rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
              href={link.href}
              key={link.href}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isActive ? "bg-white" : "bg-slate-300 group-hover:bg-blue-500"
                }`}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-50 via-violet-50 to-white p-4 ring-1 ring-blue-100">
        <p className="text-sm font-bold text-slate-900">Smart Collaboration</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Manage projects faster
        </p>
      </div>
    </aside>
  );
}
