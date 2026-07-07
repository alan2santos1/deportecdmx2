"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import operationalDataset from "../../../data/processed/operacion/operacion-asistencia.json";
import SearchSelect from "../../../components/ui/SearchSelect";
import useOperationMockState from "../../../lib/useOperationMockState";
import type { OperationAttendanceRecord, OperationalModuleDataset } from "../../../lib/operations-types";

const getTodayIso = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

const attendanceOptions: Array<{
  value: OperationAttendanceRecord["status"];
  label: string;
  tone: string;
}> = [
  { value: "presente", label: "Presente", tone: "bg-emerald-600 text-white" },
  { value: "retardo", label: "Retardo", tone: "bg-amber-500 text-white" },
  { value: "falta", label: "Falta", tone: "bg-rose-600 text-white" },
  { value: "justificado", label: "Justificado", tone: "bg-slate-700 text-white" }
];

export default function OperacionAsistenciaPage() {
  const dataset = operationalDataset as OperationalModuleDataset;
  const searchParams = useSearchParams();
  const {
    state,
    effectiveStaff,
    effectiveUser,
    setStaff,
    addManualStudent,
    updateEnrollmentStatus,
    addEvidence,
    markAttendance,
    getRosterForClass
  } = useOperationMockState(dataset);

  const queryStaffId = searchParams.get("staffId");
  const queryClassId = searchParams.get("classId");

  const [selectedStaffId, setSelectedStaffId] = useState(queryStaffId ?? state.userSession.staffId ?? dataset.staff[0]?.id ?? "");
  const [selectedClassId, setSelectedClassId] = useState(queryClassId ?? "");
  const [selectedDate, setSelectedDate] = useState("");
  const [firstName, setFirstName] = useState("");
  const [paternalLastName, setPaternalLastName] = useState("");
  const [maternalLastName, setMaternalLastName] = useState("");
  const [studentSex, setStudentSex] = useState<"H" | "M" | "No documentado">("No documentado");
  const [studentAge, setStudentAge] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
  const [savedEvidenceId, setSavedEvidenceId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(getTodayIso());
  }, []);

  useEffect(() => {
    const nextStaff = dataset.staff.find((item) => item.id === selectedStaffId) ?? null;
    if (nextStaff) setStaff(nextStaff);
  }, [dataset.staff, selectedStaffId]);

  const staffOptions = useMemo(
    () =>
      dataset.staff.map((staff) => ({
        value: staff.id,
        label: staff.displayName,
        hint:
          [
            staff.channels.map((channel) => (channel === "ponte_pila" ? "Ponte Pila" : "PILARES")).join(" / "),
            staff.disciplines.slice(0, 2).join(" · ")
          ]
            .filter(Boolean)
            .join(" · ") || "Sin disciplina documentada",
        badge: `${staff.classGroupIds.length} clases`
      })),
    [dataset.staff]
  );

  const classesForSelectedStaff = useMemo(
    () => dataset.classGroups.filter((item) => item.staffId === selectedStaffId),
    [dataset.classGroups, selectedStaffId]
  );

  useEffect(() => {
    if (!classesForSelectedStaff.length) return;
    if (!selectedClassId || !classesForSelectedStaff.some((item) => item.id === selectedClassId)) {
      setSelectedClassId(classesForSelectedStaff[0].id);
    }
  }, [classesForSelectedStaff, selectedClassId]);

  const selectedClass = useMemo(
    () => classesForSelectedStaff.find((item) => item.id === selectedClassId) ?? classesForSelectedStaff[0] ?? null,
    [classesForSelectedStaff, selectedClassId]
  );

  const selectedStaff = useMemo(
    () => dataset.staff.find((item) => item.id === selectedStaffId) ?? effectiveStaff ?? null,
    [dataset.staff, effectiveStaff, selectedStaffId]
  );

  const classOptions = useMemo(
    () =>
      classesForSelectedStaff.map((classGroup) => ({
        value: classGroup.id,
        label: classGroup.activityDetail ?? classGroup.activityName ?? classGroup.disciplineCatalog2026 ?? "Clase",
        hint: `${classGroup.venueName} · ${classGroup.weeklySchedule.map((slot) => `${slot.day}: ${slot.rawLabel}`).join(" · ") || "Sin horario"}`,
        badge: classGroup.channel === "ponte_pila" ? "Ponte Pila" : "PILARES"
      })),
    [classesForSelectedStaff]
  );

  const roster = useMemo(() => (selectedClass ? getRosterForClass(selectedClass.id) : []), [getRosterForClass, selectedClass]);
  const invalidDate = selectedDate !== "" && selectedDate !== getTodayIso();
  const classesTodayCount = classesForSelectedStaff.filter((item) =>
    item.weeklySchedule.some(
      (slot) =>
        slot.day ===
        new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(new Date()).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    )
  ).length;
  const attendanceCapturedCount = roster.filter((item) => item.attendanceToday).length;

  const handleEvidencePreview = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(typeof reader.result === "string" ? reader.result : null);
      setPreviewFileName(file.name);
      setPreviewMimeType(file.type || null);
      setSavedEvidenceId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvidence = () => {
    if (!selectedClass || !previewUrl || invalidDate || !selectedDate) return;
    const evidence = addEvidence({
      classGroupId: selectedClass.id,
      attendanceDate: selectedDate,
      uploadedByUserId: effectiveUser?.userId ?? selectedStaff?.id ?? state.userSession.userId ?? "usuario-local",
      assetUrl: previewUrl,
      fileName: previewFileName,
      mimeType: previewMimeType
    });
    setSavedEvidenceId(evidence.id);
  };

  const handleCreateStudent = () => {
    if (!selectedClass || !firstName.trim() || !paternalLastName.trim()) return;
    addManualStudent({
      classGroupId: selectedClass.id,
      firstName,
      paternalLastName,
      maternalLastName,
      sex: studentSex,
      age: studentAge ? Number(studentAge) : null
    });
    setFirstName("");
    setPaternalLastName("");
    setMaternalLastName("");
    setStudentSex("No documentado");
    setStudentAge("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Captura diaria</div>
          <h2 className="section-heading">Pase de lista del día</h2>
          <p className="section-copy">
            La captura está bloqueada al día actual. Guarda usuario simulado, profesor, clase, timestamp y evidencia local.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-[28px] border border-mist-200 bg-mist-100/70 p-4 md:p-5">
            <div className="section-kicker">Paso 1</div>
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Profesor / promotor</span>
                <SearchSelect
                  value={selectedStaffId}
                  options={staffOptions}
                  onChange={(value) => {
                    setSelectedStaffId(value);
                    const nextStaff = dataset.staff.find((item) => item.id === value) ?? null;
                    setStaff(nextStaff);
                  }}
                  placeholder="Seleccionar personal"
                  searchPlaceholder="Buscar profesor o promotor"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Clase</span>
                <SearchSelect
                  value={selectedClass?.id ?? ""}
                  options={classOptions}
                  onChange={setSelectedClassId}
                  placeholder="Seleccionar clase"
                  searchPlaceholder="Buscar clase o sede"
                  emptyText="Este profesor todavía no tiene clases visibles."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Fecha habilitada</span>
                <input className="input" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              {invalidDate
                ? "La asistencia solo puede capturarse el día actual. No se permiten fechas pasadas ni futuras."
                : `Captura habilitada únicamente para ${getTodayIso()}. Las fechas fuera de hoy quedan bloqueadas.`}
            </div>
          </div>

          <div className="rounded-[28px] border border-mist-200 bg-white p-4 md:p-5">
            <div className="section-kicker">Paso 2</div>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-ink-900">Alumnos por clase</div>
                <p className="mt-2 text-sm leading-6 text-ink-600">
                  La matrícula sigue siendo mock/local, pero ya permite altas, bajas y registro diario con estado de asistencia.
                </p>
              </div>
              <div className="badge">{attendanceCapturedCount} capturas hoy</div>
            </div>

            <div className="mt-5 grid gap-4 rounded-[24px] border border-mist-200 bg-mist-100/60 p-4 lg:grid-cols-2 xl:grid-cols-5">
              <label className="block space-y-2 xl:col-span-2">
                <span className="text-sm font-semibold text-ink-800">Nombre</span>
                <input className="input" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Nombre" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Apellido paterno</span>
                <input
                  className="input"
                  value={paternalLastName}
                  onChange={(event) => setPaternalLastName(event.target.value)}
                  placeholder="Apellido paterno"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Apellido materno</span>
                <input
                  className="input"
                  value={maternalLastName}
                  onChange={(event) => setMaternalLastName(event.target.value)}
                  placeholder="Apellido materno"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Sexo</span>
                <SearchSelect
                  value={studentSex}
                  options={[
                    { value: "No documentado", label: "Sin dato" },
                    { value: "H", label: "Hombre" },
                    { value: "M", label: "Mujer" }
                  ]}
                  onChange={(value) => setStudentSex(value as typeof studentSex)}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Edad</span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="99"
                  value={studentAge}
                  onChange={(event) => setStudentAge(event.target.value)}
                  placeholder="Opcional"
                />
              </label>
              <div className="flex items-end xl:col-span-5">
                <button
                  className="btn-primary w-full"
                  type="button"
                  onClick={handleCreateStudent}
                  disabled={!selectedClass || !firstName.trim() || !paternalLastName.trim()}
                >
                  Agregar alumno a la clase
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {!roster.length ? (
                <div className="rounded-3xl border border-dashed border-mist-300 bg-white/80 p-6 text-sm leading-6 text-ink-600">
                  Esta clase todavía no tiene alumnos visibles. Puedes iniciar con altas manuales para probar el flujo.
                </div>
              ) : null}

              {roster.map(({ student, enrollment, attendanceToday }) => (
                <article key={enrollment.id} className="meta-panel">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-ink-900">{student.displayName}</div>
                      <p className="text-sm text-ink-700">
                        {student.age ? `${student.age} años · ` : ""}
                        {student.sex === "No documentado" ? "Sexo sin dato" : student.sex}
                        {" · "}
                        {student.sourceType === "captura_manual" ? "Captura manual" : "Fuente nominal"}
                      </p>
                      <p className="text-xs leading-5 text-ink-600">
                        Inscripción {enrollment.status} · Calidad de dato {student.dataType} · Origen {student.rawFullName}
                      </p>
                    </div>
                    <button
                      className="btn-ghost"
                      type="button"
                      onClick={() =>
                        updateEnrollmentStatus({
                          enrollmentId: enrollment.id,
                          status: enrollment.status === "activa" ? "baja" : "activa",
                          changedByUserId: effectiveUser?.userId ?? selectedStaff?.id ?? "usuario-local",
                          note: enrollment.status === "activa" ? "Baja manual desde operación" : "Reactivación manual desde operación"
                        })
                      }
                    >
                      {enrollment.status === "activa" ? "Dar de baja" : "Reactivar"}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {attendanceOptions.map((statusOption) => (
                      <button
                        key={statusOption.value}
                        className={
                          attendanceToday?.status === statusOption.value ? `btn ${statusOption.tone}` : "btn-ghost"
                        }
                        type="button"
                        disabled={invalidDate || enrollment.status !== "activa" || !selectedClass || !selectedStaff}
                        onClick={() =>
                          selectedClass &&
                          selectedStaff &&
                          markAttendance({
                            classGroupId: selectedClass.id,
                            studentId: student.id,
                            status: statusOption.value,
                            recordedByUserId: effectiveUser?.userId ?? state.userSession.userId ?? selectedStaff.id,
                            staffId: selectedStaff.id,
                            staffName: selectedStaff.displayName,
                            evidenceAssetId: savedEvidenceId
                          })
                        }
                      >
                        {statusOption.label}
                      </button>
                    ))}
                  </div>

                  {attendanceToday ? (
                    <p className="mt-3 text-sm text-ink-600">
                      Capturado a las {attendanceToday.attendanceTime} por {attendanceToday.staffName}. Estado: {attendanceToday.status}.
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Paso 3</div>
          <h2 className="section-heading">Evidencia y control del día</h2>
        </div>

        <div className="space-y-4">
          <div className="stat-card">
            <div className="meta-label">Usuario activo</div>
            <div className="mt-2 text-base font-semibold text-ink-900">{effectiveUser?.displayName ?? state.userSession.displayName}</div>
            <p className="mt-2 text-sm text-ink-600">{effectiveUser?.username ?? "usuario-local"} · {state.userSession.role}</p>
          </div>
          <div className="stat-card">
            <div className="meta-label">Clase seleccionada</div>
            <div className="mt-2 text-base font-semibold text-ink-900">
              {selectedClass
                ? `${selectedClass.activityDetail ?? selectedClass.activityName ?? selectedClass.disciplineCatalog2026 ?? "Clase"}`
                : "Sin clase seleccionada"}
            </div>
            <p className="mt-2 text-sm text-ink-600">{selectedClass?.venueName ?? "Sin sede"} · {classesTodayCount} clases hoy</p>
          </div>
          <div className="stat-card">
            <div className="meta-label">Último guardado</div>
            <div className="mt-2 text-base font-semibold text-ink-900">{savedEvidenceId ? "Evidencia asociada" : "Sin evidencia guardada"}</div>
            <p className="mt-2 text-sm text-ink-600">{savedEvidenceId ?? "Aún no se genera metadata local."}</p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Subir evidencia fotográfica</span>
            <input className="input" type="file" accept="image/*" onChange={handleEvidencePreview} />
          </label>

          {previewUrl ? (
            <div className="overflow-hidden rounded-3xl border border-mist-200 bg-white">
              <img src={previewUrl} alt="Vista previa de evidencia" className="h-72 w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-mist-300 bg-white/80 p-6 text-sm text-ink-600">
              La evidencia se asocia a la lista del día y se conserva solo en el navegador en esta fase.
            </div>
          )}

          <button className="btn-primary w-full" type="button" disabled={!previewUrl || !selectedClass || invalidDate} onClick={handleSaveEvidence}>
            Asociar evidencia al pase de lista
          </button>

          <div className="meta-panel">
            <div className="meta-label">Regla activa</div>
            <div className="meta-value">No se permite captura retroactiva ni futura. La bitácora y evidencia siguen en `localStorage`.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
