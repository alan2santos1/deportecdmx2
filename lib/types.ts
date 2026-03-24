export type RowRecord = Record<string, string>;

export type SheetData = {
  name: string;
  columns: string[];
  rows: RowRecord[];
  rawRows?: string[][];
};

export type WorkbookData = {
  sheets: Record<string, SheetData>;
  sheetOrder: string[];
};

export type FilterState = Record<string, string[]>;

export type WorkbookMeta = {
  sheets: Array<{ name: string; rows: number; columns: number }>;
  loadedAt: string;
  fileName: string;
};

export type SemanticFields = {
  alcaldia?: string;
  anio?: string;
  sexo?: string;
  grupoEdad?: string;
  deporte?: string;
  tipoInfraestructura?: string;
  personasActivas?: string;
  poblacionTotal?: string;
  porcentajeActivo?: string;
  infraestructura?: string;
  deportivos?: string;
  pilares?: string;
  gimnasios?: string;
  parques?: string;
  obesidad?: string;
  sobrepeso?: string;
  diabetes?: string;
  sedentarismo?: string;
};

export type WorkbookJson = {
  meta: {
    generatedAt: string;
    sourceFileName: string;
    chartsFileName?: string | null;
    sheetNames: string[];
    rowCounts: Record<string, number>;
  };
  sheets: Record<string, RowRecord[]>;
  excelCharts?: Record<string, { title?: string; source?: string; table?: Array<Record<string, unknown>>; meta?: Record<string, unknown> }>;
  inferred?: {
    semanticMap?: SemanticFields;
  };
};

export type AddonJson = {
  meta: {
    fileName: string;
    generatedAt: string;
    sheetNames: string[];
    rowCounts: Record<string, number>;
  };
  datos: Array<Record<string, unknown>>;
  graficas?: Array<Record<string, unknown>>;
};
