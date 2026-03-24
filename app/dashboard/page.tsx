"use client";

import { useEffect } from "react";
import Badge from "../../components/ui/Badge";
import Dashboard from "../../components/Dashboard";
import LoadingState from "../../components/LoadingState";
import Toggle from "../../components/ui/Toggle";
import useDashboardDataLoader from "../../lib/useDashboardDataLoader";
import { useDashboardStore } from "../../store/useDashboardStore";

export default function DashboardPage() {
  const { ready } = useDashboardDataLoader();
  const { dataset, loading, error, presentationMode, setPresentationMode } = useDashboardStore();

  useEffect(() => {
    console.log("[dashboard-page] estado render", {
      ready,
      loading,
      hasDataset: Boolean(dataset),
      territorialRecords: dataset?.territorialRecords?.length ?? 0,
      error
    });
  }, [dataset, error, loading, ready]);

  return (
    <main className={`min-h-screen bg-atmosphere px-6 py-10 ${presentationMode ? "presentation" : ""}`}>
      <div className={`mx-auto flex w-full max-w-7xl flex-col gap-8 ${presentationMode ? "max-w-screen-2xl" : ""}`}>
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge>Inteligencia deportiva territorial</Badge>
            <h1 className="text-3xl font-semibold text-ink-900 md:text-4xl">Deporte CDMX</h1>
            <p className="max-w-3xl text-sm leading-6 text-ink-600">
              Dashboard institucional para actividad física, salud relacionada, infraestructura deportiva y priorización territorial en la Ciudad de México.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Toggle checked={presentationMode} onChange={setPresentationMode} label="Modo presentación" />
            {dataset ? (
              <div className="rounded-full border border-mist-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700">
                Corte estructurado · {new Date(dataset.meta.generatedAt).toLocaleString("es-MX")}
              </div>
            ) : null}
          </div>
        </header>

        {error ? <div className="card p-4 text-sm text-red-600">{error}</div> : null}
        {!ready || loading ? <LoadingState /> : null}
        {ready && !loading && dataset ? <Dashboard /> : null}
        {ready && !loading && !dataset ? (
          <div className="card p-6 text-sm text-ink-700">
            <div className="font-semibold text-ink-900">Error cargando datos</div>
            <p className="mt-2">
              No se pudo inicializar el dataset del dashboard. Revisa la consola para validar el `fetch` de
              `dashboard.json`.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
