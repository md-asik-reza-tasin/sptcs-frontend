export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 lg:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
