export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:shadow-slate-950/40 sm:p-5 lg:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
