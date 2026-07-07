"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AttendancePermissionRole,
  OperationAttendanceRecord,
  OperationAuditRecord,
  OperationClassRosterEntry,
  OperationClassGroupRecord,
  OperationEnrollmentRecord,
  OperationEvidenceRecord,
  OperationLocalState,
  OperationStaffRecord,
  OperationStudentChangeRecord,
  OperationStudentRecord,
  OperationUserRecord,
  OperationUserSession,
  OperationalModuleDataset
} from "./operations-types";

const STORAGE_KEY = "deporte-cdmx-operacion-mock-state";
const BASE_MOCK_STUDENT_COUNT_LIMIT = 18;

const firstNames = [
  "Mariana",
  "Luis",
  "Fernanda",
  "Carlos",
  "Daniela",
  "Jorge",
  "Valeria",
  "Axel",
  "Renata",
  "Arturo",
  "Camila",
  "David",
  "Andrea",
  "Iván",
  "Ximena",
  "Miguel",
  "Natalia",
  "Emiliano",
  "Sofía",
  "Brenda"
];

const lastNames = [
  "García",
  "Hernández",
  "López",
  "Martínez",
  "Sánchez",
  "Ramírez",
  "Cruz",
  "Flores",
  "Torres",
  "Morales",
  "Vargas",
  "Mendoza",
  "Castillo",
  "Silva",
  "Navarro",
  "Reyes",
  "Rojas",
  "Pérez",
  "Ruiz",
  "Aguilar"
];

const simpleHash = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const getTodayIso = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

const getCurrentTime = () =>
  new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeRole = (role: string | null | undefined): AttendancePermissionRole => {
  if (role === "subcoordinacion") return "coordinador";
  if (role === "admin") return "superadmin";
  if (role === "coordinador" || role === "lcpo" || role === "rh" || role === "direccion" || role === "superadmin") {
    return role;
  }
  return "profesor_promotor";
};

const buildDefaultSession = (dataset: OperationalModuleDataset): OperationUserSession => {
  const firstUser =
    dataset.users.find((item) => item.role === "profesor_promotor" && item.staffId) ??
    dataset.users[0] ??
    null;

  return {
    userId: firstUser?.userId ?? null,
    username: firstUser?.username ?? null,
    role: firstUser?.role ?? "profesor_promotor",
    staffId: firstUser?.staffId ?? null,
    displayName: firstUser?.displayName ?? "Usuario operativo",
    dataType: "preparado"
  };
};

const buildInitialState = (dataset: OperationalModuleDataset): OperationLocalState => ({
  userSession: buildDefaultSession(dataset),
  students: [],
  enrollments: [],
  attendanceRecords: [],
  evidenceRecords: [],
  studentChanges: [],
  auditLog: []
});

type ManualStudentInput = {
  classGroupId: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  sex: OperationStudentRecord["sex"];
  age: number | null;
};

type EvidenceInput = {
  classGroupId: string;
  attendanceDate: string;
  uploadedByUserId: string;
  assetUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
};

type AttendanceInput = {
  classGroupId: string;
  studentId: string;
  status: OperationAttendanceRecord["status"];
  recordedByUserId: string;
  staffId: string;
  staffName: string;
  evidenceAssetId?: string | null;
};

type EnrollmentStatusInput = {
  enrollmentId: string;
  status: OperationEnrollmentRecord["status"];
  changedByUserId: string;
  note: string;
};

type SetSessionInput = {
  user: OperationUserRecord | null;
  fallbackStaff?: OperationStaffRecord | null;
};

const normalizeDisplayName = (firstName: string, paternalLastName: string, maternalLastName: string) =>
  [firstName.trim(), paternalLastName.trim(), maternalLastName.trim()].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

const hydrateStudentRecord = (student: OperationStudentRecord): OperationStudentRecord => {
  if (student.displayName && student.rawFullName) return student;
  const tokens = (student.fullName ?? "").split(" ").filter(Boolean);
  const nextFirstName = student.firstName ?? tokens[0] ?? null;
  const nextPaternal = student.paternalLastName ?? tokens[1] ?? null;
  const nextMaternal = student.maternalLastName ?? (tokens.length > 2 ? tokens.slice(2).join(" ") : null);
  const displayName = student.displayName ?? student.fullName;

  return {
    ...student,
    rawFullName: student.rawFullName ?? student.fullName,
    firstName: nextFirstName,
    paternalLastName: nextPaternal,
    maternalLastName: nextMaternal,
    displayName,
    sortableName: student.sortableName ?? [nextPaternal, nextMaternal, nextFirstName].filter(Boolean).join(" "),
    age: student.age ?? null
  };
};

export default function useOperationMockState(dataset: OperationalModuleDataset) {
  const [state, setState] = useState<OperationLocalState>(() => buildInitialState(dataset));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(saved) as Partial<OperationLocalState>;
      setState({
        ...buildInitialState(dataset),
        ...parsed,
        userSession: parsed.userSession
          ? {
              ...buildDefaultSession(dataset),
              ...parsed.userSession,
              role: normalizeRole(parsed.userSession.role),
              userId: parsed.userSession.userId ?? null,
              username: parsed.userSession.username ?? null
            }
          : buildDefaultSession(dataset),
        students: (parsed.students ?? []).map((student) => hydrateStudentRecord(student as OperationStudentRecord)),
        evidenceRecords: (parsed.evidenceRecords ?? []).map((record) => ({
          ...record,
          localPreviewUrl: record.localPreviewUrl ?? record.assetUrl ?? null
        })),
        studentChanges: parsed.studentChanges ?? [],
        auditLog: parsed.auditLog ?? []
      });
    } catch (error) {
      console.error("[operacion-state] no se pudo hidratar el estado local", error);
    } finally {
      setHydrated(true);
    }
  }, [dataset]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const effectiveStaff = useMemo(
    () => dataset.staff.find((item) => item.id === state.userSession.staffId) ?? dataset.staff[0] ?? null,
    [dataset.staff, state.userSession.staffId]
  );

  const effectiveUser = useMemo(
    () => dataset.users.find((item) => item.userId === state.userSession.userId) ?? null,
    [dataset.users, state.userSession.userId]
  );

  const appendAudit = (current: OperationLocalState, record: Omit<OperationAuditRecord, "id" | "dataType">): OperationLocalState => ({
    ...current,
    auditLog: [
      ...current.auditLog,
      {
        id: createId("audit"),
        ...record,
        dataType: "preparado"
      }
    ]
  });

  const generatedRosterForClass = (classGroup: OperationClassGroupRecord | null) => {
    if (!classGroup) return [];
    const weeklyHours = classGroup.weeklyHours ?? classGroup.weeklySchedule.length ?? 1;
    const disciplineSignal =
      classGroup.disciplineCatalog2026 ?? classGroup.activityName ?? classGroup.activityDetail ?? classGroup.activityArea ?? "";
    const baseCount =
      6 +
      (simpleHash(`${classGroup.id}-${disciplineSignal}`) % 5) +
      Math.min(Math.max(Math.round(weeklyHours / 2), 0), 3);
    const count = Math.min(Math.max(baseCount, 6), BASE_MOCK_STUDENT_COUNT_LIMIT);

    return Array.from({ length: count }, (_, index) => {
      const seed = simpleHash(`${classGroup.id}-${index}`);
      const firstName = firstNames[seed % firstNames.length];
      const paternalLastName = lastNames[(seed >> 3) % lastNames.length];
      const maternalLastName = lastNames[(seed >> 6) % lastNames.length];
      const sex = seed % 2 === 0 ? "M" : "H";
      const studentId = `mock-student-${classGroup.id}-${index + 1}`;
      const enrollmentId = `mock-enrollment-${classGroup.id}-${index + 1}`;
      const displayName = normalizeDisplayName(firstName, paternalLastName, maternalLastName);

      const student: OperationStudentRecord = {
        id: studentId,
        fullName: displayName,
        rawFullName: displayName,
        firstName,
        paternalLastName,
        maternalLastName,
        displayName,
        sortableName: [paternalLastName, maternalLastName, firstName].join(" "),
        sex,
        age: 15 + (seed % 31),
        sourceFiles: ["generador_mock_operacion"],
        sourceType: "captura_manual",
        dataType: "preparado",
        methodologicalNote:
          "Alumno mock generado de forma determinística desde la clase para habilitar el flujo funcional de operación. Debe sustituirse por matrícula real."
      };

      const enrollment: OperationEnrollmentRecord = {
        id: enrollmentId,
        classGroupId: classGroup.id,
        studentId,
        status: "activa",
        startDate: null,
        endDate: null,
        sourceFile: "generador_mock_operacion",
        movementHistory: [],
        dataType: "preparado",
        methodologicalNote:
          "Inscripción mock determinística generada desde la clase. Debe reemplazarse por altas y bajas persistidas en base de datos."
      };

      return { student, enrollment };
    });
  };

  const setRole = (role: AttendancePermissionRole) => {
    setState((current) => ({
      ...current,
      userSession: {
        ...current.userSession,
        role
      }
    }));
  };

  const setSessionUser = ({ user, fallbackStaff }: SetSessionInput) => {
    setState((current) => {
      const nextState = {
        ...current,
        userSession: {
          userId: user?.userId ?? null,
          username: user?.username ?? null,
          role: user?.role ?? current.userSession.role,
          staffId: user?.staffId ?? fallbackStaff?.id ?? null,
          displayName: user?.displayName ?? fallbackStaff?.displayName ?? "Usuario operativo",
          dataType: "preparado" as const
        }
      };
      return appendAudit(nextState, {
        action: "session.select_user",
        timestamp: new Date().toISOString(),
        userId: user?.userId ?? "usuario-local",
        entityType: "session",
        entityId: user?.userId ?? "session-local",
        notes: `Cambio de usuario simulado a ${user?.displayName ?? fallbackStaff?.displayName ?? "sin selección"}.`
      });
    });
  };

  const setStaff = (staff: OperationStaffRecord | null) => {
    const linkedUser =
      dataset.users.find((item) => item.staffId === staff?.id && item.role === state.userSession.role) ??
      dataset.users.find((item) => item.staffId === staff?.id) ??
      null;
    setSessionUser({ user: linkedUser, fallbackStaff: staff });
  };

  const addManualStudent = ({ classGroupId, firstName, paternalLastName, maternalLastName, sex, age }: ManualStudentInput) => {
    const studentId = createId("manual-student");
    const enrollmentId = createId("manual-enrollment");
    const changedAt = new Date().toISOString();
    const sourceFile = "captura_local_operacion";
    const displayName = normalizeDisplayName(firstName, paternalLastName, maternalLastName);

    setState((current) => {
      const nextStudent: OperationStudentRecord = {
        id: studentId,
        fullName: displayName,
        rawFullName: displayName,
        firstName: firstName.trim() || null,
        paternalLastName: paternalLastName.trim() || null,
        maternalLastName: maternalLastName.trim() || null,
        displayName,
        sortableName: [paternalLastName.trim(), maternalLastName.trim(), firstName.trim()].filter(Boolean).join(" "),
        sex,
        age,
        sourceFiles: [sourceFile],
        sourceType: "captura_manual",
        dataType: "preparado",
        methodologicalNote:
          "Alumno agregado manualmente en cliente para prototipo funcional. Debe persistirse en base de datos en la siguiente fase."
      };

      const nextEnrollment: OperationEnrollmentRecord = {
        id: enrollmentId,
        classGroupId,
        studentId,
        status: "activa",
        startDate: getTodayIso(),
        endDate: null,
        sourceFile,
        movementHistory: [
          {
            status: "activa",
            changedAt,
            changedByUserId: current.userSession.userId ?? current.userSession.staffId ?? "usuario-local",
            note: "Alta manual inicial"
          }
        ],
        dataType: "preparado",
        methodologicalNote:
          "Inscripción creada localmente para flujo prototipo. Debe migrarse a persistencia transaccional con historial."
      };

      const nextChange: OperationStudentChangeRecord = {
        id: createId("student-change"),
        classGroupId,
        enrollmentId,
        studentId,
        changeType: "alta",
        timestamp: changedAt,
        changedByUserId: current.userSession.userId ?? current.userSession.staffId ?? "usuario-local",
        notes: "Alta manual desde operación",
        dataType: "preparado"
      };

      return appendAudit(
        {
          ...current,
          students: [...current.students, nextStudent],
          enrollments: [...current.enrollments, nextEnrollment],
          studentChanges: [...current.studentChanges, nextChange]
        },
        {
          action: "student.create",
          timestamp: changedAt,
          userId: current.userSession.userId ?? current.userSession.staffId ?? "usuario-local",
          entityType: "student",
          entityId: studentId,
          notes: `Alta manual de ${displayName} en ${classGroupId}.`
        }
      );
    });
  };

  const updateEnrollmentStatus = ({ enrollmentId, status, changedByUserId, note }: EnrollmentStatusInput) => {
    const changedAt = new Date().toISOString();
    setState((current) => {
      const enrollment = current.enrollments.find((item) => item.id === enrollmentId) ?? null;
      if (!enrollment) return current;

      const nextEnrollments = current.enrollments.map((item) =>
        item.id === enrollmentId
          ? {
              ...item,
              status,
              endDate: status === "baja" ? getTodayIso() : null,
              movementHistory: [
                ...(item.movementHistory ?? []),
                {
                  status,
                  changedAt,
                  changedByUserId,
                  note
                }
              ]
            }
          : item
      );

      const nextChange: OperationStudentChangeRecord = {
        id: createId("student-change"),
        classGroupId: enrollment.classGroupId,
        enrollmentId,
        studentId: enrollment.studentId,
        changeType: status === "baja" ? "baja" : "reactivacion",
        timestamp: changedAt,
        changedByUserId,
        notes: note,
        dataType: "preparado"
      };

      return appendAudit(
        {
          ...current,
          enrollments: nextEnrollments,
          studentChanges: [...current.studentChanges, nextChange]
        },
        {
          action: "enrollment.status",
          timestamp: changedAt,
          userId: changedByUserId,
          entityType: "enrollment",
          entityId: enrollmentId,
          notes: note
        }
      );
    });
  };

  const addEvidence = ({ classGroupId, attendanceDate, uploadedByUserId, assetUrl, fileName, mimeType }: EvidenceInput) => {
    const evidenceId = createId("evidence");
    const record: OperationEvidenceRecord = {
      id: evidenceId,
      classGroupId,
      attendanceDate,
      uploadedByUserId,
      capturedAt: new Date().toISOString(),
      assetUrl,
      localPreviewUrl: assetUrl,
      fileName,
      mimeType,
      sourceType: "fotografia",
      dataType: "preparado",
      methodologicalNote:
        "Evidencia capturada en cliente para la primera versión funcional. Requiere storage persistente y control de acceso en siguiente fase."
    };

    setState((current) =>
      appendAudit(
        {
          ...current,
          evidenceRecords: [...current.evidenceRecords, record]
        },
        {
          action: "evidence.attach",
          timestamp: record.capturedAt,
          userId: uploadedByUserId,
          entityType: "evidence",
          entityId: evidenceId,
          notes: `Evidencia local asociada a ${classGroupId} para ${attendanceDate}.`
        }
      )
    );
    return record;
  };

  const markAttendance = ({
    classGroupId,
    studentId,
    status,
    recordedByUserId,
    staffId,
    staffName,
    evidenceAssetId = null
  }: AttendanceInput) => {
    const attendanceDate = getTodayIso();
    const attendanceTime = getCurrentTime();
    setState((current) => {
      const existingIndex = current.attendanceRecords.findIndex(
        (item) => item.classGroupId === classGroupId && item.studentId === studentId && item.attendanceDate === attendanceDate
      );
      const nextRecord: OperationAttendanceRecord = {
        id: existingIndex >= 0 ? current.attendanceRecords[existingIndex].id : createId("attendance"),
        classGroupId,
        studentId,
        staffId,
        staffName,
        attendanceDate,
        attendanceTime,
        recordedByUserId,
        evidenceAssetId,
        status,
        dataType: "preparado",
        methodologicalNote:
          "Asistencia guardada localmente para flujo funcional inicial. Debe persistirse con sello de servidor y bitácora transaccional en producción."
      };

      const nextAttendanceRecords = [...current.attendanceRecords];
      if (existingIndex >= 0) nextAttendanceRecords[existingIndex] = nextRecord;
      else nextAttendanceRecords.push(nextRecord);

      return appendAudit(
        {
          ...current,
          attendanceRecords: nextAttendanceRecords
        },
        {
          action: existingIndex >= 0 ? "attendance.update" : "attendance.create",
          timestamp: new Date().toISOString(),
          userId: recordedByUserId,
          entityType: "attendance",
          entityId: nextRecord.id,
          notes: `Estado ${status} para ${studentId} en ${classGroupId}.`
        }
      );
    });
  };

  const classesForSelectedStaff = useMemo(() => {
    if (!state.userSession.staffId) return [];
    return dataset.classGroups.filter((item) => item.staffId === state.userSession.staffId);
  }, [dataset.classGroups, state.userSession.staffId]);

  const classesByRole = useMemo(() => {
    if (state.userSession.role === "profesor_promotor" && state.userSession.staffId) {
      return classesForSelectedStaff;
    }
    return dataset.classGroups;
  }, [classesForSelectedStaff, dataset.classGroups, state.userSession.role, state.userSession.staffId]);

  const getRosterForClass = (classGroupId: string): OperationClassRosterEntry[] => {
    const classGroup = dataset.classGroups.find((item) => item.id === classGroupId) ?? null;
    const generated = generatedRosterForClass(classGroup);
    const baseStudents = new Map(generated.map((item) => [item.student.id, item.student]));
    const baseEnrollments = new Map(generated.map((item) => [item.enrollment.id, item.enrollment]));

    state.students.forEach((student) => {
      baseStudents.set(student.id, student);
    });

    state.enrollments
      .filter((item) => item.classGroupId === classGroupId)
      .forEach((enrollment) => {
        baseEnrollments.set(enrollment.id, enrollment);
      });

    const attendanceByStudent = new Map(
      state.attendanceRecords
        .filter((item) => item.classGroupId === classGroupId && item.attendanceDate === getTodayIso())
        .map((item) => [item.studentId, item])
    );

    return Array.from(baseEnrollments.values())
      .reduce<OperationClassRosterEntry[]>((acc, enrollment) => {
        if (enrollment.classGroupId !== classGroupId) return acc;
        const student = baseStudents.get(enrollment.studentId);
        if (!student) return acc;
        acc.push({
          student,
          enrollment,
          attendanceToday: attendanceByStudent.get(enrollment.studentId)
        });
        return acc;
      }, [])
      .sort((a, b) => a.student.displayName.localeCompare(b.student.displayName, "es"));
  };

  const activeStudentsCount = useMemo(
    () =>
      dataset.classGroups.reduce((count, classGroup) => {
        const active = getRosterForClass(classGroup.id).filter((item) => item.enrollment.status === "activa").length;
        return count + active;
      }, 0),
    [dataset.classGroups, state.attendanceRecords, state.enrollments, state.students]
  );

  return {
    hydrated,
    state,
    effectiveStaff,
    effectiveUser,
    activeStudentsCount,
    classesForSelectedStaff,
    classesByRole,
    getRosterForClass,
    setRole,
    setStaff,
    setSessionUser,
    addManualStudent,
    updateEnrollmentStatus,
    addEvidence,
    markAttendance
  };
}
