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
    <aside className="hidden min-h-screen w-[260px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-6 md:block">
      <div className="mb-8">
        <p className="text-2xl font-bold tracking-wide text-slate-950">
          SPTCS
        </p>
        <p className="mt-1 text-sm text-slate-500">Project Management</p>
      </div>

      <nav className="space-y-2">
        {navigationLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              className={`block break-words rounded-md px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
