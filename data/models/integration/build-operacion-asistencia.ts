import path from "path";
import xlsx from "xlsx";
import type {
  AttendanceCaptureRule,
  OperationChannel,
  OperationClassGroupRecord,
  OperationRolePermission,
  OperationRouteProposal,
  OperationScheduleSlot,
  OperationStaffRecord,
  OperationStudentRecord,
  OperationVenueRecord,
  OperationalModuleDataset,
  StaffFigure
} from "../../../lib/operations-types";
import { normalizeAlcaldia } from "./normalize-alcaldia";

type WorkbookRow = Record<string, string | number | null | undefined>;

const pontePilaRelativePath = "docs/MALLA HORARIA PUNTOS PONTE PILA 2026.xlsx";
const acumuladaRelativePath = "docs/ACUMULADA PILARES ABRIL 26 GDE.xlsx";

const pontePilaPath = path.join(process.cwd(), pontePilaRelativePath);
const acumuladaPath = path.join(process.cwd(), acumuladaRelativePath);

const pontePilaSheet = "MALLA MAY 2026";
const acumuladaSheet = "abril";

const scheduleColumns: Array<{
  key: string;
  day: OperationScheduleSlot["day"];
}> = [
  { key: "LUNES", day: "lunes" },
  { key: "MARTES", day: "martes" },
  { key: "MIERCOLES", day: "miercoles" },
  { key: "MIÉRCOLES", day: "miercoles" },
  { key: "JUEVES", day: "jueves" },
  { key: "VIERNES", day: "viernes" },
  { key: "SABADO", day: "sabado" },
  { key: "SÁBADO", day: "sabado" },
  { key: "DOMINGO", day: "domingo" }
];

const normalizeText = (value: string | number | null | undefined) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const sanitizeText = (value: string | number | null | undefined) => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
};

const alcaldiaCodeMap: Record<string, string> = {
  AOA: "Álvaro Obregón",
  AOB: "Álvaro Obregón",
  AZC: "Azcapotzalco",
  BEJ: "Benito Juárez",
  COY: "Coyoacán",
  CUH: "Cuauhtémoc",
  CUM: "Cuajimalpa de Morelos",
  GAM: "Gustavo A. Madero",
  GCT: "Gustavo A. Madero",
  GCU: "Gustavo A. Madero",
  IZP: "Iztapalapa",
  IZT: "Iztacalco",
  MAC: "La Magdalena Contreras",
  MIA: "Milpa Alta",
  MIH: "Miguel Hidalgo",
  THA: "Tláhuac",
  TLH: "Tláhuac",
  TLP: "Tlalpan",
  TPP: "Tlalpan",
  VCA: "Venustiano Carranza",
  VC: "Venustiano Carranza",
  XOC: "Xochimilco"
};

const alcaldiaAddressHints: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\balvaro obregon\b/, label: "Álvaro Obregón" },
  { pattern: /\bazcapotzalco\b/, label: "Azcapotzalco" },
  { pattern: /\bbenito juarez\b/, label: "Benito Juárez" },
  { pattern: /\bcoyoacan\b/, label: "Coyoacán" },
  { pattern: /\bcuajimalpa\b/, label: "Cuajimalpa" },
  { pattern: /\bcuauhtemoc\b/, label: "Cuauhtémoc" },
  { pattern: /\bgustavo a madero\b/, label: "Gustavo A. Madero" },
  { pattern: /\biztacalco\b/, label: "Iztacalco" },
  { pattern: /\biztapalapa\b/, label: "Iztapalapa" },
  { pattern: /\bmagdalena contreras\b/, label: "La Magdalena Contreras" },
  { pattern: /\bmiguel hidalgo\b/, label: "Miguel Hidalgo" },
  { pattern: /\bmilpa alta\b/, label: "Milpa Alta" },
  { pattern: /\btlahuac\b/, label: "Tláhuac" },
  { pattern: /\btlalpan\b/, label: "Tlalpan" },
  { pattern: /\bvenustiano carranza\b/, label: "Venustiano Carranza" },
  { pattern: /\bxochimilco\b/, label: "Xochimilco" }
];

const slugify = (value: string | number | null | undefined) =>
  normalizeText(value).replace(/\s+/g, "-") || "sin-clave";

const resolveOperationalAlcaldia = (rawValue: string | number | null | undefined, address?: string | null) => {
  const addressCandidate = sanitizeText(address);
  if (addressCandidate) {
    const normalizedAddress = normalizeText(addressCandidate);
    const hint = alcaldiaAddressHints.find((item) => item.pattern.test(normalizedAddress));
    if (hint) {
      const normalizedFromAddress = normalizeAlcaldia(hint.label);
      return {
        alcaldia: normalizedFromAddress.alcaldia,
        geoKey: normalizedFromAddress.geoKey
      };
    }
  }

  const raw = sanitizeText(rawValue);
  if (!raw) return { alcaldia: null, geoKey: null };
  const token = raw.split("-")[0]?.trim().toUpperCase();
  const mapped = token ? alcaldiaCodeMap[token] : null;
  if (mapped) {
    const normalized = normalizeAlcaldia(mapped);
    return {
      alcaldia: normalized.alcaldia,
      geoKey: normalized.geoKey
    };
  }

  const normalized = normalizeAlcaldia(raw);
  return normalized.matched
    ? { alcaldia: normalized.alcaldia, geoKey: normalized.geoKey }
    : { alcaldia: raw, geoKey: null };
};

const parseNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value ?? "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, " ")
    .trim();
  if (!normalized) return null;
  const chunks = normalized.split(/\s+/).filter(Boolean);
  const first = Number(chunks[0]);
  return Number.isFinite(first) ? first : null;
};

const normalizeFigure = (value: string | number | null | undefined): StaffFigure => {
  const normalized = normalizeText(value);
  if (normalized === "promotor") return "promotor";
  if (normalized === "promotor deportivo") return "promotor_deportivo";
  if (normalized === "animador") return "animador";
  if (normalized === "animador deportivo") return "animador_deportivo";
  if (normalized === "entrenador" || normalized === "etrenador") return "entrenador";
  if (normalized === "entrenador deportivo") return "entrenador_deportivo";
  return "no_documentado";
};

const parseCoordinatePair = (value: string | number | null | undefined) => {
  const raw = sanitizeText(value);
  if (!raw) return { latitude: null, longitude: null };

  const decimalMatch = raw.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (decimalMatch) {
    return {
      latitude: Number(decimalMatch[1]),
      longitude: Number(decimalMatch[2])
    };
  }

  const dms = raw.match(
    /(\d{1,2})[°º]\s*(\d{1,2})['’]?\s*(\d{1,2}(?:\.\d+)?)["”]?\s*([NS])\s+(\d{1,3})[°º]\s*(\d{1,2})['’]?\s*(\d{1,2}(?:\.\d+)?)["”]?\s*([EW])/i
  );
  if (!dms) return { latitude: null, longitude: null };

  const toDecimal = (deg: number, min: number, sec: number, hemisphere: string) => {
    const value = deg + min / 60 + sec / 3600;
    return hemisphere.toUpperCase() === "S" || hemisphere.toUpperCase() === "W" ? -value : value;
  };

  return {
    latitude: toDecimal(Number(dms[1]), Number(dms[2]), Number(dms[3]), dms[4]),
    longitude: toDecimal(Number(dms[5]), Number(dms[6]), Number(dms[7]), dms[8])
  };
};

const parseWeeklySchedule = (row: WorkbookRow) => {
  const schedule: OperationScheduleSlot[] = [];
  const seenDays = new Set<OperationScheduleSlot["day"]>();

  for (const column of scheduleColumns) {
    if (seenDays.has(column.day)) continue;
    const rawLabel = sanitizeText(row[column.key]);
    if (!rawLabel) continue;
    const match = rawLabel.replace(/\s+/g, "").match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
    schedule.push({
      day: column.day,
      startTime: match ? match[1] : null,
      endTime: match ? match[2] : null,
      rawLabel
    });
    seenDays.add(column.day);
  }

  return schedule;
};

const readRows = (filePath: string, sheetName: string, range = 0) => {
  const workbook = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json<WorkbookRow>(workbook.Sheets[sheetName], { defval: "", raw: true, range });
};

const buildStaffId = (channel: OperationChannel, fullName: string) => `${channel}-staff-${slugify(fullName)}`;
const buildVenueId = (channel: OperationChannel, code: string | null, name: string) =>
  `${channel}-venue-${code ? slugify(code) : slugify(name)}`;

const buildClassGroupId = (channel: OperationChannel, venueId: string, staffId: string, activityKey: string, rowIndex: number) =>
  `${channel}-class-${slugify(venueId)}-${slugify(staffId)}-${slugify(activityKey)}-${rowIndex + 1}`;

const buildRouteProposals = (): OperationRouteProposal[] => [
  {
    path: "/operacion",
    title: "Panorama operativo",
    purpose: "Monitorear personal, sedes, grupos activos y brechas de captura.",
    audience: ["direccion", "admin", "rh"],
    dataType: "preparado"
  },
  {
    path: "/operacion/clases",
    title: "Clases y horarios",
    purpose: "Consultar grupos por sede, disciplina, profesor y día.",
    audience: ["profesor_promotor", "subcoordinacion", "admin"],
    dataType: "preparado"
  },
  {
    path: "/operacion/asistencia",
    title: "Pase de lista diario",
    purpose: "Registrar asistencia únicamente el día de la clase con sello de fecha, hora, usuario y evidencia.",
    audience: ["profesor_promotor", "subcoordinacion"],
    dataType: "preparado"
  },
  {
    path: "/operacion/alumnos",
    title: "Altas, bajas e historial",
    purpose: "Gestionar matrícula por grupo sin perder trazabilidad histórica.",
    audience: ["profesor_promotor", "subcoordinacion", "admin"],
    dataType: "preparado"
  },
  {
    path: "/operacion/evidencia",
    title: "Evidencia fotográfica",
    purpose: "Resguardar evidencia ligada a asistencia y sesión operativa.",
    audience: ["profesor_promotor", "subcoordinacion", "direccion"],
    dataType: "preparado"
  },
  {
    path: "/operacion/admin",
    title: "Auditoría y tiempo real",
    purpose: "Revisión transversal por dirección, RH y administración con histórico completo.",
    audience: ["direccion", "rh", "admin"],
    dataType: "preparado"
  }
];

const buildAttendanceRules = (): AttendanceCaptureRule[] => [
  {
    code: "same-day-only",
    title: "Asistencia solo el día de la clase",
    description: "El pase de lista debe habilitarse únicamente durante la fecha programada de cada clase.",
    dataType: "preparado"
  },
  {
    code: "traceability-required",
    title: "Trazabilidad obligatoria",
    description: "Cada captura debe guardar fecha, hora, usuario responsable y evidencia asociada cuando aplique.",
    dataType: "preparado"
  },
  {
    code: "historical-enrollment",
    title: "Altas y bajas con historial",
    description: "Los cambios de matrícula deben conservar vigencia, fecha de movimiento y responsable del cambio.",
    dataType: "preparado"
  }
];

const buildRolePermissions = (): OperationRolePermission[] => [
  {
    role: "profesor_promotor",
    scope: "Solo sus clases y sus grupos asignados.",
    canView: ["clases_propias", "horarios_propios", "matricula_propia"],
    canEdit: ["asistencia_del_dia", "evidencia_de_sesion"],
    canApprove: [],
    dataType: "preparado"
  },
  {
    role: "subcoordinacion",
    scope: "Clases y asistencia de su zona o sede asignada.",
    canView: ["clases_de_zona", "historico_de_zona", "evidencia_de_zona"],
    canEdit: ["correcciones_del_dia", "movimientos_de_matricula"],
    canApprove: ["validacion_de_asistencia"],
    dataType: "preparado"
  },
  {
    role: "lcpo",
    scope: "Operación de la sede y trazabilidad vinculada.",
    canView: ["clases_de_sede", "historico_de_sede", "tablero_de_alertas"],
    canEdit: ["movimientos_de_matricula", "observaciones_operativas"],
    canApprove: ["cierre_de_jornada"],
    dataType: "preparado"
  },
  {
    role: "rh",
    scope: "Consulta transversal para seguimiento administrativo del personal.",
    canView: ["historial_completo", "carga_horaria_de_personal"],
    canEdit: [],
    canApprove: [],
    dataType: "preparado"
  },
  {
    role: "admin",
    scope: "Administración funcional y monitoreo en tiempo real.",
    canView: ["todo", "tiempo_real", "historico"],
    canEdit: ["catalogos", "correcciones_controladas"],
    canApprove: ["cierres", "ajustes_de_registro"],
    dataType: "preparado"
  },
  {
    role: "direccion",
    scope: "Supervisión ejecutiva con acceso a histórico y operación vigente.",
    canView: ["todo", "alertas_criticas", "cobertura_operativa"],
    canEdit: [],
    canApprove: ["lineamientos_operativos"],
    dataType: "preparado"
  }
];

export const buildOperacionAsistenciaLayer = (): OperationalModuleDataset => {
  const ponteRows = readRows(pontePilaPath, pontePilaSheet);
  const acumuladaRows = readRows(acumuladaPath, acumuladaSheet, 3);

  const staffMap = new Map<string, OperationStaffRecord>();
  const venueMap = new Map<string, OperationVenueRecord>();
  const classGroups: OperationClassGroupRecord[] = [];

  const registerStaff = (input: {
    channel: OperationChannel;
    fullName: string;
    sex: OperationStaffRecord["sex"];
    figure: StaffFigure;
    discipline: string | null;
    activity: string | null;
    classGroupId: string;
    sourceFile: string;
    sourceHeader: string;
  }) => {
    const id = buildStaffId(input.channel, input.fullName);
    const current = staffMap.get(id);
    const next: OperationStaffRecord = current ?? {
      id,
      fullName: input.fullName,
      sex: input.sex,
      figures: [],
      channels: [],
      disciplines: [],
      activities: [],
      sourceHeaders: [],
      classGroupIds: [],
      sourceFiles: [],
      dataType: "real",
      methodologicalNote:
        "Personal operativo consolidado desde malla horaria Ponte Pila y malla acumulada de PILARES. No representa aún control de acceso ni permisos activos."
    };

    if (!next.figures.includes(input.figure)) next.figures.push(input.figure);
    if (!next.channels.includes(input.channel)) next.channels.push(input.channel);
    if (input.discipline && !next.disciplines.includes(input.discipline)) next.disciplines.push(input.discipline);
    if (input.activity && !next.activities.includes(input.activity)) next.activities.push(input.activity);
    if (!next.sourceHeaders.includes(input.sourceHeader)) next.sourceHeaders.push(input.sourceHeader);
    if (!next.classGroupIds.includes(input.classGroupId)) next.classGroupIds.push(input.classGroupId);
    if (!next.sourceFiles.includes(input.sourceFile)) next.sourceFiles.push(input.sourceFile);
    staffMap.set(id, next);
    return id;
  };

  const registerVenue = (input: OperationVenueRecord) => {
    const current = venueMap.get(input.id);
    if (!current) {
      venueMap.set(input.id, input);
      return input.id;
    }
    if (!current.reportingPilaresName && input.reportingPilaresName) current.reportingPilaresName = input.reportingPilaresName;
    if (!current.subcoordinatorName && input.subcoordinatorName) current.subcoordinatorName = input.subcoordinatorName;
    if (!current.lcpoName && input.lcpoName) current.lcpoName = input.lcpoName;
    if (!current.address && input.address) current.address = input.address;
    return input.id;
  };

  ponteRows.forEach((row, rowIndex) => {
    const pointCode = sanitizeText(row["PUNTO PONTE PILA"]);
    const pointName = sanitizeText(row["PUNTO PONTE PILA_1"] ?? row["PUNTO PONTE PILA"]);
    const promoterName = sanitizeText(row.PROMOTOR);
    if (!pointName || !promoterName) return;

    const normalizedAlcaldia = resolveOperationalAlcaldia(row.ALCALDIA, sanitizeText(row.UBICACIÓN));
    const venueId = buildVenueId("ponte_pila", pointCode ?? sanitizeText(row.CONS), pointName);
    const coordinates = parseCoordinatePair(row.COORDENADAS);
    registerVenue({
      id: venueId,
      channel: "ponte_pila",
      code: pointCode ?? sanitizeText(row.CONS),
      name: pointName,
      alcaldia: normalizedAlcaldia.alcaldia,
      geoKey: normalizedAlcaldia.geoKey,
      region: sanitizeText(row.REGION),
      zone: sanitizeText(row.ZONA),
      address: sanitizeText(row.UBICACIÓN),
      georeferenceLink: sanitizeText(row.GEOREFERENCIA),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      reportingPilaresName: sanitizeText(row["PILARES AL QUE REPORTA ASISTENCIAS"]),
      coordinatorName: sanitizeText(row.COORDINA),
      subcoordinatorName: sanitizeText(row.SUBCOORDINA),
      lcpoName: null,
      sourceFiles: [pontePilaRelativePath],
      dataType: "real",
      methodologicalNote:
        "Punto Ponte Pila operativo integrado desde la malla horaria 2026. La sede y su horario son reales; la capa aún no incluye captura transaccional de asistencia."
    });

    const discipline2026 = sanitizeText(row["DISCIPLINA CATALOGO 2026"]);
    const activityKey = `${discipline2026 ?? "sin-disciplina"}-${pointName}`;
    const classGroupId = buildClassGroupId("ponte_pila", venueId, buildStaffId("ponte_pila", promoterName), activityKey, rowIndex);
    const staffId = registerStaff({
      channel: "ponte_pila",
      fullName: promoterName,
      sex: sanitizeText(row.SEXO) === "H" ? "H" : sanitizeText(row.SEXO) === "M" ? "M" : "No documentado",
      figure: normalizeFigure(row.FIGURA),
      discipline: discipline2026,
      activity: discipline2026,
      classGroupId,
      sourceFile: pontePilaRelativePath,
      sourceHeader: "PROMOTOR"
    });

    classGroups.push({
      id: classGroupId,
      channel: "ponte_pila",
      sourceFile: pontePilaRelativePath,
      sourceSheet: pontePilaSheet,
      venueId,
      venueName: pointName,
      reportingPilaresName: sanitizeText(row["PILARES AL QUE REPORTA ASISTENCIAS"]),
      staffId,
      staffName: promoterName,
      figure: normalizeFigure(row.FIGURA),
      activityArea: sanitizeText(row.AREA),
      disciplineCatalog2025: sanitizeText(row["DISCIPLINA CATALOGO 2025"]),
      disciplineCatalog2026: discipline2026,
      activityName: discipline2026,
      activityDetail: sanitizeText(row["MODALIDAD MIXTO / AFUERA"]),
      modality: sanitizeText(row["MODALIDAD MIXTO / AFUERA"]),
      weeklySchedule: parseWeeklySchedule(row),
      weeklyHours: parseNumber(row["TOTAL HORAS"]),
      olderAdultFlag:
        sanitizeText(row["ACTIVIDAD PARA ADULTO MAYOR SI / NO"]) === "SI"
          ? true
          : sanitizeText(row["ACTIVIDAD PARA ADULTO MAYOR SI / NO"]) === "NO"
            ? false
            : null,
      sourceRowCount: 1,
      dataType: "real",
      methodologicalNote:
        "Grupo operativo real derivado de la malla horaria Ponte Pila 2026. El registro describe programación y asignación; no incluye aún alumnos nominales ni asistencia diaria capturada."
    });
  });

  acumuladaRows.forEach((row, rowIndex) => {
    const staffName = sanitizeText(row["NOMBRE COMPLETO DEL BENEFICIARIO"]);
    const pilaresName = sanitizeText(row.PILARES);
    if (!staffName || !pilaresName) return;

    const normalizedAlcaldia = resolveOperationalAlcaldia(row["ALCALDÍA"], sanitizeText(row.DOMICILIO));
    const venueId = buildVenueId("pilares", null, pilaresName);
    const coordinates = parseCoordinatePair(row["COORDENADAS GEOGRÁFICAS"]);
    registerVenue({
      id: venueId,
      channel: "pilares",
      code: null,
      name: pilaresName,
      alcaldia: normalizedAlcaldia.alcaldia,
      geoKey: normalizedAlcaldia.geoKey,
      region: sanitizeText(row["REGIÓN"]),
      zone: null,
      address: sanitizeText(row.DOMICILIO),
      georeferenceLink: sanitizeText(row.GEOREFERENCIA),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      reportingPilaresName: pilaresName,
      coordinatorName: sanitizeText(row.COORDINADOR),
      subcoordinatorName: sanitizeText(row.SUBCOORDINA),
      lcpoName: sanitizeText(row.LCPO),
      sourceFiles: [acumuladaRelativePath],
      dataType: "real",
      methodologicalNote:
        "Sede PILARES consolidada desde la acumulada abril 2026. El archivo describe carga horaria operativa del personal y no un padrón nominal de asistencia."
    });

    const activityKey = `${sanitizeText(row.ACTIVIDAD) ?? "sin-actividad"}-${sanitizeText(row["ACTIVIDAD DESAGREGADA"]) ?? "sin-detalle"}-${pilaresName}`;
    const classGroupId = buildClassGroupId("pilares", venueId, buildStaffId("pilares", staffName), activityKey, rowIndex);
    const staffId = registerStaff({
      channel: "pilares",
      fullName: staffName,
      sex: sanitizeText(row.SEXO) === "H" ? "H" : sanitizeText(row.SEXO) === "M" ? "M" : "No documentado",
      figure: normalizeFigure(row.FIGURA),
      discipline: sanitizeText(row["ACTIVIDAD DESAGREGADA"]),
      activity: sanitizeText(row.ACTIVIDAD),
      classGroupId,
      sourceFile: acumuladaRelativePath,
      sourceHeader: "NOMBRE COMPLETO DEL BENEFICIARIO"
    });

    classGroups.push({
      id: classGroupId,
      channel: "pilares",
      sourceFile: acumuladaRelativePath,
      sourceSheet: acumuladaSheet,
      venueId,
      venueName: pilaresName,
      reportingPilaresName: pilaresName,
      staffId,
      staffName,
      figure: normalizeFigure(row.FIGURA),
      activityArea: sanitizeText(row["ÁREA"]),
      disciplineCatalog2025: null,
      disciplineCatalog2026: sanitizeText(row["ACTIVIDAD DESAGREGADA"]),
      activityName: sanitizeText(row.ACTIVIDAD),
      activityDetail: sanitizeText(row["ACTIVIDAD DESAGREGADA"]),
      modality: sanitizeText(row["TIPO DE    PROMOTOR"]),
      weeklySchedule: parseWeeklySchedule(row),
      weeklyHours: parseNumber(row["TOTAL DE    HORAS SEMANA"]),
      olderAdultFlag: null,
      sourceRowCount: 1,
      dataType: "real",
      methodologicalNote:
        "Grupo operativo real derivado de la acumulada abril 2026. El nombre del campo original es 'beneficiario', pero por el contexto de figura, actividad y carga horaria se usa aquí como personal operativo asignado, no como alumno."
    });
  });

  const routeProposals = buildRouteProposals();
  const attendanceCaptureRules = buildAttendanceRules();
  const rolePermissions = buildRolePermissions();
  const students: OperationStudentRecord[] = [];

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceFiles: [
        {
          path: pontePilaRelativePath,
          sheet: pontePilaSheet,
          rows: ponteRows.length,
          purpose: "Malla operativa de puntos Ponte Pila, personal, disciplina y horario semanal.",
          dataType: "real"
        },
        {
          path: acumuladaRelativePath,
          sheet: acumuladaSheet,
          rows: acumuladaRows.length,
          purpose: "Carga operativa acumulada de PILARES por figura, actividad y sede.",
          dataType: "real"
        }
      ],
      notes: [
        "Las fuentes actuales sí permiten construir personal, sedes y grupos operativos.",
        "Las fuentes actuales no contienen asistencia diaria transaccional, evidencia fotográfica ni padrón nominal de alumnos por clase.",
        "La captura de asistencia, los alumnos y la evidencia se dejan listos como estructura preparada para una siguiente fase."
      ]
    },
    summary: {
      staffCount: staffMap.size,
      venueCount: venueMap.size,
      classGroupCount: classGroups.length,
      puentePilaClassCount: classGroups.filter((item) => item.channel === "ponte_pila").length,
      pilaresClassCount: classGroups.filter((item) => item.channel === "pilares").length,
      studentCount: students.length,
      enrollmentCount: 0,
      attendanceRecordCount: 0,
      evidenceRecordCount: 0,
      routeProposalCount: routeProposals.length
    },
    staff: Array.from(staffMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName, "es")),
    venues: Array.from(venueMap.values()).sort((a, b) => a.name.localeCompare(b.name, "es")),
    classGroups,
    students,
    enrollments: [],
    attendanceRecords: [],
    evidenceRecords: [],
    attendanceCaptureRules,
    rolePermissions,
    routeProposals
  };
};
