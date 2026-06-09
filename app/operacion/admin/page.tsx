"use client";

import { useEffect, useMemo, useState } from "react";
import operationalDataset from "../../../data/processed/operacion/operacion-asistencia.json";
import useOperationMockState from "../../../lib/useOperationMockState";
import type { OperationalModuleDataset } from "../../../lib/operations-types";

export default function OperacionAdminPage() {
  const dataset = operationalDataset as OperationalModuleDataset;
  const { state } = useOperationMockState(dataset);
  const [channel, setChannel] = useState("todos");
  const [alcaldia, setAlcaldia] = useState("todas");
  const [venueId, setVenueId] = useState("todas");
  const [discipline, setDiscipline] = useState("todas");
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

  const venuesById = useMemo(
    () => new Map(dataset.venues.map((item) => [item.id, item])),
    []
  );

  const filteredClasses = useMemo(() => {
    return dataset.classGroups.filter((classGroup) => {
      const venue = venuesById.get(classGroup.venueId);
      const venueAlcaldia = venue?.alcaldia ?? "Sin alcaldía";
      const classDiscipline = classGroup.disciplineCatalog2026 ?? classGroup.activityName ?? "Sin disciplina";
      if (channel !== "todos" && classGroup.channel !== channel) return false;
      if (alcaldia !== "todas" && venueAlcaldia !== alcaldia) return false;
      if (venueId !== "todas" && classGroup.venueId !== venueId) return false;
      if (discipline !== "todas" && classDiscipline !== discipline) return false;
      return true;
    });
  }, [alcaldia, channel, dataset.classGroups, discipline, venueId, venuesById]);

  const classesToday = useMemo(
    () => (currentDay ? filteredClasses.filter((item) => item.weeklySchedule.some((slot) => slot.day === currentDay)).length : 0),
    [currentDay, filteredClasses]
  );

  const attendanceToday = useMemo(() => {
    if (!todayIso) return 0;
    return new Set(state.attendanceRecords.filter((item) => item.attendanceDate === todayIso).map((item) => item.classGroupId)).size;
  }, [state.attendanceRecords, todayIso]);

  const pendingClasses = Math.max(classesToday - attendanceToday, 0);
  const incidencias = useMemo(
    () =>
      todayIso
        ? state.attendanceRecords.filter(
            (item) => item.attendanceDate === todayIso && (item.status === "retardo" || item.status === "falta")
          ).length
        : 0,
    [state.attendanceRecords, todayIso]
  );
  const totalDisciplines = useMemo(
    () =>
      new Set(
        dataset.classGroups
          .map((item) => item.disciplineCatalog2026 ?? item.activityName)
          .filter((item): item is string => Boolean(item))
      ).size,
    [dataset.classGroups]
  );

  const filterOptions = useMemo(() => {
    const alcaldias = Array.from(
      new Set(
        dataset.classGroups
          .map((item) => venuesById.get(item.venueId)?.alcaldia)
          .filter((item): item is string => Boolean(item))
      )
    ).sort((a, b) => a.localeCompare(b, "es"));
    const venues = Array.from(
      new Set(dataset.classGroups.map((item) => item.venueId))
    )
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

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Total clases</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{filteredClasses.length.toLocaleString("es-MX")}</div>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Clases de hoy</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{classesToday.toLocaleString("es-MX")}</div>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Asistencias capturadas</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{attendanceToday.toLocaleString("es-MX")}</div>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Pendientes</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{pendingClasses.toLocaleString("es-MX")}</div>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Profesores / promotores</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{dataset.summary.staffCount.toLocaleString("es-MX")}</div>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Sedes</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{dataset.summary.venueCount.toLocaleString("es-MX")}</div>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Disciplinas</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{totalDisciplines.toLocaleString("es-MX")}</div>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Incidencias</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{incidencias.toLocaleString("es-MX")}</div>
        </article>
      </section>

      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Dirección / RH / admin</div>
          <h2 className="section-heading">Monitoreo base</h2>
          <p className="section-copy">
            Esta vista consolida filtros operativos y muestra una lectura inicial de cobertura del día. La asistencia aquí
            mostrada proviene de captura local mock, no de base transaccional.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Canal</span>
            <select className="input" value={channel} onChange={(event) => setChannel(event.target.value)}>
              <option value="todos">Todos</option>
              <option value="ponte_pila">Ponte Pila</option>
              <option value="pilares">PILARES</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Alcaldía</span>
            <select className="input" value={alcaldia} onChange={(event) => setAlcaldia(event.target.value)}>
              <option value="todas">Todas</option>
              {filterOptions.alcaldias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Sede</span>
            <select className="input" value={venueId} onChange={(event) => setVenueId(event.target.value)}>
              <option value="todas">Todas</option>
              {filterOptions.venues.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Disciplina</span>
            <select className="input" value={discipline} onChange={(event) => setDiscipline(event.target.value)}>
              <option value="todas">Todas</option>
              {filterOptions.disciplines.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Muestra operativa</div>
          <h2 className="section-heading">Clases filtradas</h2>
        </div>

        <div className="space-y-3">
          {filteredClasses.slice(0, 30).map((classGroup) => {
            const venue = venuesById.get(classGroup.venueId);
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
                  <div className="badge">{classGroup.channel === "ponte_pila" ? "Ponte Pila" : "PILARES"}</div>
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
      </section>
    </div>
  );
}
