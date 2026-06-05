export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor={name}>
          {label}
        </label>
      ) : null}

      <input
        className={`w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-950 dark:disabled:bg-slate-900 ${className}`}
        disabled={disabled}
        id={name}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
