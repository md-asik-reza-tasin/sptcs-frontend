import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ProjectsPage() {
  return (
    <DashboardLayout title="Projects" subtitle="Manage all team projects">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Page content here</p>
      </div>
    </DashboardLayout>
  );
}
