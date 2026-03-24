"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useWorkbookStore } from "../store/useWorkbookStore";
import {
  applyFilters,
  buildDatasetInsights,
  buildHealthComparison,
  buildInfrastructureBreakdown,
  buildMethodologyHighlights,
  buildPanoramaKpis,
  buildRateDistribution,
  buildRiskIndex,
  buildSportFilterConfig,
  buildSportsParticipation,
  buildStatusDistribution,
  filterSportsSheet
} from "../lib/deporte";
import { formatPercent } from "../lib/utils";
import Card from "./ui/Card";
import MultiSelect from "./ui/MultiSelect";
import DataTable from "./ui/DataTable";
import { ChartCard, DistributionBar, DistributionPie } from "./Charts";
import KpiGrid from "./KpiGrid";

const HEALTH_TOOLTIP =
  "Fuente principal: ENSANUT 2022. Indicadores estimados a partir de ENSANUT y distribuciones poblacionales. No son mediciones directas por alcaldía.";
const ACTIVITY_TOOLTIP =
  "Fuente principal: MOPRADEF 2024-2025. La actividad por alcaldía es una estimación controlada anclada a sexo, edad e infraestructura per cápita.";
const INFRA_TOOLTIP =
  "Infraestructura consolidada desde deportivos públicos, PILARES, gimnasios DENUE y parques con equipamiento preparados para el MVP.";

export default function Dashboard() {
  const { workbook, modeledBase, modeledColumns, semantic, presentationMode } = useWorkbookStore();
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [sportsLimit, setSportsLimit] = useState<5 | 10>(5);

  const sportsSheet = workbook?.sheets["DEPORTES_POPULARES"] ?? null;
  const infrastructureSheet = workbook?.sheets["INFRAESTRUCTURA_ALCALDIA"] ?? null;

  const filterConfig = useMemo(
    () => buildSportFilterConfig(modeledBase, semantic, sportsSheet, infrastructureSheet),
    [modeledBase, semantic, sportsSheet, infrastructureSheet]
  );
  const filteredRows = useMemo(() => applyFilters(modeledBase, filters), [modeledBase, filters]);
  const filteredSportsRows = useMemo(
    () => (sportsSheet ? filterSportsSheet(sportsSheet.rows, filters) : []),
    [sportsSheet, filters]
  );
  const selectedInfraTypes = semantic.tipoInfraestructura ? (filters[semantic.tipoInfraestructura] ?? []) : [];

  const kpis = useMemo(() => buildPanoramaKpis(filteredRows, semantic), [filteredRows, semantic]);
  const bySexo = useMemo(() => buildRateDistribution(filteredRows, semantic.sexo, semantic), [filteredRows, semantic]);
  const byEdad = useMemo(() => buildRateDistribution(filteredRows, semantic.grupoEdad, semantic), [filteredRows, semantic]);
  const byAlcaldia = useMemo(() => buildRateDistribution(filteredRows, semantic.alcaldia, semantic), [filteredRows, semantic]);
  const infrastructureBreakdown = useMemo(
    () => buildInfrastructureBreakdown(filteredRows, semantic),
    [filteredRows, semantic]
  );
  const obesityByAlcaldia = useMemo(() => buildHealthComparison(filteredRows, semantic, "obesidad"), [filteredRows, semantic]);
  const overweightByAlcaldia = useMemo(() => buildHealthComparison(filteredRows, semantic, "sobrepeso"), [filteredRows, semantic]);
  const diabetesByAlcaldia = useMemo(() => buildHealthComparison(filteredRows, semantic, "diabetes"), [filteredRows, semantic]);
  const sedentaryByAlcaldia = useMemo(() => buildHealthComparison(filteredRows, semantic, "sedentarismo"), [filteredRows, semantic]);
  const sportsParticipation = useMemo(
    () => buildSportsParticipation(sportsSheet, filters, sportsLimit),
    [sportsSheet, filters, sportsLimit]
  );
  const insights = useMemo(() => buildDatasetInsights(filteredRows, semantic), [filteredRows, semantic]);
  const methodologyHighlights = useMemo(() => buildMethodologyHighlights(filteredRows), [filteredRows]);
  const activityStatus = useMemo(() => buildStatusDistribution(filteredRows, "ClasificacionPersonasActivas"), [filteredRows]);
  const riskIndex = useMemo(() => buildRiskIndex(filteredRows, semantic), [filteredRows, semantic]);
  const healthSummary = useMemo(
    () => [
      {
        label: "Obesidad promedio",
        value: obesityByAlcaldia.length > 0 ? `${(obesityByAlcaldia.reduce((sum, item) => sum + item.value, 0) / obesityByAlcaldia.length).toFixed(1)}%` : "Sin dato",
        helper: "Referencia territorial preparada"
      },
      {
        label: "Sobrepeso promedio",
        value: overweightByAlcaldia.length > 0 ? `${(overweightByAlcaldia.reduce((sum, item) => sum + item.value, 0) / overweightByAlcaldia.length).toFixed(1)}%` : "Sin dato",
        helper: "Referencia territorial preparada"
      },
      {
        label: "Diabetes promedio",
        value: diabetesByAlcaldia.length > 0 ? `${(diabetesByAlcaldia.reduce((sum, item) => sum + item.value, 0) / diabetesByAlcaldia.length).toFixed(1)}%` : "Sin dato",
        helper: "Referencia territorial preparada"
      },
      {
        label: "Sedentarismo estimado",
        value: sedentaryByAlcaldia.length > 0 ? `${(sedentaryByAlcaldia.reduce((sum, item) => sum + item.value, 0) / sedentaryByAlcaldia.length).toFixed(1)}%` : "Sin dato",
        helper: "Calculado como complemento de actividad"
      }
    ],
    [obesityByAlcaldia, overweightByAlcaldia, diabetesByAlcaldia, sedentaryByAlcaldia]
  );

  const infrastructureCards = useMemo(() => {
    return infrastructureBreakdown.map((item) => {
      const rows = [
        { label: "deportivos", value: item.deportivos },
        { label: "PILARES", value: item.pilares },
        { label: "gimnasios", value: item.gimnasios },
        { label: "parques", value: item.parques }
      ].filter((row) => {
        if (selectedInfraTypes.length === 0) return true;
        return selectedInfraTypes.some((selected) => {
          const map: Record<string, string> = {
            "Deportivos públicos": "deportivos",
            PILARES: "PILARES",
            Gimnasios: "gimnasios",
            "Parques con equipamiento": "parques"
          };
          return map[selected] === row.label;
        });
      });
      const total = rows.reduce((sum, row) => sum + row.value, 0);
      return { ...item, rows, visibleTotal: total };
    });
  }, [infrastructureBreakdown, selectedInfraTypes]);

  const previewColumns = useMemo<ColumnDef<Record<string, string>, string>[]>(() => {
    return modeledColumns.map((column) => ({
      header: column,
      accessorKey: column
    }));
  }, [modeledColumns]);

  const exportFilteredCsv = (visibleColumns: string[]) => {
    const columns = visibleColumns.length > 0 ? visibleColumns : modeledColumns;
    const header = columns.join(",");
    const rows = filteredRows.map((row) =>
      columns
        .map((column) => {
          const value = row[column] ?? "";
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "deporte_cdmx_filtrado.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!workbook || modeledBase.length === 0) {
    return (
      <Card className="p-6 text-sm text-ink-600">
        No se encontró una hoja base compatible. Sube un workbook con `DEPORTE_CDMX_BASE` o reconstruye `public/data/workbook.json`.
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <Card className={`space-y-4 p-5 ${presentationMode ? "hidden" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-ink-900">Filtros globales</div>
            <div className="text-xs text-ink-600">Todos los módulos reaccionan en tiempo real a territorio, perfil y deporte.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" type="button" onClick={() => setFiltersCollapsed((prev) => !prev)}>
              {filtersCollapsed ? "Expandir filtros" : "Colapsar filtros"}
            </button>
            <button className="btn-ghost" type="button" onClick={() => setFilters({})}>
              Limpiar filtros
            </button>
          </div>
        </div>
        {!filtersCollapsed ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filterConfig.map((filter) => (
              <MultiSelect
                key={filter.key}
                title={filter.key}
                options={filter.options}
                selected={filters[filter.column] ?? []}
                onChange={(values) => setFilters((prev) => ({ ...prev, [filter.column]: values }))}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 text-xs text-ink-600">
            {filterConfig.flatMap((filter) =>
              (filters[filter.column] ?? []).map((value) => (
                <span key={`${filter.key}-${value}`} className="rounded-full border border-mist-200 bg-white px-3 py-1">
                  {filter.key}: {value}
                </span>
              ))
            )}
            {Object.values(filters).every((value) => value.length === 0) ? <span>Sin filtros activos</span> : null}
          </div>
        )}
      </Card>

      <section className="section-block">
        <div>
          <div className="section-heading">Panorama general</div>
          <div className="section-copy">Lectura ejecutiva del estado de actividad física y cobertura territorial.</div>
        </div>
        <KpiGrid items={kpis} />
        <Card className="space-y-4 p-5">
          <div>
            <div className="text-base font-semibold text-ink-900">Trazabilidad del dataset</div>
            <div className="text-xs text-ink-600">Qué parte del MVP es agregada, preparada o estimada.</div>
          </div>
          <KpiGrid items={methodologyHighlights} />
        </Card>
      </section>

      <section className="section-block">
        <div>
          <div className="section-heading">Actividad</div>
          <div className="section-copy">Comportamiento de actividad por sexo, edad, alcaldía y práctica deportiva.</div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Actividad por sexo"
            helper="Estimación territorial anclada a MOPRADEF por sexo"
            tooltip={ACTIVITY_TOOLTIP}
          >
            <DistributionPie data={bySexo} />
          </ChartCard>
          <ChartCard
            title="Actividad por grupo de edad"
            helper="Estimación territorial anclada a MOPRADEF por edad"
            tooltip={ACTIVITY_TOOLTIP}
          >
            <DistributionBar data={byEdad} />
          </ChartCard>
          <ChartCard
            title="Alcaldías comparadas"
            helper="Ranking territorial del porcentaje activo modelado"
            tooltip={ACTIVITY_TOOLTIP}
          >
            <DistributionBar data={byAlcaldia} />
          </ChartCard>
          <Card className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold text-ink-900">Deportes más practicados</div>
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-mist-200 text-[11px] font-semibold text-ink-500"
                    title="Distribución demostrativa por deporte. Muestra top N y agrupa el resto en Otros."
                  >
                    i
                  </span>
                </div>
                <div className="text-xs text-ink-600">Top visible configurable y resto agrupado como Otros.</div>
              </div>
              <div className="flex gap-2">
                <button className={`btn-ghost ${sportsLimit === 5 ? "border-ink-900 text-ink-900" : ""}`} type="button" onClick={() => setSportsLimit(5)}>
                  Top 5
                </button>
                <button className={`btn-ghost ${sportsLimit === 10 ? "border-ink-900 text-ink-900" : ""}`} type="button" onClick={() => setSportsLimit(10)}>
                  Top 10
                </button>
              </div>
            </div>
            <div className="h-64">
              <DistributionPie data={sportsParticipation} />
            </div>
            <div className="text-xs text-ink-500">
              {filteredSportsRows.length} registros de deportes considerados con los filtros actuales.
            </div>
          </Card>
        </div>
      </section>

      <section className="section-block">
        <div>
          <div className="section-heading">Infraestructura</div>
          <div className="section-copy">Desglose por tipo de espacio y cobertura territorial para priorización pública.</div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Infraestructura por alcaldía"
            helper="Conteos agregados preparados desde fuentes públicas"
            tooltip={INFRA_TOOLTIP}
          >
            <DistributionBar
              data={infrastructureCards.map((item) => ({
                name: item.name,
                value: item.visibleTotal,
                percent: item.actividadPct,
                denominator: 100
              }))}
            />
          </ChartCard>
          <Card className="space-y-4 p-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold text-ink-900">Desglose por tipo</div>
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-mist-200 text-[11px] font-semibold text-ink-500"
                  title={INFRA_TOOLTIP}
                >
                  i
                </span>
              </div>
              <div className="text-xs text-ink-600">Vista resumida de cobertura para toma de decisiones por alcaldía.</div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {infrastructureCards.slice(0, 8).map((item) => (
                <div key={item.name} className="rounded-xl border border-mist-200 bg-mist-100 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-ink-900">{item.name}</div>
                      <div className="mt-1 text-2xl font-semibold text-ink-900">{item.visibleTotal} espacios</div>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs text-ink-600">
                      {formatPercent(item.actividadPct)}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-ink-700">
                    {item.rows.map((row) => (
                      <div key={`${item.name}-${row.label}`} className="flex justify-between gap-3">
                        <span>{row.label}</span>
                        <span className="font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="section-block">
        <div>
          <div className="section-heading">Salud</div>
          <div className="section-copy">Indicadores de contexto para relacionar actividad física con presión sanitaria territorial.</div>
        </div>
        <Card className="space-y-3 p-5">
          <div className="text-sm font-medium text-ink-800">Indicadores estimados a partir de ENSANUT y distribuciones poblacionales. No son mediciones directas por alcaldía.</div>
        </Card>
        <KpiGrid items={healthSummary} />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Obesidad por alcaldía" helper="Capa territorial preparada con referencia ENSANUT" tooltip={HEALTH_TOOLTIP}>
            <DistributionBar data={obesityByAlcaldia} />
          </ChartCard>
          <ChartCard title="Sobrepeso por alcaldía" helper="Capa territorial preparada con referencia ENSANUT" tooltip={HEALTH_TOOLTIP}>
            <DistributionBar data={overweightByAlcaldia} />
          </ChartCard>
          <ChartCard title="Diabetes por alcaldía" helper="Capa territorial preparada con referencia ENSANUT" tooltip={HEALTH_TOOLTIP}>
            <DistributionBar data={diabetesByAlcaldia} />
          </ChartCard>
          <ChartCard title="Sedentarismo estimado" helper="Aproximación complementaria a partir de actividad modelada" tooltip={HEALTH_TOOLTIP}>
            <DistributionBar data={sedentaryByAlcaldia} />
          </ChartCard>
        </div>
      </section>

      <section className="section-block">
        <div>
          <div className="section-heading">Índice de riesgo físico</div>
          <div className="section-copy">Semáforo ejecutivo por alcaldía para focalizar intervención pública.</div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Ranking de riesgo"
            helper="Riesgo alto: baja actividad y alta obesidad. Riesgo bajo: alta actividad."
            tooltip="Score compuesto de actividad, obesidad e infraestructura per cápita para priorización ejecutiva."
          >
            <DistributionBar
              data={riskIndex.map((item) => ({
                name: item.name,
                value: item.score,
                percent: item.score / 100,
                denominator: 100
              }))}
            />
          </ChartCard>
          <Card className="space-y-4 p-5">
            <div>
              <div className="text-base font-semibold text-ink-900">Semáforo territorial</div>
              <div className="text-xs text-ink-600">Prioridad sugerida para cobertura deportiva y activación física.</div>
            </div>
            <div className="space-y-3">
              {riskIndex.slice(0, 8).map((item) => {
                const tone =
                  item.nivel === "Alto"
                    ? "bg-red-100 text-red-700"
                    : item.nivel === "Medio"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700";
                return (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-mist-200 bg-mist-100 px-4 py-3">
                    <div>
                      <div className="font-semibold text-ink-900">{item.name}</div>
                      <div className="text-sm text-ink-600">
                        Actividad {item.actividadPct.toFixed(1)}% · Obesidad {item.obesidad.toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{item.nivel}</span>
                      <span className="text-lg font-semibold text-ink-900">{item.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      <section className="section-block">
        <div>
          <div className="section-heading">Insights</div>
          <div className="section-copy">Hallazgos accionables construidos con actividad, infraestructura y salud.</div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Clasificación metodológica de actividad"
            helper="La actividad del MVP no es un dato censal directo por alcaldía"
            tooltip={ACTIVITY_TOOLTIP}
          >
            <DistributionPie data={activityStatus} />
          </ChartCard>
          <Card className="space-y-4 p-5">
            <div>
              <div className="text-base font-semibold text-ink-900">Insights priorizados</div>
              <div className="text-xs text-ink-600">Redacción orientada a decisiones públicas y cobertura territorial.</div>
            </div>
            <ul className="list-disc space-y-3 pl-5 text-sm text-ink-700">
              {insights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="section-block">
        <div>
          <div className="section-heading">Datos</div>
          <div className="section-copy">Base mínima viable con clasificación metodológica lista para exploración y exportación.</div>
        </div>
        <Card className="space-y-4 p-6">
          <DataTable
            title="DEPORTE_CDMX_BASE"
            columns={previewColumns}
            data={filteredRows}
            onExport={exportFilteredCsv}
            allowColumnSelector
            hideControls={presentationMode}
          />
        </Card>
      </section>
    </div>
  );
}
