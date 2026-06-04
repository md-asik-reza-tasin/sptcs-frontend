"use client";

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="border-b border-slate-200 bg-white px-6 py-5 md:w-[260px] md:border-b-0 md:border-r">
          <div>
            <p className="text-2xl font-bold tracking-wide text-slate-950">
              MPMS
            </p>
            <p className="mt-1 text-sm text-slate-500">Project Management</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
                {subtitle ? (
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                ) : null}
              </div>

              <p className="text-sm font-semibold text-slate-700">Admin User</p>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
