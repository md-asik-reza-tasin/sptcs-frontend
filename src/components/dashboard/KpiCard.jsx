import Card from "@/components/common/Card";

export default function KpiCard({ accent, description, label, value }) {
  return (
    <Card className="min-h-[140px] overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${accent}`} />
      </div>
      <p className="mt-4 break-words text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Card>
  );
}
