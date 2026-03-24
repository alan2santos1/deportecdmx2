"use client";

import { create } from "zustand";
import type { RowRecord, SemanticFields, WorkbookData, WorkbookJson, WorkbookMeta } from "../lib/types";
import { parseWorkbook } from "../lib/xlsx";
import { detectSemanticFields } from "../lib/semantic";
import { normalizeBaseModelada } from "../lib/model";

const BASE_SHEET_CANDIDATES = ["DEPORTE_CDMX_BASE", "BASE_MODELADA"];

const getBaseSheet = (workbook: WorkbookData) => {
  const name = BASE_SHEET_CANDIDATES.find((candidate) => workbook.sheets[candidate]);
  return name ? workbook.sheets[name] : null;
};

type WorkbookState = {
  workbook: WorkbookData | null;
  meta: WorkbookMeta | null;
  modeledBase: RowRecord[];
  modeledColumns: string[];
  semantic: SemanticFields;
  excelCharts: Record<string, { title?: string; source?: string; table?: Array<Record<string, unknown>>; meta?: Record<string, unknown> }>;
  presentationMode: boolean;
  dataSource: "json" | "upload" | "none";
  loading: boolean;
  error: string | null;
  loadWorkbook: (buffer: ArrayBuffer, fileName: string) => Promise<void>;
  loadWorkbookJson: (payload: WorkbookJson) => void;
  setPresentationMode: (value: boolean) => void;
};

const buildWorkbookFromJson = (payload: WorkbookJson): WorkbookData => {
  const sheets: WorkbookData["sheets"] = {};
  payload.meta.sheetNames.forEach((name) => {
    const rows = payload.sheets[name] ?? [];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const rawRows = [columns, ...rows.map((row) => columns.map((column) => row[column] ?? ""))];
    sheets[name] = { name, columns, rows, rawRows };
  });
  return { sheets, sheetOrder: payload.meta.sheetNames };
};

export const useWorkbookStore = create<WorkbookState>((set) => ({
  workbook: null,
  meta: null,
  modeledBase: [],
  modeledColumns: [],
  semantic: {},
  excelCharts: {},
  presentationMode: false,
  dataSource: "none",
  loading: false,
  error: null,
  loadWorkbook: async (buffer, fileName) => {
    set({ loading: true, error: null });
    try {
      const workbook = await parseWorkbook(buffer);
      const baseSheet = getBaseSheet(workbook);
      const modeledColumns = baseSheet?.columns ?? [];
      const semantic = detectSemanticFields(modeledColumns);
      const modeledBase = baseSheet ? normalizeBaseModelada(baseSheet.rows, semantic) : [];
      const meta: WorkbookMeta = {
        fileName,
        loadedAt: new Date().toLocaleString("es-MX"),
        sheets: workbook.sheetOrder.map((name) => ({
          name,
          rows: workbook.sheets[name]?.rows.length ?? 0,
          columns: workbook.sheets[name]?.columns.length ?? 0
        }))
      };
      set({ workbook, modeledBase, modeledColumns, semantic, meta, dataSource: "upload", excelCharts: {} });
    } catch (error) {
      console.error(error);
      set({ error: "No fue posible leer el archivo Excel. Verifica que sea un .xlsx valido con una hoja base compatible." });
    } finally {
      set({ loading: false });
    }
  },
  loadWorkbookJson: (payload) => {
    const workbook = buildWorkbookFromJson(payload);
    const baseSheet = getBaseSheet(workbook);
    const modeledColumns = baseSheet?.columns ?? [];
    const semantic = payload.inferred?.semanticMap ?? detectSemanticFields(modeledColumns);
    const modeledBase = baseSheet ? normalizeBaseModelada(baseSheet.rows, semantic) : [];
    const meta: WorkbookMeta = {
      fileName: "workbook.json",
      loadedAt: new Date(payload.meta.generatedAt).toLocaleString("es-MX"),
      sheets: workbook.sheetOrder.map((name) => ({
        name,
        rows: workbook.sheets[name]?.rows.length ?? 0,
        columns: workbook.sheets[name]?.columns.length ?? 0
      }))
    };
    set({
      workbook,
      modeledBase,
      modeledColumns,
      semantic,
      meta,
      dataSource: "json",
      excelCharts: payload.excelCharts ?? {}
    });
  },
  setPresentationMode: (value) => set({ presentationMode: value })
}));
