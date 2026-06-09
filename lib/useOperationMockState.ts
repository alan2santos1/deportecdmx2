"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AttendancePermissionRole,
  OperationAttendanceRecord,
  OperationClassRosterEntry,
  OperationClassGroupRecord,
  OperationEnrollmentRecord,
  OperationEvidenceRecord,
  OperationLocalState,
  OperationStaffRecord,
  OperationStudentRecord,
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

const buildDefaultSession = (dataset: OperationalModuleDataset): OperationUserSession => {
  const firstStaff =
    dataset.staff.find((item) => item.channels.includes("ponte_pila") || item.channels.includes("pilares")) ?? dataset.staff[0];
  return {
    role: "profesor_promotor",
    staffId: firstStaff?.id ?? null,
    displayName: firstStaff?.fullName ?? "Usuario operativo",
    dataType: "preparado"
  };
};

const buildInitialState = (dataset: OperationalModuleDataset): OperationLocalState => ({
  userSession: buildDefaultSession(dataset),
  students: [],
  enrollments: [],
  attendanceRecords: [],
  evidenceRecords: []
});

type ManualStudentInput = {
  classGroupId: string;
  fullName: string;
  sex: OperationStudentRecord["sex"];
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
        userSession: parsed.userSession ?? buildDefaultSession(dataset)
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
      const first = firstNames[seed % firstNames.length];
      const paternal = lastNames[(seed >> 3) % lastNames.length];
      const maternal = lastNames[(seed >> 6) % lastNames.length];
      const sex = seed % 2 === 0 ? "M" : "H";
      const studentId = `mock-student-${classGroup.id}-${index + 1}`;
      const enrollmentId = `mock-enrollment-${classGroup.id}-${index + 1}`;

      const student: OperationStudentRecord = {
        id: studentId,
        fullName: `${first} ${paternal} ${maternal}`,
        sex,
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

  const setStaff = (staff: OperationStaffRecord | null) => {
    setState((current) => ({
      ...current,
      userSession: {
        ...current.userSession,
        staffId: staff?.id ?? null,
        displayName: staff?.fullName ?? "Usuario operativo"
      }
    }));
  };

  const addManualStudent = ({ classGroupId, fullName, sex }: ManualStudentInput) => {
    const studentId = `manual-student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const enrollmentId = `manual-enrollment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const changedAt = new Date().toISOString();
    const sourceFile = "captura_local_operacion";
    setState((current) => ({
      ...current,
      students: [
        ...current.students,
        {
          id: studentId,
          fullName,
          sex,
          sourceFiles: [sourceFile],
          sourceType: "captura_manual",
          dataType: "preparado",
          methodologicalNote:
            "Alumno agregado manualmente en cliente para prototipo funcional. Debe persistirse en base de datos en la siguiente fase."
        }
      ],
      enrollments: [
        ...current.enrollments,
        {
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
              changedByUserId: current.userSession.staffId ?? "usuario-local",
              note: "Alta manual inicial"
            }
          ],
          dataType: "preparado",
          methodologicalNote:
            "Inscripción creada localmente para flujo prototipo. Debe migrarse a persistencia transaccional con historial."
        }
      ]
    }));
  };

  const updateEnrollmentStatus = ({ enrollmentId, status, changedByUserId, note }: EnrollmentStatusInput) => {
    const changedAt = new Date().toISOString();
    setState((current) => ({
      ...current,
      enrollments: current.enrollments.map((item) =>
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
      )
    }));
  };

  const addEvidence = ({ classGroupId, attendanceDate, uploadedByUserId, assetUrl, fileName, mimeType }: EvidenceInput) => {
    const evidenceId = `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: OperationEvidenceRecord = {
      id: evidenceId,
      classGroupId,
      attendanceDate,
      uploadedByUserId,
      capturedAt: new Date().toISOString(),
      assetUrl,
      fileName,
      mimeType,
      sourceType: "fotografia",
      dataType: "preparado",
      methodologicalNote:
        "Evidencia capturada en cliente para la primera versión funcional. Requiere storage persistente y control de acceso en siguiente fase."
    };
    setState((current) => ({
      ...current,
      evidenceRecords: [...current.evidenceRecords, record]
    }));
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
        id:
          existingIndex >= 0
            ? current.attendanceRecords[existingIndex].id
            : `attendance-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

      if (existingIndex >= 0) {
        const cloned = [...current.attendanceRecords];
        cloned[existingIndex] = nextRecord;
        return { ...current, attendanceRecords: cloned };
      }

      return {
        ...current,
        attendanceRecords: [...current.attendanceRecords, nextRecord]
      };
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

    return Array.from(baseEnrollments.values()).reduce<OperationClassRosterEntry[]>((acc, enrollment) => {
      if (enrollment.classGroupId !== classGroupId) return acc;
        const student = baseStudents.get(enrollment.studentId);
        if (!student) return acc;
        acc.push({
          student,
          enrollment,
          attendanceToday: attendanceByStudent.get(enrollment.studentId)
        });
        return acc;
      }, []).sort((a, b) => a.student.fullName.localeCompare(b.student.fullName, "es"));
  };

  return {
    hydrated,
    state,
    effectiveStaff,
    classesForSelectedStaff,
    classesByRole,
    getRosterForClass,
    setRole,
    setStaff,
    addManualStudent,
    updateEnrollmentStatus,
    addEvidence,
    markAttendance
  };
}
