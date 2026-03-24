"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

export default function DataTable<TData extends object>({
  columns,
  data,
  pageSize = 15,
  searchable = true,
  title,
  onExport,
  allowColumnSelector = false,
  hideControls = false
}: {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  pageSize?: number;
  searchable?: boolean;
  title?: string;
  onExport?: (visibleColumns: string[]) => void;
  allowColumnSelector?: boolean;
  hideControls?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumns, setShowColumns] = useState(false);
  const [columnQuery, setColumnQuery] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: "includesString",
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } }
  });

  const columnsList = useMemo(() => table.getAllLeafColumns(), [table]);
  const visibleColumnIds = useMemo(
    () => columnsList.filter((column) => column.getIsVisible()).map((column) => column.id),
    [columnsList]
  );
  const filteredColumns = useMemo(() => {
    if (!columnQuery) return columnsList;
    return columnsList.filter((column) => column.id.toLowerCase().includes(columnQuery.toLowerCase()));
  }, [columnsList, columnQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {title ? <div className="text-base font-semibold text-ink-900">{title}</div> : null}
          <div className="text-xs text-ink-600">{table.getFilteredRowModel().rows.length} rows</div>
        </div>
        {!hideControls ? (
          <div className="flex flex-wrap gap-2">
            {searchable ? (
              <input
                className="input w-64"
                placeholder="Search rows"
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
              />
            ) : null}
            {allowColumnSelector ? (
              <div className="relative">
                <button className="btn-ghost" type="button" onClick={() => setShowColumns((prev) => !prev)}>
                  Select columns
                </button>
                {showColumns ? (
                  <div className="absolute right-0 top-12 z-20 w-64 rounded-xl border border-mist-200 bg-white p-3 shadow-soft">
                    <input
                      className="input mb-2"
                      placeholder="Search columns"
                      value={columnQuery}
                      onChange={(event) => setColumnQuery(event.target.value)}
                    />
                    <div className="max-h-48 space-y-2 overflow-auto">
                      {filteredColumns.map((column) => (
                        <label key={column.id} className="flex items-center gap-2 text-sm text-ink-700">
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                          />
                          {column.id}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {onExport ? (
              <button className="btn-ghost" type="button" onClick={() => onExport(visibleColumnIds)}>
                Export CSV
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {!hideControls && !allowColumnSelector ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <span className="font-semibold uppercase tracking-wide">Columnas</span>
          {columnsList.map((column) => (
            <label key={column.id} className="flex items-center gap-1 rounded-full border border-mist-200 bg-white px-2 py-1">
              <input
                type="checkbox"
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
              />
              {column.id}
            </label>
          ))}
        </div>
      ) : null}
      <div className="overflow-auto rounded-xl border border-mist-200">
        <table className="min-w-full text-sm">
          <thead className="bg-mist-100 text-xs uppercase tracking-wide text-ink-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left font-semibold"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() ? (header.column.getIsSorted() === "asc" ? " ▲" : " ▼") : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-mist-200">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-ink-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-ink-600">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        {!hideControls ? (
          <div className="flex gap-2">
            <button
              className="btn-ghost"
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
