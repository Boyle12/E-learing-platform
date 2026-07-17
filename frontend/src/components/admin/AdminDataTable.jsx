import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

const getValue = (record, accessor) => {
  if (typeof accessor === "function") return accessor(record);
  if (!accessor) return undefined;

  return accessor.split(".").reduce((value, key) => value?.[key], record);
};

export const AdminConfirmationModal = ({ confirmation, onCancel, onConfirm, isConfirming }) => {
  const cancelButtonRef = useRef(null);
  const isDangerous = confirmation?.variant === "danger";

  useEffect(() => {
    if (!confirmation) return undefined;

    cancelButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isConfirming) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmation, isConfirming, onCancel]);

  if (!confirmation) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close confirmation dialog"
        className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
        onClick={isConfirming ? undefined : onCancel}
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirmation-title"
        aria-describedby="admin-confirmation-description"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
              isDangerous ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
            }`}
          >
            <AlertTriangle size={22} aria-hidden="true" />
          </div>
          <button
            type="button"
            aria-label="Close confirmation dialog"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        <h2 id="admin-confirmation-title" className="mt-4 text-lg font-bold text-slate-900">
          {confirmation.title || "Confirm action"}
        </h2>
        <p id="admin-confirmation-description" className="mt-2 text-sm leading-6 text-slate-600">
          {confirmation.description || "This action cannot be undone."}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              isDangerous
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isConfirming ? "Processing..." : confirmation.confirmLabel || "Confirm"}
          </button>
        </div>
      </section>
    </div>
  );
};

const TableSkeleton = ({ columns, rows = 6 }) => (
  <tbody className="animate-pulse">
    {Array.from({ length: rows }, (_, rowIndex) => (
      <tr key={rowIndex} className="border-b border-slate-100 last:border-0">
        {columns.map((column, columnIndex) => (
          <td key={`${column.id || column.accessor || columnIndex}-${rowIndex}`} className="px-5 py-4">
            <div className="h-4 rounded bg-slate-200" style={{ width: `${55 + ((rowIndex + columnIndex) % 4) * 10}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

/**
 * Column API: { header, accessor, id, className, cell(value, row, { confirm }) }
 * Use `confirm({ title, description, confirmLabel, variant, onConfirm })` in a
 * custom cell renderer before executing a destructive action.
 */
const AdminDataTable = ({
  data = [],
  columns = [],
  pageCount = 1,
  onPageChange,
  onSearch,
  filters = [],
  loading = false,
  emptyMessage = "No records found.",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmation, setConfirmation] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const requestConfirmation = (options) => setConfirmation(options);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pageCount || nextPage === currentPage) return;
    setCurrentPage(nextPage);
    onPageChange?.(nextPage);
  };

  const handleConfirm = async () => {
    if (!confirmation?.onConfirm) {
      setConfirmation(null);
      return;
    }

    setIsConfirming(true);
    try {
      await confirmation.onConfirm();
      setConfirmation(null);
    } finally {
      setIsConfirming(false);
    }
  };

  const pageNumbers = Array.from(
    { length: Math.min(pageCount, 5) },
    (_, index) => Math.max(1, Math.min(currentPage - 2, pageCount - 4)) + index
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search records..."
            aria-label="Search records"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {filters.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {filters.map((filter, index) => (
              <label key={filter.id || filter.key || index} className="sr-only">
                {filter.label || "Filter"}
                <select
                  value={filter.value ?? ""}
                  onChange={(event) => filter.onChange?.(event.target.value)}
                  className="not-sr-only h-10 min-w-36 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">{filter.label || "All"}</option>
                  {(filter.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.id || column.accessor || index}
                  scope="col"
                  className={`whitespace-nowrap px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${
                    column.headerClassName || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          {loading ? (
            <TableSkeleton columns={columns} />
          ) : (
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((row, rowIndex) => (
                <tr key={row.id || row._id || rowIndex} className="transition-colors hover:bg-slate-50/80">
                  {columns.map((column, columnIndex) => {
                    const value = getValue(row, column.accessor);
                    return (
                      <td
                        key={column.id || column.accessor || columnIndex}
                        className={`whitespace-nowrap px-5 py-4 text-sm text-slate-700 ${
                          column.className || ""
                        }`}
                      >
                        {column.cell
                          ? column.cell(value, row, { confirm: requestConfirmation })
                          : value ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!data.length && (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="px-5 py-14 text-center text-sm text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-700">{currentPage}</span> of {pageCount}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                onClick={() => handlePageChange(page)}
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <AdminConfirmationModal
        confirmation={confirmation}
        isConfirming={isConfirming}
        onCancel={() => !isConfirming && setConfirmation(null)}
        onConfirm={handleConfirm}
      />
    </section>
  );
};

export default AdminDataTable;
