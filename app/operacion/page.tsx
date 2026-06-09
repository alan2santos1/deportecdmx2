import operationalDataset from "../../data/processed/operacion/operacion-asistencia.json";
import type { OperationalModuleDataset } from "../../lib/operations-types";

const numberFormat = new Intl.NumberFormat("es-MX");
const dataset = operationalDataset as OperationalModuleDataset;

export default function OperacionPage() {
  const topRoutes = dataset.routeProposals.slice(0, 6);
  const topRules = dataset.attendanceCaptureRules;
  const topNotes = dataset.meta.notes;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Personal operativo</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.staffCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Promotores, entrenadores y animadores consolidados desde ambas fuentes.</p>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Sedes</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.venueCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Puntos Ponte Pila y sedes PILARES con referencia operativa.</p>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Clases / grupos</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.classGroupCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Configuración semanal derivada de mallas reales, aún sin asistencia transaccional.</p>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Alumnos nominales</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.studentCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Pendiente de fuente nominal confiable por grupo o por clase.</p>
        </article>
        <article className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Asistencia capturada</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.attendanceRecordCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Queda lista la estructura; las fuentes actuales no traen captura diaria.</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="section-block">
          <div className="space-y-2">
            <div className="section-kicker">Qué ya existe</div>
            <h2 className="section-heading">Cobertura operativa real</h2>
            <p className="section-copy">
              El parser ya consolida clases de Ponte Pila y PILARES a partir de mallas reales, con personal asignado,
              sede, disciplina, modalidad, horario por día y referencias de coordinación.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="meta-panel">
              <div className="meta-label">Clases Ponte Pila</div>
              <div className="meta-value">{numberFormat.format(dataset.summary.puentePilaClassCount)}</div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Clases PILARES</div>
              <div className="meta-value">{numberFormat.format(dataset.summary.pilaresClassCount)}</div>
            </div>
          </div>
          <div className="subtle-divider space-y-3">
            <div className="text-sm font-semibold text-ink-900">Notas metodológicas</div>
            {topNotes.map((note) => (
              <p key={note} className="text-sm leading-6 text-ink-700">
                {note}
              </p>
            ))}
          </div>
        </article>

        <article className="section-block">
          <div className="space-y-2">
            <div className="section-kicker">Rutas sugeridas</div>
            <h2 className="section-heading">Propuesta de UI</h2>
          </div>
          <div className="space-y-3">
            {topRoutes.map((route) => (
              <div key={route.path} className="meta-panel">
                <div className="meta-label">{route.path}</div>
                <div className="mt-1 text-sm font-semibold text-ink-900">{route.title}</div>
                <p className="mt-2 text-sm leading-6 text-ink-700">{route.purpose}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="section-block">
          <div className="space-y-2">
            <div className="section-kicker">Reglas preparadas</div>
            <h2 className="section-heading">Control de asistencia</h2>
          </div>
          <div className="space-y-3">
            {topRules.map((rule) => (
              <div key={rule.code} className="meta-panel">
                <div className="text-sm font-semibold text-ink-900">{rule.title}</div>
                <p className="mt-2 text-sm leading-6 text-ink-700">{rule.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="section-block">
          <div className="space-y-2">
            <div className="section-kicker">Permisos</div>
            <h2 className="section-heading">Roles listos para siguiente fase</h2>
          </div>
          <div className="space-y-3">
            {dataset.rolePermissions.map((role) => (
              <div key={role.role} className="meta-panel">
                <div className="text-sm font-semibold capitalize text-ink-900">{role.role.replace(/_/g, " ")}</div>
                <p className="mt-2 text-sm leading-6 text-ink-700">{role.scope}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
