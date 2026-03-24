import fs from "fs";
import path from "path";
import type { DataLayer, InfrastructureDetailRecord } from "../../../lib/dashboard-types";
import { officialSourceConfig } from "./official-source-config";
import { normalizeAlcaldia } from "./normalize-alcaldia";

type DenueGeojson = {
  features: Array<{
    properties: Record<string, string | null>;
    geometry?: { type: string; coordinates?: [number, number] };
  }>;
};

export type OfficialInfrastructureLayer = {
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
  summaryByAlcaldia: Record<
    string,
    {
      pilares: number;
      publicSportsCenters: number;
      privateFacilities: number;
      privateGyms: number;
      privateClubs: number;
      privateSchools: number;
    }
  >;
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

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const readJson = <T,>(filePath: string): T | null => {
  const absolutePath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) return null;
  return JSON.parse(fs.readFileSync(absolutePath, "utf-8")) as T;
};

const defaultSportsByType: Record<string, string[]> = {
  PILARES: ["Activación física", "Zumba", "Yoga"],
  "Deportivos públicos": ["Fútbol", "Básquetbol", "Acondicionamiento"],
  Gimnasios: ["Acondicionamiento", "Pesas"],
  "Clubes deportivos": ["Fútbol", "Tenis", "Natación"],
  "Escuelas de deporte": ["Iniciación deportiva", "Entrenamiento"]
};

const operationalUnitFactors = {
  pilares: 7,
  publicSports: 4,
  privateGym: 2,
  privateClub: 3,
  privateSchool: 2
} as const;

const denueSubtypeConfig = [
  {
    subtype: "Clubes deportivos",
    match: (text: string) =>
      text.includes("club deportivo") ||
      /club\s+(de\s+)?(tenis|natacion|futbol|golf|padel|deportivo)/.test(text),
    sports: defaultSportsByType["Clubes deportivos"]
  },
  {
    subtype: "Escuelas de deporte",
    match: (text: string) =>
      (text.includes("academia") || text.includes("escuela")) &&
      /(futbol|natacion|box|taekwondo|karate|tenis|basquet|voleibol|deporte|fitness|gimnas)/.test(text),
    sports: defaultSportsByType["Escuelas de deporte"]
  },
  {
    subtype: "Gimnasios",
    match: (text: string) =>
      /(gimnasio| gym |gym$|gymnasium|fitness|crossfit|pilates|spinning|box|boxing|yoga|calistenia|acondicionamiento)/.test(
        ` ${text} `
      ),
    sports: defaultSportsByType.Gimnasios
  }
] as const;

const denueExcludePattern =
  /(articulos y aparatos deportivos|ropa deportiva|suplement|nutricion|farmacia|vinos|joyeria|papeleria|musica|instrumentos|moto|automovil|llantas|bazar|figuras coleccionables)/;

const buildDenueDetails = (): InfrastructureDetailRecord[] => {
  const denue = readJson<DenueGeojson>(officialSourceConfig.denue.localPath);
  if (!denue?.features) return [];

  return denue.features.flatMap((feature, index) => {
    const name = feature.properties.nmbr_st ?? feature.properties.rzn_scl ?? `DENUE ${index + 1}`;
    const text = normalizeText(
      [
        feature.properties.nmbr_st,
        feature.properties.rzn_scl,
        feature.properties.activdd,
        feature.properties.ctgr_ct
      ]
        .filter(Boolean)
        .join(" ")
    );

    if (!text || denueExcludePattern.test(text)) return [];

    const subtypeMatch = denueSubtypeConfig.find((item) => item.match(text));
    if (!subtypeMatch) return [];

    const normalized = normalizeAlcaldia(feature.properties.alcaldi);
    const coordinates = feature.geometry?.coordinates;

    return [
      {
        id: `denue-${index + 1}`,
        spaceName: name,
        tipo_espacio:
          subtypeMatch.subtype === "Gimnasios"
            ? "gimnasio / acondicionamiento"
            : subtypeMatch.subtype === "Clubes deportivos"
              ? "club deportivo"
              : "academia / escuela de deporte",
        infrastructureType: "Gimnasios" as const,
        alcaldia: normalized.alcaldia,
        originalAlcaldia: normalized.original,
        needsAlcaldiaNormalization: !normalized.matched,
        geoKey: normalized.geoKey,
        year: 2025,
        sportsAvailable: subtypeMatch.sports,
        administrativeCount: 1,
        administrativeLabel: subtypeMatch.subtype === "Gimnasios" ? "Establecimientos privados" : subtypeMatch.subtype,
        operationalUnits:
          subtypeMatch.subtype === "Gimnasios"
            ? operationalUnitFactors.privateGym
            : subtypeMatch.subtype === "Clubes deportivos"
              ? operationalUnitFactors.privateClub
              : operationalUnitFactors.privateSchool,
        operationalLabel:
          subtypeMatch.subtype === "Gimnasios"
            ? "Espacios operativos privados estimados"
            : subtypeMatch.subtype === "Clubes deportivos"
              ? "Unidades operativas de club estimadas"
              : "Unidades operativas de academia estimadas",
        capacity: subtypeMatch.subtype === "Gimnasios" ? 55 : subtypeMatch.subtype === "Clubes deportivos" ? 80 : 35,
        capacityType: "estimada" as const,
        units: 1,
        latitude: Array.isArray(coordinates) ? coordinates[1] : null,
        longitude: Array.isArray(coordinates) ? coordinates[0] : null,
        status: "Fuente económica sin estatus operativo",
        sourceDataset: officialSourceConfig.denue.dataset,
        subtype: subtypeMatch.subtype,
        dataType: "preparado" as const,
        source: officialSourceConfig.denue.url,
        methodologicalNote:
          "Registro descargado de DENUE CDMX y clasificado por heurística textual porque este export no expone el código SCIAN objetivo de forma usable. Debe sustituirse por un corte con SCIAN verificable para tratarse como real."
      }
    ];
  });
};

export const buildOfficialInfrastructureLayer = (): OfficialInfrastructureLayer => {
  const pilaresRows = readCsv(officialSourceConfig.pilares.localPath);
  const publicSportsRows = readCsv(officialSourceConfig.publicSports.localPath);
  const denueDetails = buildDenueDetails();

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
      administrativeCount: 1,
      administrativeLabel: "Sedes PILARES",
      operationalUnits: operationalUnitFactors.pilares,
      operationalLabel: "Espacios operativos PILARES",
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
      administrativeCount: 1,
      administrativeLabel: "Instalaciones deportivas públicas",
      operationalUnits: operationalUnitFactors.publicSports,
      operationalLabel: "Espacios operativos deportivos estimados",
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

  const details = [...pilaresDetails, ...publicSportsDetails, ...denueDetails];
  const summaryByAlcaldia = details.reduce<OfficialInfrastructureLayer["summaryByAlcaldia"]>((acc, item) => {
    const key = item.alcaldia;
    acc[key] = acc[key] ?? {
      pilares: 0,
      publicSportsCenters: 0,
      privateFacilities: 0,
      privateGyms: 0,
      privateClubs: 0,
      privateSchools: 0
    };
    if (item.infrastructureType === "PILARES") acc[key].pilares += 1;
    if (item.infrastructureType === "Deportivos públicos") acc[key].publicSportsCenters += 1;
    if (item.sourceDataset === officialSourceConfig.denue.dataset) {
      acc[key].privateFacilities += 1;
      if (item.subtype === "Gimnasios") acc[key].privateGyms += 1;
      if (item.subtype === "Clubes deportivos") acc[key].privateClubs += 1;
      if (item.subtype === "Escuelas de deporte") acc[key].privateSchools += 1;
    }
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
          integrated: denueDetails.length > 0,
          recordCount: denueDetails.length,
          note: "Capa privada preparada desde DENUE. Queda etiquetada como preparado hasta contar con SCIAN verificable."
        },
        {
          key: "geometry",
          dataset: officialSourceConfig.geometry.dataset,
          localPath: officialSourceConfig.geometry.localPath,
          integrated: fs.existsSync(path.join(process.cwd(), officialSourceConfig.geometry.localPath)),
          recordCount: geometryPlaceholder.length,
          note: "GeoJSON oficial descargado y compatible con geoKey; el render vive en la capa de mapa."
        }
      ]
    },
    details,
    summaryByAlcaldia,
    geometryPlaceholder
  };
};
