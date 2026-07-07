"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import operationalDataset from "../../../data/processed/operacion/operacion-asistencia.json";
import SearchSelect from "../../../components/ui/SearchSelect";
import type { OperationalModuleDataset } from "../../../lib/operations-types";

export default function OperacionClasesPage() {
  const dataset = operationalDataset as OperationalModuleDataset;
  const searchParams = useSearchParams();
  const [channel, setChannel] = useState("todos");
  const [discipline, setDiscipline] = useState("todas");
  const [search, setSearch] = useState("");
  const highlightedClassId = searchParams.get("classId");

  const venuesById = useMemo(() => new Map(dataset.venues.map((item) => [item.id, item])), [dataset.venues]);

  const disciplineOptions = useMemo(
    () =>
      Array.from(
        new Set(
          dataset.classGroups
            .map((item) => item.disciplineCatalog2026 ?? item.activityName)
            .filter((item): item is string => Boolean(item))
        )
      ).sort((a, b) => a.localeCompare(b, "es")),
    [dataset.classGroups]
  );

  const filteredClasses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return dataset.classGroups.filter((classGroup) => {
      const disciplineName = classGroup.disciplineCatalog2026 ?? classGroup.activityName ?? "";
      const venue = venuesById.get(classGroup.venueId);
      if (channel !== "todos" && classGroup.channel !== channel) return false;
      if (discipline !== "todas" && disciplineName !== discipline) return false;
      if (!normalizedSearch) return true;
      return [classGroup.staffName, classGroup.venueName, disciplineName, venue?.alcaldia ?? ""].join(" ").toLowerCase().includes(normalizedSearch);
    });
  }, [channel, dataset.classGroups, discipline, search, venuesById]);

  return (
    <div className="flex flex-col gap-6">
      <section className="section-block">
        <div className="space-y-2">
          <div className="section-kicker">Catálogo operativo</div>
          <h2 className="section-heading">Clases y horarios</h2>
          <p className="section-copy">
            Vista transversal de grupos reales consolidados desde Ponte Pila y PILARES. La lectura está optimizada para consulta
            rápida desde móvil o escritorio.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_220px_280px]">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink-800">Buscar</span>
            <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Profesor, sede o disciplina" />
          </label>

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
            <span className="text-sm font-semibold text-ink-800">Disciplina</span>
            <SearchSelect
              value={discipline}
              options={[
                { value: "todas", label: "Todas las disciplinas" },
                ...disciplineOptions.map((item) => ({ value: item, label: item }))
              ]}
              onChange={setDiscipline}
            />
          </label>
        </div>
      </section>

      <section className="section-block">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="section-kicker">Resultado filtrado</div>
            <h2 className="section-heading">{filteredClasses.length.toLocaleString("es-MX")} clases visibles</h2>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {filteredClasses.slice(0, 60).map((classGroup) => {
            const venue = venuesById.get(classGroup.venueId);
            const highlighted = highlightedClassId === classGroup.id;
            return (
              <article key={classGroup.id} className={`card p-4 ${highlighted ? "border-accent-600 bg-accent-600/5 shadow-lg" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-ink-900">
                      {classGroup.activityDetail ?? classGroup.activityName ?? classGroup.disciplineCatalog2026 ?? "Clase sin nombre"}
                    </div>
                    <p className="text-sm text-ink-700">{classGroup.staffName}</p>
                  </div>
                  <div className="badge">{classGroup.channel === "ponte_pila" ? "Ponte Pila" : "PILARES"}</div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="meta-label">Sede</div>
                    <div className="meta-value">{classGroup.venueName}</div>
                  </div>
                  <div>
                    <div className="meta-label">Alcaldía</div>
                    <div className="meta-value">{venue?.alcaldia ?? "Sin alcaldía"}</div>
                  </div>
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
            );
          })}
        </div>
      </section>
    </div>
  );
}
