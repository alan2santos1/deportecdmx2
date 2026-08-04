import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import type {
  CanchaAdministrativeStatus,
  CanchaDocumentationStatus,
  CanchaEvidenceRecord,
  CanchaGeolocationType,
  CanchaOperationalRecord,
  CanchaOpeningStatus,
  CanchaReconciliationConfidence,
  CanchaReconciliationMethod,
  CanchaStatusHistoryEntry,
  CanchaWorkStatus,
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

const workbookCandidates = [
  "docs/fuentes-operativas/13-03-2026-Proyecto_500_canchas_PILARES_ASIGNADO 315 mallas arquitecto.xlsx",
  "docs/13-03-2026-Proyecto_500_canchas_PILARES_ASIGNADO 315 mallas arquitecto.xlsx"
];
const resolveWorkbookPath = () => {
  for (const relativePath of workbookCandidates) {
    const absolutePath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(absolutePath)) {
      return { relativePath, absolutePath };
    }
  }
  throw new Error(`No se encontró el Excel operativo de Canchas en: ${workbookCandidates.join(" | ")}`);
};
const workbookSource = resolveWorkbookPath();
const workbookRelativePath = workbookSource.relativePath;
const workbookPath = workbookSource.absolutePath;
const manualEvidencePath = path.join(process.cwd(), "data", "raw", "manual", "canchas-evidencias-oficiales.json");
const mapGeometryPath = path.join(process.cwd(), "data", "raw", "external", "alcaldias.geojson");
const mapWidth = 900;
const mapHeight = 660;
const mapPadding = 24;
const canchasCalculationVersion = "d1.1-canchas-reconciliacion-2026-08-03";

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

const parseAdministrativeOpeningSignal = (rawValue: string | number | null | undefined) => {
  const buildResponse = (
    raw: string | null,
    iso: string | null,
    hasDateSignal: boolean,
    signal: "past" | "future" | "unknown",
    note: string
  ) => ({ raw, iso, hasDateSignal, signal, note });
  const raw = sanitizeText(rawValue);
  if (!raw) {
    return buildResponse(null, null, false, "unknown", "Sin fecha administrativa utilizable.");
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
    const today = new Date("2026-08-03T00:00:00.000Z");
    return buildResponse(
      raw,
      iso,
      true,
      date.getTime() <= today.getTime() ? "past" : "future",
      date.getTime() <= today.getTime()
        ? "La fecha administrativa cargada ya pasó al corte actual."
        : "La fecha administrativa cargada es futura al corte actual."
    );
  }

  if (isPastKeyword(normalized)) {
    return buildResponse(raw, null, true, "past", "El texto administrativo sugiere que hubo apertura o uso, pero no equivale a confirmación pública.");
  }

  if (isFutureKeyword(normalized)) {
    return buildResponse(raw, null, true, "future", "El texto administrativo sugiere entrega o apertura futura/tentativa.");
  }

  return buildResponse(raw, null, false, "unknown", "No se encontró fecha administrativa ni señal textual concluyente.");
};

const loadManualEvidence = (): CanchaEvidenceRecord[] => {
  if (!fs.existsSync(manualEvidencePath)) return [];
  const payload = JSON.parse(fs.readFileSync(manualEvidencePath, "utf-8")) as
    | CanchaEvidenceRecord[]
    | { evidences?: CanchaEvidenceRecord[] };
  return Array.isArray(payload) ? payload : payload.evidences ?? [];
};

const normalizeEvidenceStatus = (status: string) => normalizeText(status);

const buildStatusHistoryEntry = (
  statusType: CanchaStatusHistoryEntry["statusType"],
  newValue: string,
  changedAt: string,
  method: string,
  evidenceId: string | null,
  effectiveDate: string | null
): CanchaStatusHistoryEntry => ({
  statusType,
  previousValue: null,
  newValue,
  effectiveDate,
  evidenceId,
  method,
  changedAt,
  calculationVersion: canchasCalculationVersion
});

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

const buildEvidenceMatch = (
  evidence: CanchaEvidenceRecord,
  context: {
    name: string;
    domicilio: string;
    alcaldia: string;
    latitude: number | null;
    longitude: number | null;
    consecutiveNumber: number;
  }
): { method: CanchaReconciliationMethod; confidence: CanchaReconciliationConfidence; notes: string } => {
  const evidenceVenueKey = normalizeMatchKey(evidence.venueName);
  const evidenceAddressKey = normalizeMatchKey(evidence.addressText);
  const recordNameKey = normalizeMatchKey(context.name);
  const recordAddressKey = normalizeMatchKey(context.domicilio);
  const evidenceOfficialNumber = normalizeMatchKey(evidence.officialCourtNumber);
  const recordOfficialNumber = normalizeMatchKey(context.consecutiveNumber);
  const sameAlcaldia =
    !evidence.alcaldia || normalizeMatchKey(evidence.alcaldia) === normalizeMatchKey(context.alcaldia);

  if (evidenceOfficialNumber && evidenceOfficialNumber === recordOfficialNumber) {
    return { method: "exact_official_number", confidence: "alta", notes: "Coincidencia exacta por número oficial." };
  }

  if (
    evidence.coordinates &&
    context.latitude !== null &&
    context.longitude !== null &&
    Math.abs(evidence.coordinates.lat - context.latitude) < 0.0002 &&
    Math.abs(evidence.coordinates.lon - context.longitude) < 0.0002
  ) {
    return { method: "exact_coordinates", confidence: "alta", notes: "Coincidencia exacta por coordenadas documentadas." };
  }

  if (sameAlcaldia && evidenceVenueKey && evidenceAddressKey && evidenceVenueKey === recordNameKey && evidenceAddressKey === recordAddressKey) {
    return { method: "exact_name_address", confidence: "alta", notes: "Coincidencia exacta por nombre y domicilio." };
  }

  if (sameAlcaldia && evidenceVenueKey && evidenceVenueKey === recordNameKey) {
    return { method: "probable_name_alcaldia", confidence: "media", notes: "Coincidencia probable por nombre y alcaldía." };
  }

  if (
    sameAlcaldia &&
    evidenceAddressKey &&
    recordAddressKey &&
    evidenceAddressKey.length > 10 &&
    (evidenceAddressKey.includes(recordAddressKey) || recordAddressKey.includes(evidenceAddressKey))
  ) {
    return { method: "probable_address", confidence: "media", notes: "Coincidencia probable por domicilio." };
  }

  return { method: "unmatched", confidence: "sin_match", notes: "Sin coincidencia defendible con la evidencia oficial." };
};

const deriveAdministrativeStatus = (params: {
  domicilio: string;
  hasAdministrativeDateSignal: boolean;
  hasAssignedPilares: boolean;
  geolocationType: CanchaGeolocationType;
  territorialConflict: boolean;
}): { status: CanchaAdministrativeStatus; note: string } => {
  if (params.territorialConflict) {
    return {
      status: "requiere_revision",
      note: "El registro contiene señales administrativas o territoriales conflictivas y requiere revisión humana."
    };
  }
  if (!params.domicilio || (!params.hasAdministrativeDateSignal && !params.hasAssignedPilares)) {
    return {
      status: "incompleta",
      note: "El expediente administrativo carece de piezas básicas visibles para seguimiento."
    };
  }
  return {
    status: "registrada",
    note: params.geolocationType === "sin_coordenada"
      ? "Registro administrativo presente, aunque sin georreferencia utilizable."
      : "Registro administrativo presente con trazabilidad territorial básica."
  };
};

const deriveDocumentationStatus = (signals: boolean[]): { status: CanchaDocumentationStatus; score: number; note: string } => {
  const score = signals.filter(Boolean).length;
  const status: CanchaDocumentationStatus = score >= 4 ? "completa" : score >= 2 ? "parcial" : "minima";
  return {
    status,
    score,
    note: `Completitud documental ${status} derivada por ${score}/5 señales: fecha administrativa, contacto operativo, horario, actividades y vínculo institucional.`
  };
};

const buildSummaryByAlcaldia = (records: CanchaOperationalRecord[]): CanchasSummaryRecord[] => {
  const grouped = new Map<string, CanchaOperationalRecord[]>();
  records.forEach((record) => {
    grouped.set(record.alcaldia, [...(grouped.get(record.alcaldia) ?? []), record]);
  });

  return Array.from(grouped.entries())
    .map(([alcaldia, items]) => ({
      alcaldia,
      total: items.length,
      inauguradasConfirmadas: items.filter((item) => item.openingStatus === "inaugurada_confirmada").length,
      probables: items.filter((item) => item.openingStatus === "probable").length,
      sinConfirmacionPublica: items.filter((item) => item.openingStatus === "sin_confirmacion_publica").length,
      contradicciones: items.filter((item) => item.openingStatus === "contradiccion" || item.workStatus === "contradiccion").length,
      requiereRevision: items.filter((item) => item.administrativeStatus === "requiere_revision").length,
      documentacionCompleta: items.filter((item) => item.documentationStatus === "completa").length,
      documentacionMinima: items.filter((item) => item.documentationStatus === "minima").length,
      entregadasConfirmadas: items.filter((item) => item.workStatus === "entregada_confirmada" || item.workStatus === "lista_confirmada").length,
      conHorario: items.filter((item) => item.hasSchedule).length,
      conPromotor: items.filter((item) => item.tienePromotorFutbol === "si").length,
      conActividades: items.filter((item) => item.hasActivities).length,
      coordenadaReal: items.filter((item) => item.geolocationType === "real").length,
      coordenadaAproximada: items.filter((item) => item.geolocationType === "aproximada_pilares" || item.geolocationType === "aproximada_alcaldia").length,
      source: `Excel operativo 500 Canchas (${workbookRelativePath})`,
      dataType: "insight" as const,
      methodologicalNote:
        "Resumen agregado de una base operativa real. La apertura, entrega u obra solo se marcan como confirmadas cuando existe evidencia oficial conciliada individualmente."
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
  const evidences = loadManualEvidence();
  const generatedAt = new Date().toISOString();

  let pilaresCatalogMatches = 0;

  const records = baseRows.map((row, index) => {
    const consecutiveNumber = parseNumber(row["NO. CONSECUTIVO"]) ?? index + 1;
    const normalizedAlcaldia = normalizeAlcaldia(String(row.ALCALDIA ?? ""));
    const hoja2Row = hoja2ByConsecutive.get(consecutiveNumber);
    const territorialRow = chooseBestTerritorialRow(row, hoja2Row, territorialRows);
    const administrativeOpening = parseAdministrativeOpeningSignal(row["FECHA DE INAUGURACION"]);
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

    const documentation = deriveDocumentationStatus([
      administrativeOpening.hasDateSignal,
      Boolean(telefonoFiguraEducativa || assignedPilaresMatch.contact || assignedPilaresMatch.email),
      Boolean(schedule || mallaHorariaFutbol || mallaHorariaDisciplinas),
      activities.length > 0,
      Boolean(assignedPilaresMatch.officialName || pilaresAssignedRaw)
    ]);
    const territorialConflict = /sigue en obra|en obra/.test(normalizeText(territorialRow?.territorialStatus)) && administrativeOpening.signal === "past";
    const administrative = deriveAdministrativeStatus({
      domicilio: sanitizeText(row.DOMICILIO) ?? "",
      hasAdministrativeDateSignal: administrativeOpening.hasDateSignal,
      hasAssignedPilares: Boolean(assignedPilaresMatch.officialName || pilaresAssignedRaw),
      geolocationType,
      territorialConflict
    });

    const evidenceMatches = evidences
      .map((evidence) => ({
        evidence,
        ...buildEvidenceMatch(evidence, {
          name: sanitizeText(row["UBICACION / NOMBRE"]) ?? `Cancha ${consecutiveNumber}`,
          domicilio: sanitizeText(row.DOMICILIO) ?? "",
          alcaldia: normalizedAlcaldia.alcaldia,
          latitude,
          longitude,
          consecutiveNumber
        })
      }))
      .filter((item) => item.method !== "unmatched");

    const bestMatch =
      evidenceMatches.find((item) => item.confidence === "alta") ??
      evidenceMatches.find((item) => item.confidence === "media") ??
      evidenceMatches.find((item) => item.confidence === "baja") ??
      null;

    const matchedEvidenceIds = evidenceMatches.map((item) => item.evidence.evidenceId);
    const hasOfficialEvidence = matchedEvidenceIds.length > 0;
    const matchMethod: CanchaReconciliationMethod = bestMatch?.method ?? "unmatched";
    const matchConfidence: CanchaReconciliationConfidence = bestMatch?.confidence ?? "sin_match";

    let workStatus: CanchaWorkStatus = "sin_confirmacion";
    let openingStatus: CanchaOpeningStatus = "sin_confirmacion_publica";
    let workStatusNote = "Sin evidencia oficial individual conciliada sobre avance de obra, entrega o lista.";
    let openingStatusNote = "Sin evidencia oficial individual conciliada de inauguración o apertura pública.";

    if (territorialConflict || evidenceMatches.some((item) => normalizeEvidenceStatus(item.evidence.reportedStatus).includes("contradic"))) {
      workStatus = "contradiccion";
      openingStatus = "contradiccion";
      workStatusNote = "Se detectaron señales contradictorias entre expediente administrativo y evidencia conciliada.";
      openingStatusNote = "Se detectaron señales contradictorias entre expediente administrativo y evidencia conciliada.";
    } else if (bestMatch) {
      const normalizedReportedStatus = normalizeEvidenceStatus(bestMatch.evidence.reportedStatus);
      if (bestMatch.confidence === "alta") {
        if (normalizedReportedStatus.includes("inaugur")) {
          openingStatus = "inaugurada_confirmada";
          openingStatusNote = `Apertura confirmada por evidencia oficial conciliada (${bestMatch.evidence.evidenceId}).`;
        }
        if (normalizedReportedStatus.includes("entreg")) {
          workStatus = "entregada_confirmada";
          workStatusNote = `Entrega confirmada por evidencia oficial conciliada (${bestMatch.evidence.evidenceId}).`;
        } else if (normalizedReportedStatus.includes("lista")) {
          workStatus = "lista_confirmada";
          workStatusNote = `Registro reportado como listo en evidencia oficial conciliada (${bestMatch.evidence.evidenceId}).`;
        } else if (normalizedReportedStatus.includes("intervencion") || normalizedReportedStatus.includes("obra") || normalizedReportedStatus.includes("avance")) {
          workStatus = "intervencion_confirmada";
          workStatusNote = `Intervención confirmada por evidencia oficial conciliada (${bestMatch.evidence.evidenceId}).`;
        }
      } else if (bestMatch.confidence === "media") {
        openingStatus = "probable";
        openingStatusNote = `Existe coincidencia probable con evidencia oficial (${bestMatch.evidence.evidenceId}), pero no se publica como confirmación individual.`;
        workStatusNote = `Existe coincidencia probable con evidencia oficial (${bestMatch.evidence.evidenceId}), insuficiente para confirmar obra o entrega.`;
      }
    }

    const reconciliationNotes = bestMatch
      ? `${bestMatch.notes} Evidencias asociadas: ${matchedEvidenceIds.join(", ")}.`
      : "Sin evidencia oficial individual conciliada. Los anuncios agregados del programa no acreditan por sí solos el estado de este registro.";

    const statusHistory: CanchaStatusHistoryEntry[] = [
      buildStatusHistoryEntry("administrativeStatus", administrative.status, generatedAt, "excel_admin_rule", null, null),
      buildStatusHistoryEntry("documentationStatus", documentation.status, generatedAt, "excel_documentation_rule", null, null),
      buildStatusHistoryEntry("workStatus", workStatus, generatedAt, bestMatch ? matchMethod : "no_official_evidence", bestMatch?.evidence.evidenceId ?? null, bestMatch?.evidence.publicationDate ?? null),
      buildStatusHistoryEntry("openingStatus", openingStatus, generatedAt, bestMatch ? matchMethod : "no_official_evidence", bestMatch?.evidence.evidenceId ?? null, bestMatch?.evidence.publicationDate ?? null)
    ];

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
      inaugurationDateRaw: administrativeOpening.raw,
      inaugurationDateIso: administrativeOpening.iso,
      tienePromotorFutbol,
      mallaHorariaFutbol,
      schedule,
      mallaHorariaDisciplinas,
      disciplinas,
      activities,
      promoterCount,
      observations: sanitizeText(row.OBSERVACIONES) ?? territorialRow?.observations ?? null,
      administrativeStatus: administrative.status,
      documentationStatus: documentation.status,
      workStatus,
      openingStatus,
      matchMethod,
      matchConfidence,
      matchedEvidenceIds,
      hasOfficialEvidence,
      lastVerifiedAt: hasOfficialEvidence ? generatedAt : null,
      reconciliationNotes,
      statusHistory,
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
      administrativeStatusNote: administrative.note,
      documentationStatusNote: documentation.note,
      workStatusNote,
      openingStatusNote,
      dataQualityLabel:
        documentation.score >= 4 && geolocationType === "real"
          ? "alta"
          : documentation.score >= 2 || geolocationType !== "sin_coordenada"
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
