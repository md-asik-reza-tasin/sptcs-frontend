"use client";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 px-3 py-6 sm:px-4">
      <div className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto rounded-xl bg-white p-4 shadow-lg sm:max-w-xl sm:p-6 lg:max-w-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="break-words text-lg font-semibold text-slate-900 sm:text-xl">
            {title}
          </h2>
          <button
            className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
