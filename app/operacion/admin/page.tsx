"use client";

import { useEffect, useMemo, useState } from "react";
import operationalDataset from "../../../data/processed/operacion/operacion-asistencia.json";
import SearchSelect from "../../../components/ui/SearchSelect";
import useOperationMockState from "../../../lib/useOperationMockState";
import type { OperationalModuleDataset } from "../../../lib/operations-types";

export default function OperacionAdminPage() {
  const dataset = operationalDataset as OperationalModuleDataset;
  const { state, activeStudentsCount } = useOperationMockState(dataset);
  const [channel, setChannel] = useState("todos");
  const [alcaldia, setAlcaldia] = useState("todas");
  const [venueId, setVenueId] = useState("todas");
  const [discipline, setDiscipline] = useState("todas");
  const [staffId, setStaffId] = useState("todos");
  const [todayIso, setTodayIso] = useState("");
  const [currentDay, setCurrentDay] = useState("");

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    setTodayIso(new Date(now.getTime() - offset).toISOString().slice(0, 10));
    setCurrentDay(
      new Intl.DateTimeFormat("es-MX", { weekday: "long" })
        .format(now)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    );
  }, []);

  const venuesById = useMemo(() => new Map(dataset.venues.map((item) => [item.id, item])), [dataset.venues]);
  const staffById = useMemo(() => new Map(dataset.staff.map((item) => [item.id, item])), [dataset.staff]);

  const filterOptions = useMemo(() => {
    const alcaldias = Array.from(
      new Set(
        dataset.classGroups
          .map((item) => venuesById.get(item.venueId)?.alcaldia)
          .filter((item): item is string => Boolean(item))
      )
    ).sort((a, b) => a.localeCompare(b, "es"));
    const venues = Array.from(new Set(dataset.classGroups.map((item) => item.venueId)))
      .map((id) => venuesById.get(id))
      .filter(Boolean)
      .sort((a, b) => a!.name.localeCompare(b!.name, "es")) as NonNullable<ReturnType<typeof venuesById.get>>[];
    const disciplines = Array.from(
      new Set(
        dataset.classGroups
          .map((item) => item.disciplineCatalog2026 ?? item.activityName)
          .filter((item): item is string => Boolean(item))
      )
    ).sort((a, b) => a.localeCompare(b, "es"));
    return { alcaldias, venues, disciplines };
  }, [dataset.classGroups, venuesById]);

  const filteredClasses = useMemo(() => {
    return dataset.classGroups.filter((classGroup) => {
      const venue = venuesById.get(classGroup.venueId);
      const venueAlcaldia = venue?.alcaldia ?? "Sin alcaldía";
      const classDiscipline = classGroup.disciplineCatalog2026 ?? classGroup.activityName ?? "Sin disciplina";
      if (channel !== "todos" && classGroup.channel !== channel) return false;
      if (alcaldia !== "todas" && venueAlcaldia !== alcaldia) return false;
      if (venueId !== "todas" && classGroup.venueId !== venueId) return false;
      if (discipline !== "todas" && classDiscipline !== discipline) return false;
      if (staffId !== "todos" && classGroup.staffId !== staffId) return false;
      return true;
    });
  }, [alcaldia, channel, dataset.classGroups, discipline, staffId, venueId, venuesById]);

  const classesToday = useMemo(
    () => (currentDay ? filteredClasses.filter((item) => item.weeklySchedule.some((slot) => slot.day === currentDay)).length : 0),
    [currentDay, filteredClasses]
  );

  const attendanceTodayRecords = useMemo(
    () => (todayIso ? state.attendanceRecords.filter((item) => item.attendanceDate === todayIso) : []),
    [state.attendanceRecords, todayIso]
  );

  const attendanceTodayClassIds = useMemo(
    () => new Set(attendanceTodayRecords.map((item) => item.classGroupId)),
    [attendanceTodayRecords]
  );

  const pendingClasses = Math.max(classesToday - attendanceTodayClassIds.size, 0);
  const incidencias = attendanceTodayRecords.filter((item) => item.status === "retardo" || item.status === "falta").length;
  const recentLists = [...attendanceTodayRecords]
    .sort((a, b) => `${b.attendanceDate}${b.attendanceTime}`.localeCompare(`${a.attendanceDate}${a.attendanceTime}`))
    .slice(0, 8);
  const pendingTeachers = filteredClasses
    .filter((item) => item.weeklySchedule.some((slot) => slot.day === currentDay) && !attendanceTodayClassIds.has(item.id))
    .slice(0, 8);

  const staffOptions = dataset.staff
    .map((staff) => ({
      value: staff.id,
      label: staff.displayName,
      hint: staff.disciplines.slice(0, 2).join(" · ") || "Sin disciplina documentada",
      badge: `${staff.classGroupIds.length} clases`
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  const totalDisciplines = useMemo(
    () =>
      new Set(
        dataset.classGroups
          .map((item) => item.disciplineCatalog2026 ?? item.activityName)
          .filter((item): item is string => Boolean(item))
      ).size,
    [dataset.classGroups]
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
        <article className="stat-card">
          <div className="meta-label">Total personal</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{dataset.summary.staffCount.toLocaleString("es-MX")}</div>
        </article>
        <article className="stat-card">
          <div className="meta-label">Total clases</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{filteredClasses.length.toLocaleString("es-MX")}</div>
        </article>
        <article className="stat-card">
          <div className="meta-label">Clases de hoy</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{classesToday.toLocaleString("es-MX")}</div>
        </article>
        <article className="stat-card">
          <div className="meta-label">Listas capturadas</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{attendanceTodayClassIds.size.toLocaleString("es-MX")}</div>
        </article>
        <article className="stat-card">
          <div className="meta-label">Pendientes</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{pendingClasses.toLocaleString("es-MX")}</div>
        </article>
        <article className="stat-card">
          <div className="meta-label">Alumnos activos</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{activeStudentsCount.toLocaleString("es-MX")}</div>
        </article>
        <article className="stat-card">
          <div className="meta-label">Incidencias</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{incidencias.toLocaleString("es-MX")}</div>
        </article>
        <article className="stat-card">
          <div className="meta-label">Evidencias</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{state.evidenceRecords.length.toLocaleString("es-MX")}</div>
        </article>
      </section>

      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Dirección / RH</div>
          <h2 className="section-heading">Supervisión operativa del día</h2>
          <p className="section-copy">
            Esta vista combina programación real con captura local mock. Permite revisar cobertura, pendientes y trazabilidad
            sin depender todavía de base de datos productiva.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-ink-800">Canal</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "todos", label: "Todos" },
                { value: "ponte_pila", label: "Ponte Pila" },
                { value: "pilares", label: "PILARES" }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={channel === item.value ? "tab tab-active" : "tab tab-inactive border border-mist-200"}
                  onClick={() => setChannel(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Alcaldía</span>
            <SearchSelect
              value={alcaldia}
              options={[
                { value: "todas", label: "Todas las alcaldías" },
                ...filterOptions.alcaldias.map((item) => ({ value: item, label: item }))
              ]}
              onChange={setAlcaldia}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Sede</span>
            <SearchSelect
              value={venueId}
              options={[
                { value: "todas", label: "Todas las sedes" },
                ...filterOptions.venues.map((item) => ({
                  value: item.id,
                  label: item.name,
                  hint: `${item.alcaldia ?? "Sin alcaldía"} · ${item.channel === "ponte_pila" ? "Ponte Pila" : "PILARES"}`
                }))
              ]}
              onChange={setVenueId}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Disciplina</span>
            <SearchSelect
              value={discipline}
              options={[
                { value: "todas", label: "Todas las disciplinas" },
                ...filterOptions.disciplines.map((item) => ({ value: item, label: item }))
              ]}
              onChange={setDiscipline}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Profesor / promotor</span>
            <SearchSelect
              value={staffId}
              options={[{ value: "todos", label: "Todo el personal" }, ...staffOptions]}
              onChange={setStaffId}
            />
          </label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="section-block">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <div className="section-kicker">Programación filtrada</div>
              <h2 className="section-heading">{filteredClasses.length.toLocaleString("es-MX")} clases visibles</h2>
            </div>
            <div className="badge">{totalDisciplines} disciplinas documentadas</div>
          </div>

          <div className="space-y-3">
            {filteredClasses.slice(0, 30).map((classGroup) => {
              const venue = venuesById.get(classGroup.venueId);
              const captured = attendanceTodayClassIds.has(classGroup.id);
              return (
                <article key={classGroup.id} className="meta-panel">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink-900">
                        {classGroup.activityDetail ?? classGroup.activityName ?? classGroup.disciplineCatalog2026 ?? "Clase sin nombre"}
                      </div>
                      <p className="mt-1 text-sm text-ink-700">
                        {classGroup.staffName} · {venue?.name ?? classGroup.venueName}
                      </p>
                    </div>
                    <div className={captured ? "badge bg-emerald-50 text-emerald-700" : "badge bg-amber-50 text-amber-800"}>
                      {captured ? "Lista capturada" : "Pendiente"}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div>
                      <div className="meta-label">Alcaldía</div>
                      <div className="meta-value">{venue?.alcaldia ?? "Sin alcaldía"}</div>
                    </div>
                    <div>
                      <div className="meta-label">Disciplina</div>
                      <div className="meta-value">{classGroup.disciplineCatalog2026 ?? classGroup.activityName ?? "No documentada"}</div>
                    </div>
                    <div>
                      <div className="meta-label">Horario</div>
                      <div className="meta-value">
                        {classGroup.weeklySchedule.length
                          ? classGroup.weeklySchedule.map((slot) => `${slot.day}: ${slot.rawLabel}`).join(" · ")
                          : "Sin horario"}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <aside className="section-block">
          <div className="space-y-2">
            <div className="section-kicker">Seguimiento del día</div>
            <h2 className="section-heading">Alertas y últimas capturas</h2>
          </div>

          <div className="space-y-4">
            <div className="meta-panel">
              <div className="meta-label">Profesores sin lista hoy</div>
              <div className="meta-value">{pendingTeachers.length.toLocaleString("es-MX")} visibles</div>
            </div>
            {pendingTeachers.length ? (
              <div className="space-y-3">
                {pendingTeachers.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-mist-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-ink-900">{staffById.get(item.staffId)?.displayName ?? item.staffName}</div>
                    <div className="mt-1 text-sm text-ink-600">
                      {item.activityDetail ?? item.activityName ?? item.disciplineCatalog2026 ?? "Clase"} · {item.venueName}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-mist-300 bg-white/80 px-4 py-5 text-sm text-ink-600">
                No hay pendientes visibles con los filtros actuales.
              </div>
            )}

            <div className="meta-panel">
              <div className="meta-label">Últimas listas guardadas</div>
              <div className="meta-value">{recentLists.length.toLocaleString("es-MX")} registros recientes</div>
            </div>
            {recentLists.length ? (
              <div className="space-y-3">
                {recentLists.map((item) => {
                  const classGroup = dataset.classGroups.find((classItem) => classItem.id === item.classGroupId);
                  return (
                    <div key={item.id} className="rounded-2xl border border-mist-200 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-ink-900">{classGroup?.venueName ?? item.classGroupId}</div>
                          <div className="mt-1 text-sm text-ink-600">{item.staffName} · {item.attendanceTime}</div>
                        </div>
                        <div className="badge">{item.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-mist-300 bg-white/80 px-4 py-5 text-sm text-ink-600">
                Aún no hay capturas en esta sesión del navegador.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
