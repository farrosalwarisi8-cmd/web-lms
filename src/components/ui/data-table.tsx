import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  keyFor,
  empty,
  mobileAction,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  keyFor: (row: T) => string;
  empty?: ReactNode;
  mobileAction?: (row: T) => ReactNode;
  caption?: string;
}) {
  if (rows.length === 0) {
    return <>{empty ?? null}</>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="table-base">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={column.className}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={keyFor(row)} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className={cn("whitespace-nowrap", column.className)}>
                    {column.render(row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => (
          <div key={keyFor(row)} className="space-y-2 px-4 py-3.5">
            {columns
              .filter((column) => !column.mobileHidden)
              .map((column, index) => (
                <div
                  key={column.key}
                  className={cn(
                    "flex items-start justify-between gap-3 text-sm",
                    index === 0 && "block"
                  )}
                >
                  {index !== 0 && (
                    <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {column.header}
                    </span>
                  )}
                  <span className={cn("min-w-0 text-right", index === 0 && "text-left")}>
                    {column.render(row, index)}
                  </span>
                </div>
              ))}
            {mobileAction && <div className="pt-1">{mobileAction(row)}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3" aria-label="Paginasi">
      <p className="text-xs text-slate-500">
        Halaman <span className="font-semibold text-slate-700">{page}</span> dari {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        {Array.from({ length: totalPages }).map((_, index) => {
          const number = index + 1;
          return (
            <button
              key={number}
              type="button"
              onClick={() => onChange(number)}
              aria-current={page === number ? "page" : undefined}
              className={cn(
                "hidden min-h-9 min-w-9 items-center justify-center rounded-lg border text-xs font-semibold sm:inline-flex",
                page === number
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              )}
            >
              {number}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
