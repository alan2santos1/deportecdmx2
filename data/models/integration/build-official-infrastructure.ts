import fs from "fs";
import path from "path";
import type { DataLayer, InfrastructureDetailRecord } from "../../../lib/dashboard-types";
import { officialSourceConfig } from "./official-source-config";
import { extractDenueScianCode, getDashboardCategoryFromScian, normalizeDenueRecord } from "./denue-normalizer";
import { normalizeAlcaldia } from "./normalize-alcaldia";
import utopias from "../../processed/infrastructure/utopias.json";

type DenueGeojson = {
  features: Array<{
    properties: Record<string, string | null | undefined>;
    geometry?: { type: string; coordinates?: [number, number] };
  }>;
};

type UtopiaSeedRecord = (typeof utopias)[number];

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
      utopias: number;
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

const operationalUnitFactors = {
  pilares: 7,
  utopias: 6,
  publicSports: 4,
  privateGym: 2,
  privateClub: 3,
  privateSchool: 2
} as const;

const documentedDisciplineMatchers: Array<{ label: string; pattern: RegExp }> = [
  { label: "Natación", pattern: /\b(natacion|natación|alberca|acuatic)/ },
  { label: "Básquetbol", pattern: /\b(basquet|básquet|basket|basquetbol|básquetbol)\b/ },
  { label: "Fútbol", pattern: /\b(futbol|fútbol)\b/ },
  { label: "Atletismo", pattern: /\b(atletismo|pista)\b/ },
  { label: "Box", pattern: /\b(box|boxing)\b/ },
  { label: "Tenis", pattern: /\btenis\b/ },
  { label: "Pádel", pattern: /\b(padel|pádel)\b/ },
  { label: "Yoga", pattern: /\byoga\b/ },
  { label: "Activación física", pattern: /\b(activacion|activación)\b/ },
  { label: "Acondicionamiento / gimnasio", pattern: /\b(gimnasio|fitness|pesas|crossfit|spinning|acondicionamiento)\b/ }
];

const extractDocumentedSports = (...texts: Array<string | null | undefined>) => {
  const normalizedText = normalizeText(texts.filter(Boolean).join(" "));
  if (!normalizedText) return [];
  return documentedDisciplineMatchers
    .filter((item) => item.pattern.test(normalizedText))
    .map((item) => item.label);
};

type PrivateInfrastructureSubtype = "Gimnasio privado" | "Club deportivo privado" | "Academia deportiva privada";

const denueExcludePattern =
  /(articulos y aparatos deportivos|articulos para albercas|ropa deportiva|boutique|suplement|nutricion|farmacia|vinos|joyeria|papeleria|musica|instrumentos|moto|automovil|llantas|bazar|figuras coleccionables|abarrotes|carniceria|dulces|bebidas|panader|juguetes|revistas|decoracion|refacciones|calzado|ropa, excepto|productos naturistas|farmacias sin minisuper|cooperativa|escuela primaria|escuela secundaria|escuela nacional|escuela superior|escuela de manejo|escuela de musica|pronosticos|optica|lentes|autopartes|muebles|herramient|calentadores|bombas|ferreter)/;

const denuePublicMarkerPattern =
  /(gobierno|alcaldia|sector publico|indeporte|instituto del deporte|sedena|semar|imss|issste|cetram)/;

const buildDenueDedupeKey = (feature: DenueGeojson["features"][number]) => {
  const coordinates = feature.geometry?.coordinates;
  return [
    normalizeText(feature.properties.nmbr_st ?? feature.properties.rzn_scl ?? ""),
    normalizeText(feature.properties.direccn),
    normalizeText(feature.properties.alcaldi),
    Array.isArray(coordinates) ? coordinates.map((item) => item.toFixed(5)).join(",") : ""
  ].join("|");
};

const mapSubtypeLabels = (subtype: PrivateInfrastructureSubtype) => ({
  tipo_espacio:
    subtype === "Gimnasio privado"
      ? "gimnasio / acondicionamiento"
      : subtype === "Club deportivo privado"
        ? "club deportivo"
        : "academia / escuela de deporte",
  administrativeLabel:
    subtype === "Gimnasio privado"
      ? "Gimnasios privados"
      : subtype === "Club deportivo privado"
        ? "Clubes deportivos privados"
        : "Academias deportivas privadas",
  operationalUnits:
    subtype === "Gimnasio privado"
      ? operationalUnitFactors.privateGym
      : subtype === "Club deportivo privado"
        ? operationalUnitFactors.privateClub
        : operationalUnitFactors.privateSchool,
  operationalLabel:
    subtype === "Gimnasio privado"
      ? "Espacios operativos privados estimados"
      : subtype === "Club deportivo privado"
        ? "Unidades operativas de club estimadas"
        : "Unidades operativas de academia estimadas",
  capacity:
    subtype === "Gimnasio privado"
      ? 55
      : subtype === "Club deportivo privado"
        ? 80
        : 35
});

const inferDenueSubtypeFromText = (
  nameText: string,
  activityText: string,
  categoryText: string
): PrivateInfrastructureSubtype | null => {
  const merged = ` ${nameText} ${activityText} ${categoryText} `;
  if (!merged.trim() || denueExcludePattern.test(merged) || denuePublicMarkerPattern.test(merged)) return null;

  if (
    /(gimnasio| gym |gym$|gymnasium|fitness|crossfit|pilates|spinning|yoga|calistenia|acondicionamiento)/.test(
      merged
    )
  ) {
    return "Gimnasio privado";
  }

  if (
    ((merged.includes("academia") || merged.includes("escuela") || merged.includes("studio")) &&
      /(futbol|natacion|box|boxing|taekwondo|karate|tenis|basquet|voleibol|deporte|fitness|gimnas|pilates|yoga|dance|ballet|artes marciales)/.test(merged)) ||
    /(boxing studio|martial arts|taekwondo|karate|jiu jitsu|jiujitsu)/.test(merged)
  ) {
    return "Academia deportiva privada";
  }

  if (
    merged.includes("club deportivo") ||
    /(club|centro)\s+(de\s+)?(tenis|natacion|futbol|golf|padel|deportivo|acuatico)/.test(merged) ||
    /(deportivo chapultepec|sport city club|club campestre|club de golf)/.test(merged)
  ) {
    return "Club deportivo privado";
  }

  return null;
};

const buildDenueDetails = (): InfrastructureDetailRecord[] => {
  const denue = readJson<DenueGeojson>(officialSourceConfig.denue.localPath);
  if (!denue?.features) return [];
  const seen = new Set<string>();

  return denue.features.flatMap((feature, index) => {
    const name = feature.properties.nmbr_st ?? feature.properties.rzn_scl ?? `DENUE ${index + 1}`;
    const nameText = normalizeText(feature.properties.nmbr_st ?? feature.properties.rzn_scl ?? "");
    const activityText = normalizeText(feature.properties.activdd);
    const categoryText = normalizeText(feature.properties.ctgr_ct);
    const mergedText = [nameText, activityText, categoryText].filter(Boolean).join(" ");

    const dedupeKey = buildDenueDedupeKey(feature);
    if (seen.has(dedupeKey)) return [];
    seen.add(dedupeKey);

    const scianCode = extractDenueScianCode(feature.properties);
    const scianRecord = scianCode
      ? normalizeDenueRecord({
        id: `denue-${index + 1}`,
        nombre: name,
        alcaldia: feature.properties.alcaldi,
        scianCode
      })
      : null;
    const subtypeFromScian = scianCode ? getDashboardCategoryFromScian(scianCode) : null;
    const inferredSubtype = inferDenueSubtypeFromText(nameText, activityText, categoryText);
    const subtype = (subtypeFromScian ?? inferredSubtype) as PrivateInfrastructureSubtype | null;
    if (!mergedText || !subtype) return [];

    const normalized = normalizeAlcaldia(feature.properties.alcaldi);
    const coordinates = feature.geometry?.coordinates;
    const documentedSports = extractDocumentedSports(
      feature.properties.nmbr_st,
      feature.properties.rzn_scl,
      feature.properties.activdd,
      feature.properties.ctgr_ct
    );
    const labels = mapSubtypeLabels(subtype);
    const isScianVerified = Boolean(scianRecord && subtypeFromScian);

    return [
      {
        id: `denue-${index + 1}`,
        spaceName: name,
        tipo_espacio: labels.tipo_espacio,
        infrastructureType: subtype,
        alcaldia: normalized.alcaldia,
        originalAlcaldia: normalized.original,
        needsAlcaldiaNormalization: !normalized.matched,
        geoKey: normalized.geoKey,
        year: 2025,
        sportsAvailable: documentedSports,
        disciplineStatus: documentedSports.length > 0 ? "disponible" : "no_documentado",
        administrativeCount: 1,
        administrativeLabel: labels.administrativeLabel,
        operationalUnits: labels.operationalUnits,
        operationalLabel: labels.operationalLabel,
        capacity: labels.capacity,
        capacityType: "estimada" as const,
        units: 1,
        latitude: Array.isArray(coordinates) ? coordinates[1] : null,
        longitude: Array.isArray(coordinates) ? coordinates[0] : null,
        status: "Fuente económica sin estatus operativo",
        sourceDataset: officialSourceConfig.denue.dataset,
        subtype,
        dataType: isScianVerified ? "real" : "preparado",
        source: officialSourceConfig.denue.url,
        methodologicalNote:
          isScianVerified
            ? `Registro DENUE clasificado con SCIAN ${scianCode}. Las disciplinas visibles provienen solo de texto explícito del registro; no se infieren amenidades internas.`
            : documentedSports.length > 0
              ? "Registro descargado de DENUE CDMX y clasificado por nombre/actividad observable. Las disciplinas visibles provienen solo de texto explícito del registro; no se infieren amenidades internas."
              : "Registro descargado de DENUE CDMX y clasificado por nombre/actividad observable porque este export no expone el código SCIAN objetivo de forma usable. Se integra como capa privada preparada y las disciplinas quedan no documentadas cuando la fuente no las explicita."
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
      sportsAvailable: [],
      disciplineStatus: "no_documentado",
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
      sportsAvailable: extractDocumentedSports(row.Nombre, row["Nombre de clase de la actividad"]),
      disciplineStatus: extractDocumentedSports(row.Nombre, row["Nombre de clase de la actividad"]).length > 0 ? "disponible" : "no_documentado",
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

  const utopiasDetails: InfrastructureDetailRecord[] = (utopias as UtopiaSeedRecord[]).map((row) => {
    const normalized = row.alcaldia ? normalizeAlcaldia(row.alcaldia) : null;
    const hasTerritorialKey = Boolean(row.alcaldia && normalized?.matched);
    return {
      id: row.id,
      spaceName: row.nombre,
      tipo_espacio: "utopia",
      infrastructureType: "UTOPÍAs",
      alcaldia: hasTerritorialKey && normalized ? normalized.alcaldia : "Sin alcaldía documentada",
      originalAlcaldia: row.alcaldia ?? null,
      needsAlcaldiaNormalization: !hasTerritorialKey,
      geoKey: hasTerritorialKey && normalized ? normalized.geoKey : undefined,
      year: 2025,
      sportsAvailable: [],
      disciplineStatus: "no_documentado",
      administrativeCount: 1,
      administrativeLabel: "UTOPÍAs documentadas",
      operationalUnits: operationalUnitFactors.utopias,
      operationalLabel: "Espacios operativos UTOPÍA estimados",
      capacity: 160,
      capacityType: "estimada",
      units: 1,
      latitude: row.lat,
      longitude: row.lon,
      status: row.status,
      sourceDataset: "Inventario institucional UTOPÍAs",
      dataType: "real",
      source: row.fuente,
      methodologicalNote: row.nota ??
        (row.alcaldia
          ? "UTOPÍA integrada como capa institucional real desde la investigación actual. No se infieren amenidades ni disciplinas por sede."
          : "UTOPÍA documentada en la investigación actual, pero aún sin alcaldía verificable dentro del proyecto. Se integra como capa real institucional sin territorializar.")
    };
  });

  const details = [...pilaresDetails, ...utopiasDetails, ...publicSportsDetails, ...denueDetails];
  const summaryByAlcaldia = details.reduce<OfficialInfrastructureLayer["summaryByAlcaldia"]>((acc, item) => {
    const key = item.alcaldia;
    if (key === "Sin alcaldía documentada") return acc;
    acc[key] = acc[key] ?? {
      pilares: 0,
      utopias: 0,
      publicSportsCenters: 0,
      privateFacilities: 0,
      privateGyms: 0,
      privateClubs: 0,
      privateSchools: 0
    };
    if (item.infrastructureType === "PILARES") acc[key].pilares += 1;
    if (item.infrastructureType === "UTOPÍAs") acc[key].utopias += 1;
    if (item.infrastructureType === "Deportivos públicos") acc[key].publicSportsCenters += 1;
    if (item.sourceDataset === officialSourceConfig.denue.dataset) {
      acc[key].privateFacilities += 1;
      if (item.subtype === "Gimnasio privado") acc[key].privateGyms += 1;
      if (item.subtype === "Club deportivo privado") acc[key].privateClubs += 1;
      if (item.subtype === "Academia deportiva privada") acc[key].privateSchools += 1;
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
          key: "utopias",
          dataset: "Inventario institucional UTOPÍAs",
          localPath: "data/processed/infrastructure/utopias.json",
          integrated: utopiasDetails.length > 0,
          recordCount: utopiasDetails.length,
          note: "Capa institucional real basada en la investigación vigente. No documenta amenidades por sede."
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
          note: "Capa privada cargada desde DENUE. Si el extracto trae SCIAN verificable se normaliza como real; con el corte local actual se conserva preparada y clasificada por texto explícito."
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
