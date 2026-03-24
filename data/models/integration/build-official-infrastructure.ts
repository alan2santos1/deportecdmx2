import fs from "fs";
import path from "path";
import type { DataLayer, InfrastructureDetailRecord } from "../../../lib/dashboard-types";
import { officialSourceConfig } from "./official-source-config";
import { normalizeAlcaldia } from "./normalize-alcaldia";

type OfficialInfrastructureLayer = {
  meta: {
    generatedAt: string;
    integratedSources: Array<{
      key: string;
      dataset: string;
      localPath: string;
      integrated: boolean;
      recordCount: number;
      note: string;
    }>;
  };
  details: InfrastructureDetailRecord[];
  summaryByAlcaldia: Record<string, { pilares: number; publicSportsCenters: number }>;
  geometryPlaceholder: Array<{ alcaldia: string; geoKey: string; status: DataLayer; note: string }>;
};

const readCsv = (filePath: string) => {
  const absolutePath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) return [];
  const raw = fs.readFileSync(absolutePath, "utf-8").replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const next = raw[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }
  if (value.length > 0 || row.length > 0) {
    row.push(value);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  const [header = [], ...body] = rows;
  return body.map((cells) => {
    const next: Record<string, string> = {};
    header.forEach((column, index) => {
      next[column.trim()] = (cells[index] ?? "").trim();
    });
    return next;
  });
};

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const defaultSportsByType: Record<string, string[]> = {
  PILARES: ["Activación física", "Zumba", "Yoga"],
  "Deportivos públicos": ["Fútbol", "Básquetbol", "Acondicionamiento"],
  Gimnasios: ["Acondicionamiento", "Pesas"],
  "Clubes deportivos": ["Fútbol", "Tenis", "Natación"],
  "Escuelas de deporte": ["Iniciación deportiva", "Entrenamiento"]
};

export const buildOfficialInfrastructureLayer = (): OfficialInfrastructureLayer => {
  const pilaresRows = readCsv(officialSourceConfig.pilares.localPath);
  const publicSportsRows = readCsv(officialSourceConfig.publicSports.localPath);

  const pilaresDetails: InfrastructureDetailRecord[] = pilaresRows.map((row) => {
    const normalized = normalizeAlcaldia(row.ALCALDIA);
    return {
      id: `pilares-${row.CLAVE_ID}`,
      spaceName: row["NOMBRE_PILARES*"] || row.CLAVE_ID,
      tipo_espacio: "pilares",
      infrastructureType: "PILARES",
      alcaldia: normalized.alcaldia,
      originalAlcaldia: normalized.original,
      needsAlcaldiaNormalization: !normalized.matched,
      geoKey: normalized.geoKey,
      year: 2025,
      sportsAvailable: defaultSportsByType.PILARES,
      capacity: 42,
      capacityType: "estimada",
      units: 1,
      latitude: toNumber(row.LATITUD),
      longitude: toNumber(row.LONGITUD),
      status: row.ESTATUS || null,
      sourceDataset: officialSourceConfig.pilares.dataset,
      dataType: "real",
      source: officialSourceConfig.pilares.url,
      methodologicalNote: normalized.matched
        ? "Sede real integrada desde el CSV oficial de PILARES. La capacidad es estimada porque la fuente no publica aforo."
        : "Sede real integrada desde el CSV oficial de PILARES. La alcaldía se dejó tal como vino la fuente por falta de coincidencia exacta."
    };
  });

  const publicSportsDetails: InfrastructureDetailRecord[] = publicSportsRows.map((row, index) => {
    const normalized = normalizeAlcaldia(row.Municipio);
    return {
      id: `deportivo-publico-${index + 1}`,
      spaceName: row.Nombre || `Deportivo público ${index + 1}`,
      tipo_espacio: row["Nombre de clase de la actividad"] || "deportivo público",
      infrastructureType: "Deportivos públicos",
      alcaldia: normalized.alcaldia,
      originalAlcaldia: normalized.original,
      needsAlcaldiaNormalization: !normalized.matched,
      geoKey: normalized.geoKey,
      year: 2025,
      sportsAvailable: defaultSportsByType["Deportivos públicos"],
      capacity: 180,
      capacityType: "estimada",
      units: 1,
      latitude: toNumber(row.Latitud),
      longitude: toNumber(row.Longitud),
      status: "No reportado en fuente",
      sourceDataset: officialSourceConfig.publicSports.dataset,
      dataType: "real",
      source: officialSourceConfig.publicSports.url,
      methodologicalNote: normalized.matched
        ? "Instalación real integrada desde el inventario oficial. La fuente no publica aforo ni deportes disponibles por sede."
        : "Instalación real integrada desde el inventario oficial. La alcaldía quedó sin normalización exacta y se requiere revisión manual."
    };
  });

  const details = [...pilaresDetails, ...publicSportsDetails];
  const summaryByAlcaldia = details.reduce<Record<string, { pilares: number; publicSportsCenters: number }>>((acc, item) => {
    const key = item.alcaldia;
    acc[key] = acc[key] ?? { pilares: 0, publicSportsCenters: 0 };
    if (item.infrastructureType === "PILARES") acc[key].pilares += 1;
    if (item.infrastructureType === "Deportivos públicos") acc[key].publicSportsCenters += 1;
    return acc;
  }, {});

  const geometryPlaceholder = Object.keys(summaryByAlcaldia).map((alcaldia) => ({
    alcaldia,
    geoKey: normalizeAlcaldia(alcaldia).geoKey,
    status: "preparado" as DataLayer,
    note: "Pendiente conectar geometría oficial de alcaldías en GeoJSON o TopoJSON."
  }));

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      integratedSources: [
        {
          key: "pilares",
          dataset: officialSourceConfig.pilares.dataset,
          localPath: officialSourceConfig.pilares.localPath,
          integrated: pilaresDetails.length > 0,
          recordCount: pilaresDetails.length,
          note: "Integración nominal real por sede."
        },
        {
          key: "publicSports",
          dataset: officialSourceConfig.publicSports.dataset,
          localPath: officialSourceConfig.publicSports.localPath,
          integrated: publicSportsDetails.length > 0,
          recordCount: publicSportsDetails.length,
          note: "Integración nominal real por instalación."
        },
        {
          key: "denue",
          dataset: officialSourceConfig.denue.dataset,
          localPath: officialSourceConfig.denue.localPath,
          integrated: false,
          recordCount: 0,
          note: "Conector preparado; falta descarga y filtrado real por SCIAN."
        },
        {
          key: "geometry",
          dataset: officialSourceConfig.geometry.dataset,
          localPath: officialSourceConfig.geometry.localPath,
          integrated: false,
          recordCount: geometryPlaceholder.length,
          note: "Placeholder técnico listo; falta geometría oficial."
        }
      ]
    },
    details,
    summaryByAlcaldia,
    geometryPlaceholder
  };
};
