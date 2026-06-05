export default function Badge({ children, variant = "default", className = "" }) {
  const variantClasses = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-amber-950 dark:text-amber-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    purple: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {children}
    </span>
  );
}
