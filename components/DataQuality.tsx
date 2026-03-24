"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useWorkbookStore } from "../store/useWorkbookStore";
import { summarizeQuality } from "../lib/selectors";
import Card from "./ui/Card";
import DataTable from "./ui/DataTable";

export default function DataQuality() {
  const { workbook, presentationMode } = useWorkbookStore();
  const sheet = workbook?.sheets["CALIDAD_DATOS"] ?? workbook?.sheets["DATA_QUALITY"] ?? null;
  const summary = summarizeQuality(sheet);

  const columns = useMemo<ColumnDef<Record<string, string>, string>[]>(() => {
    if (!sheet) return [];
    return sheet.columns.map((column) => ({
      header: column,
      accessorKey: column
    }));
  }, [sheet]);

  const exportCsv = () => {
    if (!sheet) return;
    const header = sheet.columns.join(",");
    const rows = sheet.rows.map((row) =>
      sheet.columns
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
    link.download = "DATA_QUALITY.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!sheet) {
    return (
      <Card className="p-6 text-sm text-ink-600">
        No se encontró una hoja `CALIDAD_DATOS`. Sube un workbook compatible o reconstruye el dataset base.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold text-ink-900">{item.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <div className="text-base font-semibold text-ink-900">Narrativa de calidad</div>
          <div className="text-xs text-ink-600">
            La auditoría es descriptiva: no elimina registros y ayuda a detectar vacíos antes de integrar datos oficiales.
          </div>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
          <li>Estandariza alcaldía, sexo, grupo de edad y año antes de consolidar fuentes.</li>
          <li>Documenta qué variables son dato oficial directo, agregado o estimado.</li>
          <li>Valida que población total y personas activas sean numéricas y comparables.</li>
          <li>Usa catálogos controlados para deportes e infraestructura.</li>
          <li>Los duplicados deben revisarse antes de actualizar el ETL real.</li>
        </ul>
      </Card>

      <Card className="p-6 space-y-4">
        <DataTable
          title="Tabla de calidad"
          columns={columns}
          data={sheet.rows}
          onExport={() => exportCsv()}
          hideControls={presentationMode}
        />
      </Card>
    </div>
  );
}
