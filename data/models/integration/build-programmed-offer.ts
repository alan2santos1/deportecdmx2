import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import type { ProgrammedOfferRecord } from "../../../lib/dashboard-types";
import { normalizeDiscipline } from "./discipline-catalog";
import { normalizeAlcaldia } from "./normalize-alcaldia";

type WorkbookRow = Record<string, string | number | null | undefined>;

type SourceDefinition = {
  candidates: string[];
  sheet: string;
  range: number;
  channel: ProgrammedOfferRecord["channel"];
  cutLabel: string;
  sourceDate: string;
  sourceName: string;
};

const sourceDefinitions: SourceDefinition[] = [
  {
    candidates: [
      "docs/fuentes-operativas/ACUMULADA PILARES ABRIL 26 GDE.xlsx",
      "docs/ACUMULADA PILARES ABRIL 26 GDE.xlsx"
    ],
    sheet: "abril",
    range: 3,
    channel: "PILARES",
    cutLabel: "2026-04",
    sourceDate: "2026-04-30",
    sourceName: "ACUMULADA PILARES ABRIL 26 GDE.xlsx"
  },
  {
    candidates: [
      "docs/fuentes-operativas/MALLA-HORARIA-DPP-PPP-JUL2026 SPPA.xlsx"
    ],
    sheet: "MALLA HORARIA PUNTOS PONTE PILA",
    range: 2,
    channel: "Ponte Pila",
    cutLabel: "2026-07",
    sourceDate: "2026-07-31",
    sourceName: "MALLA-HORARIA-DPP-PPP-JUL2026 SPPA.xlsx"
  },
  {
    candidates: [
      "docs/fuentes-operativas/MALLA-HORARIA-DPP-PPP-JUL2026 SPPA.xlsx"
    ],
    sheet: "MALLA HORARIA GENERAL ESCUELAS",
    range: 2,
    channel: "Ponte Pila",
    cutLabel: "2026-07",
    sourceDate: "2026-07-31",
    sourceName: "MALLA-HORARIA-DPP-PPP-JUL2026 SPPA.xlsx"
  }
];

const scheduleColumns: Array<{
  keys: string[];
  day: ProgrammedOfferRecord["dayOfWeek"];
}> = [
  { keys: ["LUNES"], day: "lunes" },
  { keys: ["MARTES"], day: "martes" },
  { keys: ["MIERCOLES", "MIÉRCOLES"], day: "miercoles" },
  { keys: ["JUEVES"], day: "jueves" },
  { keys: ["VIERNES"], day: "viernes" },
  { keys: ["SABADO", "SÁBADO"], day: "sabado" },
  { keys: ["DOMINGO"], day: "domingo" }
];

const normalizeText = (value: string | number | null | undefined) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeText = (value: string | number | null | undefined) => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
};

const resolveSourcePath = (candidates: string[]) => {
  for (const relativePath of candidates) {
    const absolutePath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(absolutePath)) {
      return {
        absolutePath,
        relativePath
      };
    }
  }
  throw new Error(`No se encontró ninguna fuente operativa: ${candidates.join(" | ")}`);
};

const readRows = (definition: SourceDefinition) => {
  const sourcePath = resolveSourcePath(definition.candidates);
  const workbook = xlsx.readFile(sourcePath.absolutePath);
  const rows = xlsx.utils.sheet_to_json<WorkbookRow>(workbook.Sheets[definition.sheet], {
    defval: "",
    raw: true,
    range: definition.range
  });
  return {
    ...sourcePath,
    rows
  };
};

const parseTimeRange = (value: string | null) => {
  if (!value) return { startTime: null, endTime: null, durationHours: null };
  const compact = value.replace(/\s+/g, "");
  const match = compact.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
  if (!match) return { startTime: null, endTime: null, durationHours: null };
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const startTime = match[1];
  const endTime = match[2];
  const minutes = Math.max(toMinutes(endTime) - toMinutes(startTime), 0);
  return {
    startTime,
    endTime,
    durationHours: minutes > 0 ? Number((minutes / 60).toFixed(2)) : null
  };
};

const inferDaypart = (startTime: string | null): ProgrammedOfferRecord["daypart"] => {
  if (!startTime) return "mixta";
  const hour = Number(startTime.split(":")[0]);
  return hour < 13 ? "matutina" : "vespertina";
};

const buildGeoKey = (alcaldia: string | null) =>
  alcaldia
    ? alcaldia
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : null;

const buildVenueName = (row: WorkbookRow, sheet: string) => {
  if (sheet === "abril") return sanitizeText(row.PILARES);
  return sanitizeText(row["PUNTO PONTE PILA (ESCUELA)"]) ?? sanitizeText(row["PUNTO PONTE PILA_1"]) ?? sanitizeText(row["PUNTO PONTE PILA"]);
};

const buildActivityOriginal = (row: WorkbookRow, sheet: string) => {
  if (sheet === "abril") return sanitizeText(row.ACTIVIDAD);
  return sanitizeText(row["DISCIPLINA CATALOGO 2026"]);
};

const buildDisciplineOriginal = (row: WorkbookRow, sheet: string) => {
  if (sheet === "abril") {
    const detailed = sanitizeText(row["ACTIVIDAD DESAGREGADA"]);
    const activity = sanitizeText(row.ACTIVIDAD);
    const detailedKey = normalizeText(detailed);
    const activityKey = normalizeText(activity);
    if (detailedKey === "atletismo" && (activityKey === "atletismo carrera" || activityKey === "atletismo(carrera)" || activityKey === "atletismo carrera")) {
      return activity;
    }
    return detailed ?? activity;
  }
  return sanitizeText(row["DISCIPLINA CATALOGO 2026"]) ?? sanitizeText(row["DISCIPLINA CATALOGO"]);
};

const buildModality = (row: WorkbookRow, sheet: string) => {
  if (sheet === "abril") return sanitizeText(row["TIPO DE    PROMOTOR"]);
  return sanitizeText(row["MODALIDAD MIXTO / AFUERA"]);
};

const buildStaffSex = (row: WorkbookRow): ProgrammedOfferRecord["staffSex"] => {
  const value = sanitizeText(row.SEXO);
  if (value === "H") return "H";
  if (value === "M") return "M";
  return "No documentado";
};

const buildClassGroupKey = (definition: SourceDefinition, row: WorkbookRow, rowIndex: number, venueName: string | null, disciplineNormalized: string | null) =>
  [
    definition.channel,
    definition.cutLabel,
    normalizeText(venueName),
    normalizeText(buildActivityOriginal(row, definition.sheet)),
    normalizeText(disciplineNormalized),
    normalizeText(buildModality(row, definition.sheet)),
    normalizeText(row.FIGURA),
    String(rowIndex + 1)
  ].join("|");

export const buildProgrammedOfferRecords = (): ProgrammedOfferRecord[] => {
  const dedupe = new Set<string>();
  const records: ProgrammedOfferRecord[] = [];

  for (const definition of sourceDefinitions) {
    const { rows, relativePath } = readRows(definition);

    rows.forEach((row, rowIndex) => {
      const rawAlcaldia = definition.sheet === "abril" ? sanitizeText(row["ALCALDÍA"]) : sanitizeText(row.ALCALDIA);
      const normalizedAlcaldia = rawAlcaldia ? normalizeAlcaldia(rawAlcaldia) : null;
      const alcaldia = normalizedAlcaldia?.alcaldia ?? rawAlcaldia ?? "Sin alcaldía documentada";
      const geoKey = normalizedAlcaldia?.geoKey ?? buildGeoKey(rawAlcaldia);
      const venueName = buildVenueName(row, definition.sheet);
      const disciplineOriginal = buildDisciplineOriginal(row, definition.sheet);
      const normalizedDiscipline = normalizeDiscipline(disciplineOriginal);
      const classGroupId = buildClassGroupKey(definition, row, rowIndex, venueName, normalizedDiscipline.normalized);
      const activityOriginal = buildActivityOriginal(row, definition.sheet);
      const modality = buildModality(row, definition.sheet);
      const staffSex = buildStaffSex(row);

      for (const scheduleColumn of scheduleColumns) {
        const rawLabel =
          scheduleColumn.keys.map((key) => sanitizeText(row[key])).find(Boolean) ?? null;
        if (!rawLabel) continue;
        const parsed = parseTimeRange(rawLabel);
        const dedupeKey = [
          definition.cutLabel,
          definition.sheet,
          classGroupId,
          scheduleColumn.day,
          parsed.startTime ?? rawLabel,
          parsed.endTime ?? ""
        ].join("|");
        if (dedupe.has(dedupeKey)) continue;
        dedupe.add(dedupeKey);

        records.push({
          id: `offer-${records.length + 1}`,
          year: 2026,
          cutLabel: definition.cutLabel,
          sourceFile: relativePath,
          sourceSheet: definition.sheet,
          channel: definition.channel,
          alcaldia,
          geoKey,
          disciplineOriginal: normalizedDiscipline.original,
          disciplineNormalized: normalizedDiscipline.normalized,
          disciplineCategory: normalizedDiscipline.category,
          disciplineSubcategory: normalizedDiscipline.subcategory,
          activityOriginal,
          modality,
          staffSex,
          dayOfWeek: scheduleColumn.day,
          daypart: inferDaypart(parsed.startTime),
          isWeekend: scheduleColumn.day === "sabado" || scheduleColumn.day === "domingo",
          classGroupId,
          sessionCount: 1,
          scheduledHours: parsed.durationHours ?? 1,
          sourceRowCount: 1,
          dataType: "real",
          dataNature: "oferta_programada",
          institutionalScope: definition.channel === "PILARES" ? "pilares" : "ponte_pila",
          coverageLevel: "parcial",
          sourceName: definition.sourceName,
          sourceDate: definition.sourceDate,
          asOfDate: definition.sourceDate,
          qualityGrade: definition.channel === "PILARES" ? "A" : "A",
          calculationVersion: "offer-v1-2026-08-03",
          methodologicalNote:
            "Oferta programada derivada de mallas operativas reales de PILARES y Ponte Pila. Describe clases, horarios y horas asignadas; no mide participación observada, demanda ni preferencias y su cobertura es parcial frente al ecosistema deportivo completo de CDMX."
        });
      }
    });
  }

  return records.sort((a, b) => a.alcaldia.localeCompare(b.alcaldia, "es") || a.channel.localeCompare(b.channel, "es"));
};
