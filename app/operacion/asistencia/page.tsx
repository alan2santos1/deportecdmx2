"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import operationalDataset from "../../../data/processed/operacion/operacion-asistencia.json";
import useOperationMockState from "../../../lib/useOperationMockState";
import type { OperationalModuleDataset } from "../../../lib/operations-types";

const getTodayIso = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

export default function OperacionAsistenciaPage() {
  const dataset = operationalDataset as OperationalModuleDataset;
  const searchParams = useSearchParams();
  const {
    state,
    effectiveStaff,
    classesByRole,
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
  const [studentName, setStudentName] = useState("");
  const [studentSex, setStudentSex] = useState<"H" | "M" | "No documentado">("No documentado");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
  const [savedEvidenceId, setSavedEvidenceId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(getTodayIso());
  }, []);

  useEffect(() => {
    const nextStaff = dataset.staff.find((item) => item.id === selectedStaffId) ?? null;
    setStaff(nextStaff);
  }, [dataset.staff, selectedStaffId]);

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

  const roster = useMemo(() => (selectedClass ? getRosterForClass(selectedClass.id) : []), [getRosterForClass, selectedClass]);

  const invalidDate = selectedDate !== "" && selectedDate !== getTodayIso();

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
      uploadedByUserId: selectedStaff?.id ?? state.userSession.staffId ?? "usuario-local",
      assetUrl: previewUrl,
      fileName: previewFileName,
      mimeType: previewMimeType
    });
    setSavedEvidenceId(evidence.id);
  };

  const handleCreateStudent = () => {
    if (!selectedClass || !studentName.trim()) return;
    addManualStudent({
      classGroupId: selectedClass.id,
      fullName: studentName.trim(),
      sex: studentSex
    });
    setStudentName("");
    setStudentSex("No documentado");
  };

  const classesTodayCount = classesForSelectedStaff.filter((item) =>
    item.weeklySchedule.some((slot) => slot.day === new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(new Date()).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
  ).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Flujo operativo</div>
          <h2 className="section-heading">Pase de lista funcional</h2>
          <p className="section-copy">
            La captura opera en tres pasos: profesor, clase y fecha del día. La persistencia sigue siendo local, pero el flujo
            ya guarda timestamp, clase, profesor, usuario y estado de asistencia.
          </p>
        </div>

        <div className="grid gap-5">
          <div className="rounded-3xl border border-mist-200 bg-mist-100/70 p-5">
            <div className="section-kicker">Paso 1</div>
            <div className="mt-3 grid gap-4 lg:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Profesor / promotor</span>
                <select
                  className="input"
                  value={selectedStaffId}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    setSelectedStaffId(nextId);
                    const nextStaff = dataset.staff.find((item) => item.id === nextId) ?? null;
                    setStaff(nextStaff);
                  }}
                >
                  {dataset.staff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Clase</span>
                <select className="input" value={selectedClass?.id ?? ""} onChange={(event) => setSelectedClassId(event.target.value)}>
                  {classesForSelectedStaff.map((classGroup) => (
                    <option key={classGroup.id} value={classGroup.id}>
                      {classGroup.activityDetail ?? classGroup.activityName ?? classGroup.disciplineCatalog2026 ?? "Clase"} · {classGroup.venueName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Fecha</span>
                <input className="input" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
            </div>
            {invalidDate ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                La asistencia solo puede capturarse el día actual. No se permiten fechas pasadas ni futuras.
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                La fecha habilitada es únicamente {getTodayIso()}. La captura retroactiva y anticipada queda bloqueada.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-mist-200 bg-white p-5">
            <div className="section-kicker">Paso 2</div>
            <div className="mt-2 text-lg font-semibold text-ink-900">Alumnos y estado de asistencia</div>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              Los alumnos base se generan de forma mock coherente desde cada clase. Las altas manuales y las bajas se conservan
              en historial local.
            </p>

            <div className="mt-5 grid gap-4 rounded-3xl border border-mist-200 bg-mist-100/60 p-5 lg:grid-cols-[1fr_180px_160px]">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Agregar alumno manualmente</span>
                <input className="input" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Nombre completo" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-800">Sexo</span>
                <select className="input" value={studentSex} onChange={(event) => setStudentSex(event.target.value as typeof studentSex)}>
                  <option value="No documentado">No documentado</option>
                  <option value="H">H</option>
                  <option value="M">M</option>
                </select>
              </label>
              <div className="flex items-end">
                <button className="btn-primary w-full" type="button" onClick={handleCreateStudent} disabled={!selectedClass || !studentName.trim()}>
                  Agregar
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {!roster.length ? (
                <div className="rounded-3xl border border-dashed border-mist-300 bg-white/80 p-6 text-sm leading-6 text-ink-600">
                  Esta clase todavía no tiene alumnos visibles. Puedes iniciar con altas manuales para probar el flujo.
                </div>
              ) : null}

              {roster.map(({ student, enrollment, attendanceToday }) => {
                if (!student) return null;
                return (
                  <article key={enrollment.id} className="meta-panel">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink-900">{student.fullName}</div>
                        <p className="mt-1 text-sm text-ink-700">
                          Inscripción: {enrollment.status} · Fuente: {student.sourceType === "captura_manual" ? "Manual" : "Mock"}
                        </p>
                      </div>
                      <button
                        className="btn-ghost"
                        type="button"
                        onClick={() =>
                          updateEnrollmentStatus({
                            enrollmentId: enrollment.id,
                            status: enrollment.status === "activa" ? "baja" : "activa",
                            changedByUserId: selectedStaff?.id ?? "usuario-local",
                            note: enrollment.status === "activa" ? "Baja manual desde operación" : "Reactivación manual desde operación"
                          })
                        }
                      >
                        {enrollment.status === "activa" ? "Dar de baja" : "Reactivar"}
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(["presente", "retardo", "falta"] as const).map((status) => (
                        <button
                          key={status}
                          className={attendanceToday?.status === status ? "btn-primary" : "btn-ghost"}
                          type="button"
                          disabled={invalidDate || enrollment.status !== "activa" || !selectedClass || !selectedStaff}
                          onClick={() =>
                            selectedClass &&
                            selectedStaff &&
                            markAttendance({
                              classGroupId: selectedClass.id,
                              studentId: student.id,
                              status,
                              recordedByUserId: state.userSession.staffId ?? selectedStaff.id,
                              staffId: selectedStaff.id,
                              staffName: selectedStaff.fullName,
                              evidenceAssetId: savedEvidenceId
                            })
                          }
                        >
                          {status === "retardo" ? "retardó" : status}
                        </button>
                      ))}
                    </div>

                    {attendanceToday ? (
                      <p className="mt-3 text-sm text-ink-600">
                        Capturado a las {attendanceToday.attendanceTime} por {attendanceToday.staffName}.
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Paso 3</div>
          <h2 className="section-heading">Evidencia y resumen del día</h2>
        </div>

        <div className="space-y-4">
          <div className="meta-panel">
            <div className="meta-label">Profesor visible</div>
            <div className="meta-value">{selectedStaff?.fullName ?? "Sin selección"}</div>
          </div>
          <div className="meta-panel">
            <div className="meta-label">Clase seleccionada</div>
            <div className="meta-value">
              {selectedClass
                ? `${selectedClass.activityDetail ?? selectedClass.activityName ?? selectedClass.disciplineCatalog2026 ?? "Clase"} · ${selectedClass.venueName}`
                : "Sin clase seleccionada"}
            </div>
          </div>
          <div className="meta-panel">
            <div className="meta-label">Clases del día para este profesor</div>
            <div className="meta-value">{classesTodayCount.toLocaleString("es-MX")}</div>
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
              La evidencia queda preparada para asociarse a la asistencia del día. Aún no se envía a storage real.
            </div>
          )}

          <button className="btn-primary w-full" type="button" disabled={!previewUrl || !selectedClass || invalidDate} onClick={handleSaveEvidence}>
            Asociar evidencia al pase de lista
          </button>

          <div className="meta-panel">
            <div className="meta-label">Estado de guardado</div>
            <div className="meta-value">
              {savedEvidenceId
                ? `Evidencia asociada localmente con id ${savedEvidenceId}`
                : "Sin evidencia guardada todavía"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
