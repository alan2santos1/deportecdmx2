import type { DataLayer } from "./dashboard-types";

export type OperationChannel = "ponte_pila" | "pilares";
export type StaffFigure =
  | "promotor"
  | "promotor_deportivo"
  | "animador"
  | "animador_deportivo"
  | "entrenador"
  | "entrenador_deportivo"
  | "no_documentado";

export type AttendancePermissionRole =
  | "profesor_promotor"
  | "coordinador"
  | "lcpo"
  | "rh"
  | "direccion"
  | "superadmin";

export type OperationPersonName = {
  rawFullName: string;
  firstName: string | null;
  paternalLastName: string | null;
  maternalLastName: string | null;
  displayName: string;
  sortableName: string;
};

export type OperationScheduleSlot = {
  day:
    | "lunes"
    | "martes"
    | "miercoles"
    | "jueves"
    | "viernes"
    | "sabado"
    | "domingo";
  startTime: string | null;
  endTime: string | null;
  rawLabel: string;
};

export type OperationStaffRecord = OperationPersonName & {
  id: string;
  fullName: string;
  sex: "H" | "M" | "No documentado";
  figures: StaffFigure[];
  channels: OperationChannel[];
  disciplines: string[];
  activities: string[];
  sourceHeaders: string[];
  classGroupIds: string[];
  sourceFiles: string[];
  dataType: "real";
  methodologicalNote: string;
};

export type OperationVenueRecord = {
  id: string;
  channel: OperationChannel;
  code: string | null;
  name: string;
  alcaldia: string | null;
  geoKey: string | null;
  region: string | null;
  zone: string | null;
  address: string | null;
  georeferenceLink: string | null;
  latitude: number | null;
  longitude: number | null;
  reportingPilaresName: string | null;
  coordinatorName: string | null;
  subcoordinatorName: string | null;
  lcpoName: string | null;
  sourceFiles: string[];
  dataType: "real";
  methodologicalNote: string;
};

export type OperationClassGroupRecord = {
  id: string;
  channel: OperationChannel;
  sourceFile: string;
  sourceSheet: string;
  venueId: string;
  venueName: string;
  reportingPilaresName: string | null;
  staffId: string;
  staffName: string;
  figure: StaffFigure;
  activityArea: string | null;
  disciplineCatalog2025: string | null;
  disciplineCatalog2026: string | null;
  activityName: string | null;
  activityDetail: string | null;
  modality: string | null;
  weeklySchedule: OperationScheduleSlot[];
  weeklyHours: number | null;
  olderAdultFlag: boolean | null;
  sourceRowCount: number;
  dataType: "real";
  methodologicalNote: string;
};

export type OperationStudentRecord = OperationPersonName & {
  id: string;
  fullName: string;
  sex: "H" | "M" | "No documentado";
  age: number | null;
  sourceFiles: string[];
  sourceType: "nominal_alumno" | "captura_manual";
  dataType: "real" | "preparado";
  methodologicalNote: string;
};

export type OperationEnrollmentRecord = {
  id: string;
  classGroupId: string;
  studentId: string;
  status: "activa" | "baja";
  startDate: string | null;
  endDate: string | null;
  sourceFile: string;
  movementHistory?: Array<{
    status: "activa" | "baja";
    changedAt: string;
    changedByUserId: string;
    note: string;
  }>;
  dataType: "real" | "preparado";
  methodologicalNote: string;
};

export type OperationAttendanceRecord = {
  id: string;
  classGroupId: string;
  studentId: string;
  staffId: string;
  staffName: string;
  attendanceDate: string;
  attendanceTime: string;
  recordedByUserId: string;
  evidenceAssetId: string | null;
  status: "presente" | "retardo" | "falta" | "justificado";
  dataType: "real" | "preparado";
  methodologicalNote: string;
};

export type OperationEvidenceRecord = {
  id: string;
  classGroupId: string;
  attendanceDate: string;
  uploadedByUserId: string;
  capturedAt: string;
  assetUrl: string | null;
  localPreviewUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  sourceType: "fotografia";
  dataType: "real" | "preparado";
  methodologicalNote: string;
};

export type OperationStudentChangeRecord = {
  id: string;
  classGroupId: string;
  enrollmentId: string | null;
  studentId: string;
  changeType: "alta" | "baja" | "reactivacion" | "edicion";
  timestamp: string;
  changedByUserId: string;
  notes: string;
  dataType: "preparado";
};

export type OperationAuditRecord = {
  id: string;
  action: string;
  timestamp: string;
  userId: string;
  entityType: "attendance" | "evidence" | "student" | "enrollment" | "session";
  entityId: string;
  notes: string;
  dataType: "preparado";
};

export type AttendanceCaptureRule = {
  code: string;
  title: string;
  description: string;
  dataType: Extract<DataLayer, "preparado">;
};

export type OperationRolePermission = {
  role: AttendancePermissionRole;
  scope: string;
  canView: string[];
  canEdit: string[];
  canApprove: string[];
  dataType: Extract<DataLayer, "preparado">;
};

export type OperationUserSession = {
  userId: string | null;
  username: string | null;
  role: AttendancePermissionRole;
  staffId: string | null;
  displayName: string;
  dataType: "preparado";
};

export type OperationUserRecord = {
  userId: string;
  staffId: string | null;
  role: AttendancePermissionRole;
  username: string;
  displayName: string;
  assignedScope: string;
  active: boolean;
  sourceType: "derivado_mock";
  dataType: "preparado";
  methodologicalNote: string;
};

export type OperationClassRosterEntry = {
  student: OperationStudentRecord;
  enrollment: OperationEnrollmentRecord;
  attendanceToday?: OperationAttendanceRecord;
};

export type OperationRouteProposal = {
  path: string;
  title: string;
  purpose: string;
  audience: string[];
  dataType: Extract<DataLayer, "preparado">;
};

export type OperationalModuleDataset = {
  meta: {
    generatedAt: string;
    sourceFiles: Array<{
      path: string;
      sheet: string;
      rows: number;
      purpose: string;
      dataType: "real";
    }>;
    notes: string[];
  };
  summary: {
    userCount: number;
    staffCount: number;
    venueCount: number;
    classGroupCount: number;
    puentePilaClassCount: number;
    pilaresClassCount: number;
    studentCount: number;
    enrollmentCount: number;
    attendanceRecordCount: number;
    evidenceRecordCount: number;
    studentChangeCount: number;
    auditLogCount: number;
    routeProposalCount: number;
  };
  users: OperationUserRecord[];
  staff: OperationStaffRecord[];
  venues: OperationVenueRecord[];
  classGroups: OperationClassGroupRecord[];
  students: OperationStudentRecord[];
  enrollments: OperationEnrollmentRecord[];
  attendanceRecords: OperationAttendanceRecord[];
  evidenceRecords: OperationEvidenceRecord[];
  studentChanges: OperationStudentChangeRecord[];
  auditLog: OperationAuditRecord[];
  attendanceCaptureRules: AttendanceCaptureRule[];
  rolePermissions: OperationRolePermission[];
  routeProposals: OperationRouteProposal[];
};

export type OperationLocalState = {
  userSession: OperationUserSession;
  students: OperationStudentRecord[];
  enrollments: OperationEnrollmentRecord[];
  attendanceRecords: OperationAttendanceRecord[];
  evidenceRecords: OperationEvidenceRecord[];
  studentChanges: OperationStudentChangeRecord[];
  auditLog: OperationAuditRecord[];
};
