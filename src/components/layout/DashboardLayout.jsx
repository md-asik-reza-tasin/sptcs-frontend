"use client";

import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          <Sidebar />

          <div className="min-h-screen flex-1">
            <Navbar title={title} subtitle={subtitle} />

            <main className="p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
