import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ActivitiesPage() {
  return (
    <DashboardLayout
      title="Activities"
      subtitle="View recent system activities"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Page content here</p>
      </div>
    </DashboardLayout>
  );
}
