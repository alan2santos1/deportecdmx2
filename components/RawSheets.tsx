"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useWorkbookStore } from "../store/useWorkbookStore";
import Card from "./ui/Card";
import DataTable from "./ui/DataTable";

export default function RawSheets() {
  const { workbook, presentationMode } = useWorkbookStore();
  const [activeSheet, setActiveSheet] = useState(workbook?.sheetOrder[0] ?? "");

  useEffect(() => {
    if (workbook && !activeSheet) {
      setActiveSheet(workbook.sheetOrder[0]);
    }
  }, [workbook, activeSheet]);

  const sheet = activeSheet ? workbook?.sheets[activeSheet] : null;

  const columns = useMemo<ColumnDef<Record<string, string>, string>[]>(() => {
    if (!sheet) return [];
    return sheet.columns.map((column) => ({ header: column, accessorKey: column }));
  }, [sheet]);

  const exportCsv = (visibleColumns: string[]) => {
    if (!sheet) return;
    const columns = visibleColumns.length > 0 ? visibleColumns : sheet.columns;
    const header = columns.join(",");
    const rows = sheet.rows.map((row) =>
      columns
        .map((column) => {
          const value = row[column] ?? "";
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeSheet}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!workbook || !sheet) {
    return <Card className="p-6 text-sm text-ink-600">No sheets available.</Card>;
  }

  const nonEmptyColumns = sheet.columns.filter((column) =>
    sheet.rows.some((row) => row[column] && row[column].toString().trim() !== "")
  ).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <aside className="card p-4 space-y-2">
        <div className="text-sm font-semibold text-ink-900">Sheets</div>
        {workbook.sheetOrder.map((name) => (
          <button
            key={name}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              name === activeSheet ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-mist-100"
            }`}
            onClick={() => setActiveSheet(name)}
            type="button"
          >
            {name}
            <span className="ml-2 text-xs text-ink-500">({workbook.sheets[name]?.rows.length ?? 0})</span>
          </button>
        ))}
      </aside>
      <section className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-ink-900">{sheet.name}</div>
            <div className="text-xs text-ink-600">
              {sheet.rows.length} rows · {nonEmptyColumns} non-empty columns
            </div>
          </div>
        </div>
        <DataTable
          title="Raw Sheet"
          columns={columns}
          data={sheet.rows}
          onExport={exportCsv}
          allowColumnSelector
          hideControls={presentationMode}
        />
      </section>
    </div>
  );
}
