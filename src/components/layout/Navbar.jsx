"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/api";

const mobileLinks = [
  { label: "Dashboard", href: "/dashboard", roles: ["admin", "manager", "member"] },
  { label: "Projects", href: "/projects", roles: ["admin", "manager"] },
  { label: "Tasks", href: "/tasks", roles: ["admin", "manager"] },
  { label: "My Tasks", href: "/tasks", roles: ["member"] },
  { label: "Team", href: "/users", roles: ["admin", "manager"] },
  { label: "Activities", href: "/activities", roles: ["admin", "manager", "member"] },
  { label: "Notifications", href: "/notifications", roles: ["admin", "manager", "member"] },
];

export default function Navbar({ title, subtitle }) {
  const { user, logoutUser } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const visibleMobileLinks = mobileLinks.filter((link) =>
    link.roles.includes(user?.role),
  );

  useEffect(() => {
    document.documentElement.classList.remove("dark");

    async function fetchUnreadCount() {
      try {
        const response = await api.get("/api/notifications", {
          params: { isRead: false, limit: 1 },
        });

        setUnreadCount(response.data?.unreadCount || 0);
      } catch {
        setUnreadCount(0);
      }
    }

    if (user) {
      fetchUnreadCount();
    }

    window.addEventListener("notifications:updated", fetchUnreadCount);

    return () => {
      window.removeEventListener("notifications:updated", fetchUnreadCount);
    };
  }, [pathname, user]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="break-words font-semibold text-slate-800 dark:text-slate-100">
              {user?.name || "User"}
            </p>
            <p className="mt-1 inline-flex w-fit rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-blue-700">
              {user?.role || "Member"}
            </p>
          </div>

          <Link
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:w-auto"
            href="/notifications"
          >
            Unread: {unreadCount}
          </Link>

          <button
            className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950 sm:w-auto"
            onClick={logoutUser}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      <nav className="mx-auto mt-4 flex max-w-[1600px] gap-2 overflow-x-auto pb-1 md:hidden">
        {visibleMobileLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
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
