import * as XLSX from "xlsx";
import type { SheetData, WorkbookData } from "./types";
import { isEmptyValue } from "./utils";

const pickHeaderRow = (rows: unknown[][]) => {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row) continue;
    const hasValue = row.some((cell) => !isEmptyValue(cell));
    if (hasValue) return i;
  }
  return 0;
};

const normalizeRows = (rows: unknown[][]) =>
  rows.map((row) =>
    (row || []).map((cell) => {
      if (cell === null || cell === undefined) return "";
      if (typeof cell === "string") return cell.trim();
      return String(cell);
    })
  );

const ensureUniqueHeaders = (headers: string[]) => {
  const seen = new Map<string, number>();
  return headers.map((header, index) => {
    const base = header.trim() || `Column_${index + 1}`;
    const key = base.replace(/\\s+/g, " ");
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? key : `${key}_${count + 1}`;
  });
};

const fillMergedCells = (sheet: XLSX.WorkSheet, rows: unknown[][]) => {
  const merges = sheet["!merges"] || [];
  merges.forEach((merge) => {
    const startRow = merge.s.r;
    const endRow = merge.e.r;
    const startCol = merge.s.c;
    const endCol = merge.e.c;
    const value = rows[startRow]?.[startCol];
    for (let r = startRow; r <= endRow; r += 1) {
      for (let c = startCol; c <= endCol; c += 1) {
        if (!rows[r]) rows[r] = [];
        if (rows[r][c] === undefined || rows[r][c] === "") rows[r][c] = value ?? "";
      }
    }
  });
};

const buildSheetData = (name: string, sheet: XLSX.WorkSheet): SheetData => {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: "" }) as unknown[][];
  fillMergedCells(sheet, raw);
  const normalized = normalizeRows(raw);
  const headerIndex = pickHeaderRow(normalized);
  const rawHeaders = (normalized[headerIndex] || []).map((cell) => cell.toString().trim());
  const headers = ensureUniqueHeaders(rawHeaders).filter((cell) => cell !== "");

  const dataRows = normalized.slice(headerIndex + 1).filter((row) => row.some((cell) => cell !== ""));
  const rows = dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });

  return {
    name,
    columns: headers,
    rows,
    rawRows: normalized
  };
};

export const parseWorkbook = async (arrayBuffer: ArrayBuffer): Promise<WorkbookData> => {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheets: Record<string, SheetData> = {};
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    sheets[name] = buildSheetData(name, sheet);
  });

  return {
    sheets,
    sheetOrder: workbook.SheetNames
  };
};
