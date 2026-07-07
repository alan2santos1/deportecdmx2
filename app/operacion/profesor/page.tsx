"use client";

import Link from "next/link";
import { useMemo } from "react";
import operationalDataset from "../../../data/processed/operacion/operacion-asistencia.json";
import SearchSelect from "../../../components/ui/SearchSelect";
import useOperationMockState from "../../../lib/useOperationMockState";
import type { AttendancePermissionRole, OperationalModuleDataset } from "../../../lib/operations-types";

const roleOptions: Array<{ value: AttendancePermissionRole; label: string }> = [
  { value: "profesor_promotor", label: "Profesor / promotor" },
  { value: "coordinador", label: "Coordinador" },
  { value: "lcpo", label: "LCPO" },
  { value: "rh", label: "RH" },
  { value: "direccion", label: "Dirección" },
  { value: "superadmin", label: "Superadmin" }
];

export default function OperacionProfesorPage() {
  const dataset = operationalDataset as OperationalModuleDataset;
  const { state, effectiveStaff, effectiveUser, classesForSelectedStaff, setRole, setStaff, activeStudentsCount } =
    useOperationMockState(dataset);

  const professorOptions = useMemo(
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
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Vista profesor</div>
          <h2 className="section-heading">Simulación de acceso operativo</h2>
          <p className="section-copy">
            Esta vista funciona como entrada simulada del profesor/promotor. El usuario seleccionado solo ve su carga operativa,
            sus sedes y sus grupos asignados.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-ink-800">Rol activo</span>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={state.userSession.role === role.value ? "tab tab-active" : "tab tab-inactive border border-mist-200"}
                  onClick={() => setRole(role.value)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Profesor / promotor</span>
            <SearchSelect
              value={effectiveStaff?.id ?? ""}
              options={professorOptions}
              onChange={(value) => {
                const next = dataset.staff.find((item) => item.id === value) ?? null;
                setStaff(next);
              }}
              placeholder="Seleccionar personal"
              searchPlaceholder="Buscar por nombre, disciplina o canal"
              emptyText="No hay personal visible para esta búsqueda."
            />
          </label>

          <div className="grid gap-3">
            <div className="stat-card">
              <div className="meta-label">Usuario simulado</div>
              <div className="mt-2 text-base font-semibold text-ink-900">{effectiveUser?.displayName ?? "Sin usuario vinculado"}</div>
              <p className="mt-2 text-sm text-ink-600">
                {effectiveUser ? `${effectiveUser.username} · ${effectiveUser.role.replace(/_/g, " ")}` : "Usuario mock pendiente"}
              </p>
            </div>
            <div className="stat-card">
              <div className="meta-label">Nombre normalizado</div>
              <div className="mt-2 text-base font-semibold text-ink-900">{effectiveStaff?.displayName ?? "Sin selección"}</div>
              <p className="mt-2 text-sm text-ink-600">Origen: {effectiveStaff?.rawFullName ?? "No documentado"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="stat-card">
                <div className="meta-label">Clases activas</div>
                <div className="mt-2 text-2xl font-semibold text-ink-900">{classesForSelectedStaff.length.toLocaleString("es-MX")}</div>
              </div>
              <div className="stat-card">
                <div className="meta-label">Horas semanales</div>
                <div className="mt-2 text-2xl font-semibold text-ink-900">{classSummary.totalHours.toLocaleString("es-MX")}</div>
              </div>
              <div className="stat-card">
                <div className="meta-label">Sedes</div>
                <div className="mt-2 text-2xl font-semibold text-ink-900">{classSummary.venues.length.toLocaleString("es-MX")}</div>
              </div>
              <div className="stat-card">
                <div className="meta-label">Matrícula mock activa</div>
                <div className="mt-2 text-2xl font-semibold text-ink-900">{activeStudentsCount.toLocaleString("es-MX")}</div>
              </div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Disciplinas asignadas</div>
              <div className="meta-value">
                {classSummary.disciplines.length ? classSummary.disciplines.join(" · ") : "Sin disciplinas documentadas"}
              </div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Horarios semanales</div>
              <div className="meta-value">
                {classSummary.schedules.length ? classSummary.schedules.join(" · ") : "Sin horarios documentados"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="section-kicker">Carga asignada</div>
            <h2 className="section-heading">{classesForSelectedStaff.length.toLocaleString("es-MX")} clases visibles</h2>
            <p className="section-copy">
              El profesor/promotor no ve clases ajenas. Cada tarjeta resume sede, disciplina, horario y acceso directo al pase
              de lista del día.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {classesForSelectedStaff.map((classGroup) => (
            <article key={classGroup.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-ink-900">
                    {classGroup.activityDetail ?? classGroup.activityName ?? classGroup.disciplineCatalog2026 ?? "Clase sin nombre"}
                  </div>
                  <p className="text-sm text-ink-700">{classGroup.venueName}</p>
                </div>
                <div className="badge">{classGroup.channel === "ponte_pila" ? "Ponte Pila" : "PILARES"}</div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="meta-label">Disciplina</div>
                  <div className="meta-value">{classGroup.disciplineCatalog2026 ?? classGroup.activityName ?? "No documentada"}</div>
                </div>
                <div>
                  <div className="meta-label">Horas</div>
                  <div className="meta-value">{classGroup.weeklyHours?.toLocaleString("es-MX") ?? "No documentadas"}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="meta-label">Horario semanal</div>
                  <div className="meta-value">
                    {classGroup.weeklySchedule.length
                      ? classGroup.weeklySchedule.map((slot) => `${slot.day}: ${slot.rawLabel}`).join(" · ")
                      : "Sin horario documentado"}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  className="btn-primary"
                  href={`/operacion/asistencia?classId=${encodeURIComponent(classGroup.id)}&staffId=${encodeURIComponent(classGroup.staffId)}`}
                >
                  Pasar lista
                </Link>
                <Link className="btn-ghost" href={`/operacion/clases?classId=${encodeURIComponent(classGroup.id)}`}>
                  Ver contexto
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
