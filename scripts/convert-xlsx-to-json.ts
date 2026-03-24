import fs from "fs";
import path from "path";
import { detectSemanticFields } from "../lib/semantic";
import deporteSeedModule from "../data/deporte-cdmx-seed";

const outputDir = path.join(process.cwd(), "public", "data");
const outputPath = path.join(outputDir, "workbook.json");

const deporteCdmxSeed = deporteSeedModule.deporteCdmxSeed;

type SeedSheets = Record<string, Array<Record<string, string>>>;

const stringifySheet = (rows: ReadonlyArray<Record<string, unknown>>) => {
  return rows.map((row) => {
    const next: Record<string, string> = {};
    Object.entries(row).forEach(([key, value]) => {
      next[key] = value === null || value === undefined ? "" : String(value);
    });
    return next;
  });
};

const buildSheets = (): SeedSheets => {
  const entries = Object.entries(deporteCdmxSeed).map(([name, rows]) => [name, stringifySheet(rows)] as const);
  return Object.fromEntries(entries);
};

const run = () => {
  const sheets = buildSheets();
  const sheetNames = Object.keys(sheets);
  const rowCounts = Object.fromEntries(sheetNames.map((name) => [name, sheets[name].length]));
  const semanticMap = detectSemanticFields(Object.keys(sheets.DEPORTE_CDMX_BASE[0] ?? {}));

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceFileName: "deporte-cdmx-seed.ts",
      chartsFileName: null,
      sheetNames,
      rowCounts
    },
    sheets,
    excelCharts: {},
    inferred: {
      semanticMap
    }
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`[data:build] Generated ${outputPath}`);
};

run();
