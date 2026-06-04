"use client";

import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden bg-slate-50">
        <div className="flex min-w-0">
          <Sidebar />

          <div className="min-h-screen min-w-0 flex-1">
            <Navbar title={title} subtitle={subtitle} />

            <main className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
