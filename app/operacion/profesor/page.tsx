"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import operationalDataset from "../../../data/processed/operacion/operacion-asistencia.json";
import useOperationMockState from "../../../lib/useOperationMockState";
import type { AttendancePermissionRole, OperationalModuleDataset } from "../../../lib/operations-types";

const roleOptions: AttendancePermissionRole[] = [
  "profesor_promotor",
  "subcoordinacion",
  "lcpo",
  "rh",
  "admin",
  "direccion"
];

export default function OperacionProfesorPage() {
  const dataset = operationalDataset as OperationalModuleDataset;
  const { state, effectiveStaff, classesForSelectedStaff, setRole, setStaff } = useOperationMockState(dataset);
  const [search, setSearch] = useState("");

  const visibleStaff = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return dataset.staff;
    return dataset.staff.filter((staff) =>
      [staff.fullName, staff.disciplines.join(" "), staff.activities.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [dataset.staff, search]);

  const classSummary = useMemo(() => {
    const venues = Array.from(new Set(classesForSelectedStaff.map((item) => item.venueName))).sort((a, b) => a.localeCompare(b, "es"));
    const disciplines = Array.from(
      new Set(
        classesForSelectedStaff
          .map((item) => item.disciplineCatalog2026 ?? item.activityName)
          .filter((item): item is string => Boolean(item))
      )
    ).sort((a, b) => a.localeCompare(b, "es"));
    const schedules = Array.from(
      new Set(
        classesForSelectedStaff.flatMap((item) => item.weeklySchedule.map((slot) => `${slot.day}: ${slot.rawLabel}`))
      )
    );
    const totalHours = classesForSelectedStaff.reduce((sum, item) => sum + (item.weeklyHours ?? 0), 0);
    return { venues, disciplines, schedules, totalHours };
  }, [classesForSelectedStaff]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Vista profesor</div>
          <h2 className="section-heading">Profesor / promotor navegable</h2>
          <p className="section-copy">
            Selección operativa de personal con búsqueda por nombre y lectura inmediata de sedes, disciplinas, horarios y carga
            semanal.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Rol operativo</span>
            <select className="input" value={state.userSession.role} onChange={(event) => setRole(event.target.value as AttendancePermissionRole)}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Buscar profesor / promotor</span>
            <input
              className="input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, disciplina o actividad"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Profesor / promotor</span>
            <select
              className="input"
              value={effectiveStaff?.id ?? ""}
              onChange={(event) => {
                const next = dataset.staff.find((item) => item.id === event.target.value) ?? null;
                setStaff(next);
              }}
            >
              {visibleStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.fullName}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="meta-panel">
              <div className="meta-label">Nombre</div>
              <div className="meta-value">{effectiveStaff?.fullName ?? "Sin selección"}</div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Canal</div>
              <div className="meta-value">{effectiveStaff?.channels.join(", ") ?? "No documentado"}</div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Clases activas</div>
              <div className="meta-value">{classesForSelectedStaff.length.toLocaleString("es-MX")}</div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Total horas</div>
              <div className="meta-value">{classSummary.totalHours.toLocaleString("es-MX")}</div>
            </div>
          </div>

          <div className="meta-panel">
            <div className="meta-label">Disciplinas asignadas</div>
            <div className="meta-value">
              {classSummary.disciplines.length ? classSummary.disciplines.join(", ") : "No documentadas"}
            </div>
          </div>
          <div className="meta-panel">
            <div className="meta-label">Sedes asignadas</div>
            <div className="meta-value">{classSummary.venues.length ? classSummary.venues.join(", ") : "Sin sedes visibles"}</div>
          </div>
          <div className="meta-panel">
            <div className="meta-label">Horarios semanales</div>
            <div className="meta-value">
              {classSummary.schedules.length ? classSummary.schedules.join(" · ") : "Sin horarios documentados"}
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Clases operativas</div>
          <h2 className="section-heading">{classesForSelectedStaff.length.toLocaleString("es-MX")} clases activas</h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {classesForSelectedStaff.slice(0, 30).map((classGroup) => (
            <article key={classGroup.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-ink-900">
                    {classGroup.activityDetail ?? classGroup.activityName ?? classGroup.disciplineCatalog2026 ?? "Clase sin nombre"}
                  </div>
                  <p className="text-sm text-ink-700">{classGroup.venueName}</p>
                </div>
                <div className="badge">{classGroup.channel === "ponte_pila" ? "Ponte Pila" : "PILARES"}</div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="meta-label">Disciplina</div>
                  <div className="meta-value">{classGroup.disciplineCatalog2026 ?? classGroup.activityName ?? "No documentada"}</div>
                </div>
                <div>
                  <div className="meta-label">Horas semanales</div>
                  <div className="meta-value">{classGroup.weeklyHours?.toLocaleString("es-MX") ?? "No documentadas"}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="meta-label">Horario semanal</div>
                  <div className="meta-value">
                    {classGroup.weeklySchedule.length
                      ? classGroup.weeklySchedule.map((slot) => `${slot.day}: ${slot.rawLabel}`).join(" · ")
                      : "Sin horario documentado"}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Link className="btn-primary" href={`/operacion/asistencia?classId=${encodeURIComponent(classGroup.id)}&staffId=${encodeURIComponent(classGroup.staffId)}`}>
                  Pasar lista
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
