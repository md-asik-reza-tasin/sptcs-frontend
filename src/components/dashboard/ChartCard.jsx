import Card from "@/components/common/Card";

export default function ChartCard({ title, description, children }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="mb-5 min-w-0">
        <h2 className="break-words text-lg font-bold text-slate-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 break-words text-sm text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      <div className="min-h-[280px] min-w-0 overflow-hidden lg:min-h-[320px]">
        {children}
      </div>
    </Card>
  );
}
