import type { RowRecord, SheetData } from "./types";
import { formatNumber, normalizeKey } from "./utils";

export const summarizeQuality = (sheet: SheetData | null) => {
  if (!sheet) return [] as { label: string; value: string }[];

  const totals = {
    checked: 0,
    missing: 0,
    duplicates: 0
  };

  sheet.rows.forEach((row) => {
    sheet.columns.forEach((column) => {
      const key = normalizeKey(column);
      const value = Number(row[column]);
      if (Number.isNaN(value)) return;
      if (key.includes("revis") || key.includes("checked")) totals.checked += value;
      if (key.includes("falt") || key.includes("missing")) totals.missing += value;
      if (key.includes("duplic")) totals.duplicates += value;
    });
  });

  return [
    { label: "Campos revisados", value: formatNumber(totals.checked) },
    { label: "Faltantes", value: formatNumber(totals.missing) },
    { label: "Duplicados", value: formatNumber(totals.duplicates) }
  ];
};

export const buildSheetTextBlocks = (sheet: SheetData | null) => {
  if (!sheet) return [] as { type: "table" | "text"; content: string[][] | string[] }[];
  const sourceRows = sheet.rawRows ?? [sheet.columns, ...sheet.rows.map((row) => sheet.columns.map((col) => row[col] ?? ""))];
  const rows = sourceRows.filter((row) => row.some((cell) => cell !== ""));
  if (rows.length === 0) return [];

  const isSimpleTextSheet = sheet.columns.length === 1 || sheet.columns.every((column) => normalizeKey(column) === "contenido");
  if (isSimpleTextSheet) {
    const lines = rows
      .flatMap((row) => row)
      .map((cell) => String(cell).trim())
      .filter((line) => line !== "" && normalizeKey(line) !== "contenido");
    return [{ type: "text", content: lines }];
  }

  return [{ type: "table", content: rows }];
};

export const buildDuplicates = (rows: RowRecord[], columns: string[]) => {
  const groups = new Map<string, RowRecord[]>();
  rows.forEach((row) => {
    const key = columns.map((column) => row[column]).join("|");
    if (!key.trim()) return;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  });

  return Array.from(groups.entries())
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({ key, count: items.length, rows: items }));
};
