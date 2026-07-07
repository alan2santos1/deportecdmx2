import Link from "next/link";
import operationalDataset from "../../data/processed/operacion/operacion-asistencia.json";
import type { OperationalModuleDataset } from "../../lib/operations-types";

const numberFormat = new Intl.NumberFormat("es-MX");
const dataset = operationalDataset as OperationalModuleDataset;

export default function OperacionPage() {
  const topRoutes = dataset.routeProposals.slice(0, 5);
  const topRules = dataset.attendanceCaptureRules;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <article className="stat-card">
          <div className="meta-label">Usuarios mock</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.userCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Roles internos preparados sin desplegar autenticación compleja.</p>
        </article>
        <article className="stat-card">
          <div className="meta-label">Personal operativo</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.staffCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Promotores, entrenadores y animadores consolidados desde fuentes reales.</p>
        </article>
        <article className="stat-card">
          <div className="meta-label">Sedes</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.venueCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Puntos Ponte Pila y sedes PILARES operativas.</p>
        </article>
        <article className="stat-card">
          <div className="meta-label">Clases</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.classGroupCount)}</div>
          <p className="mt-2 text-sm text-ink-600">Programación semanal derivada de las mallas reales.</p>
        </article>
        <article className="stat-card">
          <div className="meta-label">Asistencia preparada</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.attendanceRecordCount)}</div>
          <p className="mt-2 text-sm text-ink-600">La captura diaria vive en localStorage en esta fase.</p>
        </article>
        <article className="stat-card">
          <div className="meta-label">Auditoría local</div>
          <div className="mt-3 text-3xl font-semibold text-ink-900">{numberFormat.format(dataset.summary.auditLogCount)}</div>
          <p className="mt-2 text-sm text-ink-600">El contrato ya contempla bitácora y cambios de matrícula.</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="section-block">
          <div className="space-y-2">
            <div className="section-kicker">Estado del módulo</div>
            <h2 className="section-heading">Sistema operativo interno en primera versión</h2>
            <p className="section-copy">
              Esta capa ya funciona separada del dashboard territorial. La lógica cubre personal, sedes, clases, horarios,
              usuarios mock, matrícula local, asistencia del día y evidencia fotográfica local.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="meta-panel">
              <div className="meta-label">Qué es real</div>
              <div className="meta-value">Personal, sedes, clases, horarios, coordinaciones y LCPO cuando la fuente lo trae.</div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Qué sigue mock/local</div>
              <div className="meta-value">Usuarios, alumnos, inscripciones, asistencia, evidencia y auditoría persistida.</div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Normalización de nombres</div>
              <div className="meta-value">Se conserva el nombre original y se expone `displayName` para UI institucional.</div>
            </div>
            <div className="meta-panel">
              <div className="meta-label">Roles preparados</div>
              <div className="meta-value">profesor_promotor, coordinador, lcpo, rh, direccion y superadmin.</div>
            </div>
          </div>

          <div className="subtle-divider grid gap-3 md:grid-cols-3">
            <Link href="/operacion/profesor" className="btn-primary">
              Entrar como profesor
            </Link>
            <Link href="/operacion/asistencia" className="btn-ghost">
              Capturar asistencia
            </Link>
            <Link href="/operacion/admin" className="btn-ghost">
              Abrir panel admin
            </Link>
          </div>
        </article>

        <article className="section-block">
          <div className="space-y-2">
            <div className="section-kicker">Rutas activas</div>
            <h2 className="section-heading">Recorridos principales</h2>
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
            <div className="section-kicker">Reglas activas</div>
            <h2 className="section-heading">Control de captura</h2>
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
            <div className="section-kicker">Notas metodológicas</div>
            <h2 className="section-heading">Lectura defendible</h2>
          </div>
          <div className="space-y-3">
            {dataset.meta.notes.map((note) => (
              <div key={note} className="meta-panel">
                <p className="text-sm leading-6 text-ink-700">{note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
