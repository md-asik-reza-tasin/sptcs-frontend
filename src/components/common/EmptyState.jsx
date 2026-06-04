export default function EmptyState({ title, description, children }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center sm:px-6 sm:py-12">
      <h2 className="break-words text-lg font-semibold text-slate-900 sm:text-xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
