"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DataTableColumn {
  header: string;
  className?: string;
}

export interface DataTableRow {
  key: string;
  cells: ReactNode[];
}

interface DataTableProps {
  caption: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  pageSize?: number;
  empty?: ReactNode;
}

export function DataTable({
  caption,
  columns,
  rows,
  pageSize = 6,
  empty = null,
}: DataTableProps) {
  const [page, setPage] = useState(1);

  if (rows.length === 0) {
    return <>{empty}</>;
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = rows.slice(start, start + pageSize);

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border-subtle">
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={`px-4 py-2.5 text-xs font-medium uppercase tracking-[0.06em] text-text-tertiary ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-border-subtle last:border-b-0 hover:bg-white/[0.02]"
              >
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.key}-${columns[index]?.header ?? index}`}
                    className={`px-4 py-3 align-middle text-md text-text-secondary ${columns[index]?.className ?? ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border-subtle md:hidden">
        {visibleRows.map((row) => (
          <li key={row.key} className="px-4 py-4">
            <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2">
              {row.cells.map((cell, index) => (
                <div key={`${row.key}-mobile-${index}`} className="contents">
                  <dt className="text-xs font-medium uppercase tracking-[0.06em] text-text-tertiary">
                    {columns[index]?.header}
                  </dt>
                  <dd className="text-right text-md text-text-secondary">
                    {cell}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
          <p className="text-sm text-text-tertiary">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="flex h-7 w-7 items-center justify-center rounded-sm border border-border-interactive text-text-secondary transition-colors hover:bg-surface-interactive hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="flex h-7 w-7 items-center justify-center rounded-sm border border-border-interactive text-text-secondary transition-colors hover:bg-surface-interactive hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
