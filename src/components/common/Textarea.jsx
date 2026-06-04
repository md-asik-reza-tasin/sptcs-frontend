export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = "",
}) {
  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-sm font-medium text-slate-700" htmlFor={name}>
          {label}
        </label>
      ) : null}

      <textarea
        className={`w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
        disabled={disabled}
        id={name}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
