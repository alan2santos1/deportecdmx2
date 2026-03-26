import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import type {
  CanchaGeolocationType,
  CanchaInaugurationStatus,
  CanchaOperationalRecord,
  CanchasSummaryRecord
} from "../../../lib/dashboard-types";
import { alcaldiasSeed } from "../../raw/alcaldias";
import { normalizeAlcaldia } from "./normalize-alcaldia";
import { buildOfficialInfrastructureLayer } from "./build-official-infrastructure";

type WorkbookRow = Record<string, string | number | null | undefined>;

type CanchasOperationalLayer = {
  meta: {
    generatedAt: string;
    workbookPath: string;
    sourceSheets: Array<{ sheet: string; rows: number; purpose: string }>;
    integratedRecords: number;
    recordsWithCoordinates: number;
    recordsWithoutCoordinates: number;
    pilaresCatalogMatches: number;
  };
  records: CanchaOperationalRecord[];
  summaryByAlcaldia: CanchasSummaryRecord[];
};

type TerritorialAttributes = {
  sheet: string;
  alcaldia?: string | null;
  name?: string | null;
  domicilio?: string | null;
  tipoCancha?: string | null;
  material?: string | null;
  origen?: string | null;
  mapsLink?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  territorialStatus?: string | null;
  territorialAdvance?: string | null;
  observations?: string | null;
};

type PilaresCatalogMatch = {
  officialName: string | null;
  responsibleName: string | null;
  contact: string | null;
  email: string | null;
  schedule: string | null;
  alcaldia: string | null;
};

const workbookRelativePath = "docs/13-03-2026-Proyecto_500_canchas_PILARES_ASIGNADO 315 mallas arquitecto.xlsx";
const workbookPath = path.join(process.cwd(), workbookRelativePath);
const mapGeometryPath = path.join(process.cwd(), "data", "raw", "external", "alcaldias.geojson");
const mapWidth = 900;
const mapHeight = 660;
const mapPadding = 24;

const monthMap: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11
};

const normalizeText = (value: string | number | null | undefined) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const normalizeMatchKey = (value: string | number | null | undefined) => normalizeText(value).replace(/\s+/g, " ");

const sanitizeText = (value: string | number | null | undefined) => {
  const raw = String(value ?? "").replace(/\s+/g, " ").trim();
  return raw.length > 0 ? raw : null;
};

const sanitizeMeaningfulText = (value: string | number | null | undefined) => {
  const raw = sanitizeText(value);
  return raw && hasMeaningfulText(raw) ? raw : null;
};

const isPlaceholderValue = (value: string | number | null | undefined) => {
  const normalized = normalizeText(value);
  return (
    normalized.length === 0 ||
    normalized === "no" ||
    normalized === "si" ||
    normalized === "ninguna" ||
    normalized === "ninguno" ||
    normalized === "sin actividades" ||
    normalized === "sin actividad" ||
    normalized === "sin actividad es" ||
    normalized === "sin presencia de ponte pila" ||
    normalized === "por asignar" ||
    normalized === "por definir" ||
    normalized === "sin observaciones"
  );
};

const hasMeaningfulText = (value: string | number | null | undefined) => !isPlaceholderValue(value);

const splitList = (value: string | number | null | undefined) => {
  if (!hasMeaningfulText(value)) return [];
  return String(value)
    .split(/[,;/]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && hasMeaningfulText(item) && !/(no se imparte|no aplica|sin presencia)/i.test(item));
};

const parseNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value ?? "")
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parsePromoterCount = (value: string | number | null | undefined) => {
  const number = parseNumber(value);
  return number !== null && number >= 0 ? number : null;
};

const isFutureKeyword = (value: string) =>
  /(tentativ|proxim|por inaugurar|por inagurar|en espera de inaugurar|propuesta|por confirmar|aun no|aun sin|sin fecha|sin fehca|sin fecha de inagur|sin fecha de inaugur|sin fecha tentativa)/.test(
    value
  );

const isPastKeyword = (value: string) =>
  /(se inauguro|se inaguro|ya se inaguro|ya se inauguro|ya esta abierta|ya esta remodelada|ya se usan|abierta ya remodelada|concluyeron las obras|se uso|se usan algunas)/.test(
    value
  );

const excelSerialToDate = (serial: number) => {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
};

const parseSpanishDate = (value: string) => {
  const normalized = normalizeText(value);
  const match = normalized.match(/(\d{1,2})\s+de?\s*([a-z]+)\s+(\d{4})/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = monthMap[match[2]];
  const year = Number(match[3]);
  if (month === undefined) return null;
  const date = new Date(Date.UTC(year, month, day));
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseInaugurationDate = (rawValue: string | number | null | undefined) => {
  const buildResponse = (
    raw: string | null,
    iso: string | null,
    status: CanchaInaugurationStatus,
    hasDateSignal: boolean
  ) => ({ raw, iso, status, hasDateSignal });
  const raw = sanitizeText(rawValue);
  if (!raw) {
    return buildResponse(null, null, "sin_fecha", false);
  }

  const normalized = normalizeText(raw);

  let date: Date | null = null;
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    date = excelSerialToDate(rawValue);
  } else {
    date = parseSpanishDate(raw);
    if (!date) {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime()) && /\d{4}/.test(raw)) {
        date = parsed;
      }
    }
  }

  if (date) {
    const iso = date.toISOString().slice(0, 10);
    const today = new Date();
    const status: CanchaInaugurationStatus = date.getTime() <= today.getTime() ? "inaugurada" : "proxima";
    return buildResponse(raw, iso, status, true);
  }

  if (isPastKeyword(normalized)) {
    return buildResponse(raw, null, "inaugurada", true);
  }

  if (isFutureKeyword(normalized)) {
    return buildResponse(raw, null, "proxima", true);
  }

  return buildResponse(raw, null, "sin_fecha", false);
};

const buildMapProjector = () => {
  if (!fs.existsSync(mapGeometryPath)) return null;
  const geojson = JSON.parse(fs.readFileSync(mapGeometryPath, "utf-8")) as {
    features: Array<{ geometry: { coordinates: any } }>;
  };

  const positions: Array<[number, number]> = [];
  const visit = (value: any) => {
    if (!Array.isArray(value)) return;
    if (typeof value[0] === "number" && typeof value[1] === "number") {
      positions.push([value[0], value[1]]);
      return;
    }
    value.forEach(visit);
  };

  geojson.features.forEach((feature) => visit(feature.geometry.coordinates));
  if (positions.length === 0) return null;

  const lons = positions.map((item) => item[0]);
  const lats = positions.map((item) => item[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  return (longitude: number, latitude: number) => ({
    x: mapPadding + ((longitude - minLon) / (maxLon - minLon)) * (mapWidth - mapPadding * 2),
    y: mapPadding + ((maxLat - latitude) / (maxLat - minLat)) * (mapHeight - mapPadding * 2)
  });
};

const centroidByAlcaldia = alcaldiasSeed.reduce<Record<string, { lat: number; lon: number }>>((acc, item) => {
  acc[item.name] = item.centroid;
  return acc;
}, {});

const sheetRows = (workbook: xlsx.WorkBook, name: string) =>
  xlsx.utils.sheet_to_json<WorkbookRow>(workbook.Sheets[name], { defval: "", raw: true });

const chooseBestTerritorialRow = (
  baseRow: WorkbookRow,
  hoja2Row: WorkbookRow | undefined,
  territorialRows: TerritorialAttributes[]
) => {
  const baseAlcaldia = normalizeMatchKey(baseRow.ALCALDIA);
  const baseName = normalizeMatchKey(baseRow["UBICACION / NOMBRE"]);
  const baseDomicilio = normalizeMatchKey(baseRow.DOMICILIO);
  const hoja2Name = normalizeMatchKey(hoja2Row?.["UBICACION / NOMBRE"]);
  const hoja2Domicilio = normalizeMatchKey(hoja2Row?.DOMICILIO);

  const candidates = territorialRows.filter((row) => {
    const rowAlcaldia = normalizeMatchKey(row.alcaldia);
    return rowAlcaldia === baseAlcaldia;
  });

  const exactByDomicilio = candidates.find((row) => normalizeMatchKey(row.domicilio) === baseDomicilio);
  if (exactByDomicilio) return exactByDomicilio;

  const exactByName = candidates.find((row) => normalizeMatchKey(row.name) === baseName);
  if (exactByName) return exactByName;

  const hoja2ByDomicilio = hoja2Domicilio
    ? candidates.find((row) => normalizeMatchKey(row.domicilio) === hoja2Domicilio)
    : null;
  if (hoja2ByDomicilio) return hoja2ByDomicilio;

  const hoja2ByName = hoja2Name
    ? candidates.find((row) => normalizeMatchKey(row.name) === hoja2Name)
    : null;
  if (hoja2ByName) return hoja2ByName;

  const partial = candidates.find((row) => {
    const rowName = normalizeMatchKey(row.name);
    const rowDomicilio = normalizeMatchKey(row.domicilio);
    return (
      (baseName.length > 8 && rowName.length > 8 && (baseName.includes(rowName) || rowName.includes(baseName))) ||
      (baseDomicilio.length > 12 && rowDomicilio.length > 12 && (baseDomicilio.includes(rowDomicilio) || rowDomicilio.includes(baseDomicilio)))
    );
  });

  return partial ?? null;
};

const enrichPilaresCatalog = (rows: WorkbookRow[]) => {
  const entries = rows.map((row) => {
    const normalized = normalizeAlcaldia(String(row["ALCALDÍA"] ?? ""));
    return {
      officialName: sanitizeText(row["NOMBRE OFICIAL PILARES"]),
      officialNameKey: normalizeMatchKey(row["NOMBRE OFICIAL PILARES"]),
      alcaldia: normalized.alcaldia,
      responsibleName: sanitizeMeaningfulText(row.Nombre),
      contact: sanitizeText(row.CONTACTO),
      email: sanitizeText(row.CORREO),
      schedule: sanitizeText(row.HORARIO)
    };
  });

  const match = (rawName: string | null | undefined, alcaldia: string | null | undefined): PilaresCatalogMatch => {
    const key = normalizeMatchKey(rawName);
    if (!key) {
      return {
        officialName: null,
        responsibleName: null,
        contact: null,
        email: null,
        schedule: null,
        alcaldia: null
      };
    }

    const exact = entries.find((entry) => entry.officialNameKey === key);
    if (exact) {
      return {
        officialName: exact.officialName,
        responsibleName: exact.responsibleName,
        contact: exact.contact,
        email: exact.email,
        schedule: exact.schedule,
        alcaldia: exact.alcaldia
      };
    }

    const candidates = entries.filter((entry) => {
      const sameAlcaldia = alcaldia ? entry.alcaldia === alcaldia : true;
      return sameAlcaldia && key.length >= 5 && (entry.officialNameKey.includes(key) || key.includes(entry.officialNameKey));
    });

    if (candidates.length === 1) {
      const candidate = candidates[0];
      return {
        officialName: candidate.officialName,
        responsibleName: candidate.responsibleName,
        contact: candidate.contact,
        email: candidate.email,
        schedule: candidate.schedule,
        alcaldia: candidate.alcaldia
      };
    }

    return {
      officialName: null,
      responsibleName: null,
      contact: null,
      email: null,
      schedule: null,
      alcaldia: null
    };
  };

  return { match };
};

const buildPilaresCoordinateMatcher = () => {
  const layer = buildOfficialInfrastructureLayer();
  const pilares = layer.details
    .filter((item) => item.infrastructureType === "PILARES" && item.latitude !== null && item.longitude !== null)
    .map((item) => ({
      name: item.spaceName,
      nameKey: normalizeMatchKey(item.spaceName),
      alcaldia: item.alcaldia,
      latitude: item.latitude!,
      longitude: item.longitude!
    }));

  return (rawName: string | null | undefined, alcaldia: string) => {
    const key = normalizeMatchKey(rawName);
    if (!key) return null;

    const exact = pilares.find((item) => item.alcaldia === alcaldia && item.nameKey === key);
    if (exact) return exact;

    const partial = pilares.find(
      (item) =>
        item.alcaldia === alcaldia &&
        key.length >= 4 &&
        (item.nameKey.includes(key) || key.includes(item.nameKey))
    );
    if (partial) return partial;

    return pilares.find((item) => key.length >= 4 && (item.nameKey.includes(key) || key.includes(item.nameKey))) ?? null;
  };
};

const buildTerritorialRows = (rows: WorkbookRow[], sheet: string) =>
  rows.map((row) => ({
    sheet,
    alcaldia: sanitizeText(row.ALCALDIA),
    name: sanitizeText(row["UBICACION / NOMBRE"]),
    domicilio: sanitizeText(row.DOMICILIO),
    tipoCancha: sanitizeText(row.TIPO_1 ?? row.TIPO),
    material: sanitizeText(row.MATERIAL),
    origen: sanitizeText(row.ORIGEN ?? row.TIPO),
    mapsLink: sanitizeText(row["ENLACE MAPS"] ?? row.mapa),
    latitude: parseNumber(row.POINT_Y),
    longitude: parseNumber(row.POINT_X),
    territorialStatus: sanitizeText(row.ESTATUS),
    territorialAdvance: sanitizeText(row["PORCENTAJE DE OBRA"] ?? row.avance),
    observations: sanitizeText(row["OBSERVACIONES_1"] ?? row.OBSERVACIONES)
  }));

const buildSummaryByAlcaldia = (records: CanchaOperationalRecord[]): CanchasSummaryRecord[] => {
  const grouped = new Map<string, CanchaOperationalRecord[]>();
  records.forEach((record) => {
    grouped.set(record.alcaldia, [...(grouped.get(record.alcaldia) ?? []), record]);
  });

  return Array.from(grouped.entries())
    .map(([alcaldia, items]) => ({
      alcaldia,
      total: items.length,
      inauguradas: items.filter((item) => item.inaugurationStatus === "inaugurada").length,
      proximas: items.filter((item) => item.inaugurationStatus === "proxima").length,
      pendientes: items.filter((item) => item.operationalStatus === "pendiente").length,
      completas: items.filter((item) => item.operationalStatus === "completa").length,
      conHorario: items.filter((item) => item.hasSchedule).length,
      conFiguraEducativa: items.filter((item) => item.hasFigureEducativa).length,
      conActividades: items.filter((item) => item.hasActivities).length,
      conCoordenadas: items.filter((item) => item.hasCoordinates).length,
      source: `Excel operativo 500 Canchas (${workbookRelativePath})`,
      dataType: "insight" as const,
      methodologicalNote:
        "Resumen agregado de una base operativa real. Los estatus de inauguración y completitud se derivan de la información capturada en el Excel, no de una capa poblacional."
    }))
    .sort((a, b) => b.total - a.total);
};

export const buildCanchasOperativasLayer = (): CanchasOperationalLayer => {
  if (!fs.existsSync(workbookPath)) {
    return {
      meta: {
        generatedAt: new Date().toISOString(),
        workbookPath: workbookRelativePath,
        sourceSheets: [],
        integratedRecords: 0,
        recordsWithCoordinates: 0,
        recordsWithoutCoordinates: 0,
        pilaresCatalogMatches: 0
      },
      records: [],
      summaryByAlcaldia: []
    };
  }

  const workbook = xlsx.readFile(workbookPath, { cellDates: false });
  const baseRows = sheetRows(workbook, "Base");
  const hoja2Rows = sheetRows(workbook, "Hoja 2");
  const alcDicRows = sheetRows(workbook, "Alc Dic");
  const alcFebRows = sheetRows(workbook, "AlcFeb");
  const pilaresCatalogRows = sheetRows(workbook, "Hoja 1");
  const projectPoint = buildMapProjector();
  const territorialRows = [...buildTerritorialRows(alcDicRows, "Alc Dic"), ...buildTerritorialRows(alcFebRows, "AlcFeb")];
  const hoja2ByConsecutive = new Map<number, WorkbookRow>();
  hoja2Rows.forEach((row) => {
    const consecutive = parseNumber(row["NO. CONSECUTIVO"]);
    if (consecutive) hoja2ByConsecutive.set(consecutive, row);
  });
  const pilaresCatalog = enrichPilaresCatalog(pilaresCatalogRows);
  const matchPilaresCoordinates = buildPilaresCoordinateMatcher();

  let pilaresCatalogMatches = 0;

  const records = baseRows.map((row, index) => {
    const consecutiveNumber = parseNumber(row["NO. CONSECUTIVO"]) ?? index + 1;
    const normalizedAlcaldia = normalizeAlcaldia(String(row.ALCALDIA ?? ""));
    const hoja2Row = hoja2ByConsecutive.get(consecutiveNumber);
    const territorialRow = chooseBestTerritorialRow(row, hoja2Row, territorialRows);
    const inauguration = parseInaugurationDate(row["FECHA DE INAUGURACION"]);
    const nombreFiguraEducativa = sanitizeMeaningfulText(row["NOMBRE DEL LCPO\n(118 EN TOTAL)"]);
    const tipoFiguraEducativa = nombreFiguraEducativa ? "LCPO" : null;
    const telefonoFiguraEducativa = sanitizeMeaningfulText(row["NÚMERO TELEFÓNICO DEL LCPO"]);
    const tienePromotorFutbolRaw = normalizeText(row["CUENTA CON PROMOTOR DEPORTIVO DE FUTBOL (SI O NO)"]);
    const tienePromotorFutbol =
      tienePromotorFutbolRaw.startsWith("si")
        ? "si"
        : tienePromotorFutbolRaw.startsWith("no")
          ? "no"
          : "sin_dato";
    const mallaHorariaFutbol = tienePromotorFutbol === "si"
      ? sanitizeMeaningfulText(row["SI LA RESPUESTA FUE SI, CUAL ES SU MALLA HORARIA"])
      : null;
    const schedule = sanitizeMeaningfulText(row["HORARIO "]);
    const mallaHorariaDisciplinas = sanitizeMeaningfulText(row["MALLA HORARIA DE ESAS DISCIPLINAS"]);
    const activities = splitList(row.ACTIVIDADES);
    const disciplinas = splitList(row["QUE OTRAS DISCIPLINAS SE IMPARTEN AHI"]);
    const promoterCount = parsePromoterCount(row["cantidad de promotores de otras disciplinas que imparten clases ahi"]);
    const pilaresAssignedRaw = sanitizeMeaningfulText(row["PILARES MÁS CERCANO ASIGNADO"]);
    const nearestPilares1 = sanitizeMeaningfulText(hoja2Row?.["1er PILAR MÁS CERCANO ASIGNADO"]);
    const nearestPilares2 = sanitizeMeaningfulText(hoja2Row?.["2do PILAR MÁS CERCANO"]);
    const assignedPilaresMatch = pilaresCatalog.match(pilaresAssignedRaw, normalizedAlcaldia.alcaldia);
    if (assignedPilaresMatch.officialName) pilaresCatalogMatches += 1;
    const pilaresCoordinateMatch = matchPilaresCoordinates(
      assignedPilaresMatch.officialName ?? nearestPilares1 ?? pilaresAssignedRaw,
      normalizedAlcaldia.alcaldia
    );

    let latitude = territorialRow?.latitude ?? null;
    let longitude = territorialRow?.longitude ?? null;
    let geolocationType: CanchaGeolocationType = "sin_coordenada";
    let geolocationLabel = "Sin coordenada";
    let geolocationSource = "Sin coordenadas utilizables en las hojas integradas";

    if (latitude !== null && longitude !== null) {
      geolocationType = "real";
      geolocationLabel = "Coordenada real";
      geolocationSource = territorialRow?.sheet
        ? `Coordenada territorial integrada desde ${territorialRow.sheet}`
        : "Coordenada territorial integrada desde hoja operativa";
    } else if (pilaresCoordinateMatch) {
      latitude = pilaresCoordinateMatch.latitude;
      longitude = pilaresCoordinateMatch.longitude;
      geolocationType = "aproximada_pilares";
      geolocationLabel = "Aproximada por PILARES";
      geolocationSource = `Herencia aproximada desde PILARES asignado o cercano: ${pilaresCoordinateMatch.name}`;
    } else {
      const centroid = centroidByAlcaldia[normalizedAlcaldia.alcaldia];
      if (centroid) {
        latitude = centroid.lat;
        longitude = centroid.lon;
        geolocationType = "aproximada_alcaldia";
        geolocationLabel = "Aproximada por alcaldía";
        geolocationSource = `Fallback al centroide territorial de ${normalizedAlcaldia.alcaldia}`;
      }
    }

    const projectedPoint = latitude !== null && longitude !== null && projectPoint ? projectPoint(longitude, latitude) : null;

    const completionSignals = [
      inauguration.hasDateSignal,
      Boolean(nombreFiguraEducativa),
      Boolean(telefonoFiguraEducativa),
      Boolean(schedule),
      activities.length > 0
    ];
    const completionScore = completionSignals.filter(Boolean).length;
    const operationalStatus =
      completionScore >= 5
        ? "completa"
        : completionScore >= 4
          ? "lista_para_operar"
          : completionScore >= 2
          ? "parcial"
          : "pendiente";

    const sourceSheets = ["Base"];
    if (hoja2Row) sourceSheets.push("Hoja 2");
    if (territorialRow?.sheet) sourceSheets.push(territorialRow.sheet);
    if (assignedPilaresMatch.officialName) sourceSheets.push("Hoja 1");

    return {
      id: `cancha-${String(consecutiveNumber).padStart(3, "0")}`,
      consecutiveNumber,
      year: 2026,
      alcaldia: normalizedAlcaldia.alcaldia,
      geoKey: normalizedAlcaldia.geoKey,
      name: sanitizeText(row["UBICACION / NOMBRE"]) ?? `Cancha ${consecutiveNumber}`,
      domicilio: sanitizeText(row.DOMICILIO) ?? "",
      tipoCancha: territorialRow?.tipoCancha ?? sanitizeText(hoja2Row?.TIPO_1) ?? sanitizeText(hoja2Row?.TIPO),
      material: territorialRow?.material ?? null,
      origen: territorialRow?.origen ?? null,
      latitude,
      longitude,
      projectedPoint,
      geolocationType,
      geolocationLabel,
      geolocationSource,
      mapsLink: territorialRow?.mapsLink ?? sanitizeText(hoja2Row?.mapa),
      pilaresAssigned: pilaresAssignedRaw,
      assignedPilaresOfficialName: assignedPilaresMatch.officialName,
      assignedPilaresResponsibleName: assignedPilaresMatch.responsibleName,
      assignedPilaresContact: assignedPilaresMatch.contact,
      assignedPilaresEmail: assignedPilaresMatch.email,
      assignedPilaresSchedule: assignedPilaresMatch.schedule,
      assignedPilaresAlcaldia: assignedPilaresMatch.alcaldia,
      nearestPilares1,
      distanceToPilares1: parseNumber(hoja2Row?.["DISTANCIA 1er PILAR (m)"]),
      nearestPilares2,
      distanceToPilares2: parseNumber(hoja2Row?.["DISTANCIA 2do PILAR (m)"]),
      territorialStatus: territorialRow?.territorialStatus ?? null,
      territorialAdvance: territorialRow?.territorialAdvance ?? null,
      territorialSourceSheet: territorialRow?.sheet ?? null,
      nombreFiguraEducativa,
      tipoFiguraEducativa,
      telefonoFiguraEducativa,
      inaugurationDateRaw: inauguration.raw,
      inaugurationDateIso: inauguration.iso,
      inaugurationStatus: inauguration.status,
      tienePromotorFutbol,
      mallaHorariaFutbol,
      schedule,
      mallaHorariaDisciplinas,
      disciplinas,
      activities,
      promoterCount,
      observations: sanitizeText(row.OBSERVACIONES) ?? territorialRow?.observations ?? null,
      operationalStatus,
      hasFigureEducativa: Boolean(nombreFiguraEducativa),
      hasPhone: Boolean(telefonoFiguraEducativa),
      hasSchedule: Boolean(schedule),
      hasActivities: activities.length > 0,
      hasCoordinates: geolocationType === "real",
      sourceSheets: Array.from(new Set(sourceSheets)),
      source: `Excel operativo 500 Canchas (${workbookRelativePath})`,
      dataType: "real",
      methodologicalNote:
        "Base operativa real consolidada desde múltiples hojas del Excel. Base prioriza operación administrativa; Alc Dic, AlcFeb y Hoja 2 complementan atributos territoriales y geolocalización; Hoja 1 enriquece datos institucionales de PILARES cuando el match es posible. PILARES asignado se conserva separado del PILARES cercano territorial.",
      statusDerivedNote:
        `Estatus ${operationalStatus.replace(/_/g, " ")} derivado por ${completionScore}/5 señales presentes: fecha ${completionSignals[0] ? "sí" : "no"}, figura educativa ${completionSignals[1] ? "sí" : "no"}, teléfono ${completionSignals[2] ? "sí" : "no"}, horario general ${completionSignals[3] ? "sí" : "no"}, actividades ${completionSignals[4] ? "sí" : "no"}.`,
      inaugurationDerivedNote:
        inauguration.status === "inaugurada"
          ? "Marcada como inaugurada por fecha válida pasada o señal textual explícita de inauguración."
          : inauguration.status === "proxima"
            ? "Marcada como próxima por fecha futura o texto tentativo / por inaugurar."
            : "Marcada sin fecha porque no se encontró fecha usable ni señal textual suficiente.",
      dataQualityLabel:
        completionScore >= 4 && geolocationType === "real"
          ? "alta"
          : completionScore >= 2 || geolocationType !== "sin_coordenada"
            ? "media"
            : "baja"
    } satisfies CanchaOperationalRecord;
  });

  const summaryByAlcaldia = buildSummaryByAlcaldia(records);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      workbookPath: workbookRelativePath,
      sourceSheets: [
        { sheet: "Base", rows: baseRows.length, purpose: "Operación administrativa principal" },
        { sheet: "Hoja 2", rows: hoja2Rows.length, purpose: "PILARES cercanos, distancias y avance" },
        { sheet: "Alc Dic", rows: alcDicRows.length, purpose: "Tipo, material, origen, coordenadas y estatus territorial" },
        { sheet: "AlcFeb", rows: alcFebRows.length, purpose: "Complemento territorial con coordenadas y atributos de cancha" },
        { sheet: "Hoja 1", rows: pilaresCatalogRows.length, purpose: "Catálogo institucional PILARES para enriquecimiento" }
      ],
      integratedRecords: records.length,
      recordsWithCoordinates: records.filter((record) => record.hasCoordinates).length,
      recordsWithoutCoordinates: records.filter((record) => !record.hasCoordinates).length,
      pilaresCatalogMatches
    },
    records,
    summaryByAlcaldia
  };
};
