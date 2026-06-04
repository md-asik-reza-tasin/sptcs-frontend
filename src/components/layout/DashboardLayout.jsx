"use client";

import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-900">
        <div className="min-w-0 md:flex">
          <Sidebar />

          <div className="min-h-screen min-w-0 flex-1 md:pl-[270px]">
            <Navbar title={title} subtitle={subtitle} />

            <main className="mx-auto w-full max-w-[1600px] min-w-0 p-4 sm:p-6 lg:p-8">
              <div className="min-w-0">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
