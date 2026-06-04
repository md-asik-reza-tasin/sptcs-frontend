import DashboardLayout from "@/components/layout/DashboardLayout";

export default function TasksPage() {
  return (
    <DashboardLayout title="Tasks" subtitle="Track and manage assigned tasks">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Page content here</p>
      </div>
    </DashboardLayout>
  );
}
