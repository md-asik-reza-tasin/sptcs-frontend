export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-slate-600">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
