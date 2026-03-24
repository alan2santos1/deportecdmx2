"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  buildBarrierDistribution,
  buildDataLayerSummary,
  buildFilterConfig,
  buildFlattenedTableRows,
  buildHealthDistribution,
  buildInfrastructureAlcaldiaExtremes,
  buildInfrastructureByAlcaldia,
  buildInfrastructureDetailRows,
  buildInfrastructureExecutiveSummary,
  buildInfrastructureStackedByAlcaldia,
  buildInfrastructureSportsSummary,
  buildMapAreaLookup,
  buildMetricByAlcaldia,
  buildOverviewKpis,
  buildRateDistribution,
  buildRiskIndex,
  buildSportsTop,
  buildYearTrend,
  emptyFilters,
  filterHealthProfiles,
  filterInfrastructureDetails,
  filterSportsRecords,
  filterTerritorialRecords
} from "../lib/dashboard-selectors";
import type { DashboardFilterState, DataLayer, MetricMetadata } from "../lib/dashboard-types";
import { useDashboardStore } from "../store/useDashboardStore";
import { formatNumber } from "../lib/utils";
import { ChartCard, DistributionBar, DistributionPie, StackedBar } from "./Charts";
import KpiGrid from "./KpiGrid";
import TerritorialMap, { type TerritorialMetricKey } from "./TerritorialMap";
import Card from "./ui/Card";
import DataTable from "./ui/DataTable";
import MultiSelect from "./ui/MultiSelect";
import Tabs from "./ui/Tabs";

const sections = ["Panorama", "Actividad", "Infraestructura", "Salud", "Riesgo", "Metodología", "Datos"] as const;
type SectionKey = (typeof sections)[number];

const layerStyles: Record<DataLayer, string> = {
  real: "bg-emerald-50 text-emerald-700 border-emerald-200",
  base_oficial: "bg-sky-50 text-sky-700 border-sky-200",
  estimado: "bg-amber-50 text-amber-700 border-amber-200",
  preparado: "bg-slate-100 text-slate-700 border-slate-200",
  proyectado: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  insight: "bg-rose-50 text-rose-700 border-rose-200"
};

const chartMeta = {
  activity: {
    source: "MOPRADEF 2024-2025 + modelo territorial Deporte CDMX",
    dataType: "estimado",
    note: "2025 presenta quiebre metodológico y 2020-2023 se muestran como preparación retrospectiva."
  },
  activityTimeline: {
    source: "Serie 2020-2026 con benchmarks MOPRADEF y proyección 2026",
    dataType: "proyectado",
    note: "2026 es planeación; 2020-2023 no son observaciones territoriales directas."
  },
  sports: {
    source: "Mezcla disciplinaria preparada para el MVP institucional",
    dataType: "preparado",
    note: "No sustituye una fuente oficial única por deporte y alcaldía."
  },
  barriers: {
    source: "MOPRADEF 2024",
    dataType: "base_oficial",
    note: "Dato agregado nacional/urbano usado como referencia operativa."
  },
  infrastructure: {
    source: "PILARES + Deportivos Públicos CDMX + DENUE + espacios abiertos",
    dataType: "insight",
    note: "La lectura mezcla capas reales y preparadas: público/comunitario nominal por sede o instalación, privada desde DENUE como unidades económicas registradas."
  },
  health: {
    source: "ENSANUT Continua 2022 + segmentación sexo/edad",
    dataType: "estimado",
    note: "La territorialización por alcaldía es analítica y no una publicación oficial directa."
  },
  risk: {
    source: "Modelo compuesto Deporte CDMX",
    dataType: "insight",
    note: "Score = actividad inversa + obesidad + sedentarismo + infraestructura per cápita inversa."
  },
  map: {
    source: "GeoJSON oficial de alcaldías + dataset map-ready por alcaldía",
    dataType: "insight",
    note: "La geometría es real; actividad e infraestructura territorializada combinan capas reales, preparadas y estimadas según el indicador."
  }
} satisfies Record<string, MetricMetadata>;

const mapMetricMeta: Record<TerritorialMetricKey, { label: string; source: string; dataType: string; note: string; formatter: (value: number) => string }> = {
  activity: {
    label: "Actividad física",
    source: "MOPRADEF 2024-2025 + modelo territorial Deporte CDMX",
    dataType: "estimado",
    note: "Lectura territorial modelada; el mapa no implica causalidad, solo comparación espacial.",
    formatter: (value) => `${value.toFixed(1)}%`
  },
  risk: {
    label: "Índice de riesgo físico",
    source: "Modelo compuesto Deporte CDMX",
    dataType: "insight",
    note: "Score relativo para priorización institucional; no representa causalidad ni diagnóstico.",
    formatter: (value) => value.toFixed(1)
  },
  publicInfrastructure: {
    label: "Infraestructura pública",
    source: "PILARES + deportivos públicos + parques",
    dataType: "real",
    note: "Conteo administrativo visible de sedes, instalaciones y espacios públicos abiertos.",
    formatter: (value) => formatNumber(value)
  },
  privateInfrastructure: {
    label: "Infraestructura privada",
    source: "DENUE CDMX",
    dataType: "preparado",
    note: "DENUE representa unidades económicas registradas, no capacidad ni uso real del espacio.",
    formatter: (value) => formatNumber(value)
  },
  totalInfrastructure: {
    label: "Infraestructura total",
    source: "Capas públicas + privadas del dashboard",
    dataType: "insight",
    note: "Suma administrativa útil para lectura territorial; no debe confundirse con capacidad operativa.",
    formatter: (value) => formatNumber(value)
  },
  obesity: {
    label: "Obesidad",
    source: "ENSANUT Continua 2022 + modelación territorial",
    dataType: "estimado",
    note: "Prevalencia estimada por alcaldía para focalización, no observación oficial directa.",
    formatter: (value) => `${value.toFixed(1)}%`
  },
  diabetes: {
    label: "Diabetes",
    source: "ENSANUT Continua 2022 + modelación territorial",
    dataType: "estimado",
    note: "Prevalencia estimada por alcaldía para focalización, no observación oficial directa.",
    formatter: (value) => `${value.toFixed(1)}%`
  },
  sedentary: {
    label: "Sedentarismo",
    source: "Complemento del modelo de actividad física",
    dataType: "estimado",
    note: "Se deriva del porcentaje activo territorializado y debe leerse como aproximación analítica.",
    formatter: (value) => `${value.toFixed(1)}%`
  }
};

function LayerBadge({ layer }: { layer: DataLayer }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${layerStyles[layer]}`}>
      {layer.replace("_", " ")}
    </span>
  );
}

function NoteBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-mist-200 bg-mist-100/70 p-4">
      <div className="text-sm font-semibold text-ink-900">{title}</div>
      <div className="mt-2 text-sm leading-6 text-ink-700">{body}</div>
    </div>
  );
}

function ExportableTable({
  title,
  columns,
  data,
  fileName,
  presentationMode,
  pageSize = 8
}: {
  title: string;
  columns: ColumnDef<Record<string, string>, string>[];
  data: Record<string, string>[];
  fileName: string;
  presentationMode: boolean;
  pageSize?: number;
}) {
  const exportCsv = (visibleColumns: string[]) => {
    const columnsToUse = visibleColumns.length > 0 ? visibleColumns : Object.keys(data[0] ?? {});
    const csv = [
      columnsToUse.join(","),
      ...data.map((row) =>
        columnsToUse.map((column) => `"${String(row[column] ?? "").replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <DataTable
        title={title}
        columns={columns}
        data={data}
        pageSize={pageSize}
        onExport={data.length > 0 ? exportCsv : undefined}
        allowColumnSelector
        hideControls={presentationMode}
      />
    </Card>
  );
}

export default function Dashboard() {
  const { dataset, presentationMode } = useDashboardStore();
  const [activeSection, setActiveSection] = useState<SectionKey>("Panorama");
  const [filters, setFilters] = useState<DashboardFilterState>(emptyFilters);
  const [sportsLimit, setSportsLimit] = useState<5 | 10>(5);
  const [showFullInfrastructure, setShowFullInfrastructure] = useState(false);
  const [selectedMapMetric, setSelectedMapMetric] = useState<TerritorialMetricKey>("risk");
  const [selectedMapGeoKey, setSelectedMapGeoKey] = useState<string | null>(null);
  const [selectedSpaceType, setSelectedSpaceType] = useState<string | null>(null);

  const filterConfig = useMemo(() => (dataset ? buildFilterConfig(dataset) : []), [dataset]);
  const territorialRecords = useMemo(() => (dataset ? filterTerritorialRecords(dataset.territorialRecords, filters) : []), [dataset, filters]);
  const sportsRecords = useMemo(() => (dataset ? filterSportsRecords(dataset.sportsRecords, filters) : []), [dataset, filters]);
  const healthProfiles = useMemo(() => (dataset ? filterHealthProfiles(dataset.healthProfiles, filters) : []), [dataset, filters]);
  const infrastructureDetails = useMemo(
    () => (dataset ? filterInfrastructureDetails(dataset.infrastructureDetails, filters) : []),
    [dataset, filters]
  );

  const overviewKpis = useMemo(() => buildOverviewKpis(territorialRecords), [territorialRecords]);
  const activityBySex = useMemo(() => buildRateDistribution(territorialRecords, (record) => record.sex), [territorialRecords]);
  const activityByAge = useMemo(() => buildRateDistribution(territorialRecords, (record) => record.ageGroup), [territorialRecords]);
  const activityByAlcaldia = useMemo(() => buildRateDistribution(territorialRecords, (record) => record.alcaldia), [territorialRecords]);
  const activityTimeline = useMemo(() => buildYearTrend(territorialRecords), [territorialRecords]);
  const sportsTop = useMemo(() => buildSportsTop(sportsRecords, sportsLimit), [sportsRecords, sportsLimit]);
  const barriers = useMemo(() => buildBarrierDistribution(), []);
  const infrastructure = useMemo(() => buildInfrastructureByAlcaldia(territorialRecords, filters), [territorialRecords, filters]);
  const infrastructureYear = useMemo(() => {
    if (filters.years.length === 0) return 2025;
    return Math.max(...filters.years.map((item) => Number(item)));
  }, [filters.years]);
  const infrastructureDisplayDetails = useMemo(
    () => infrastructureDetails.filter((item) => item.year === infrastructureYear),
    [infrastructureDetails, infrastructureYear]
  );
  const infrastructureSports = useMemo(() => buildInfrastructureSportsSummary(infrastructureDisplayDetails), [infrastructureDisplayDetails]);
  const obesityByAlcaldia = useMemo(() => buildMetricByAlcaldia(territorialRecords, "obesityRate"), [territorialRecords]);
  const overweightByAlcaldia = useMemo(() => buildMetricByAlcaldia(territorialRecords, "overweightRate"), [territorialRecords]);
  const combinedWeightByAlcaldia = useMemo(() => buildMetricByAlcaldia(territorialRecords, "combinedWeightRiskRate"), [territorialRecords]);
  const diabetesByAlcaldia = useMemo(() => buildMetricByAlcaldia(territorialRecords, "diabetesRate"), [territorialRecords]);
  const sedentaryByAlcaldia = useMemo(() => buildMetricByAlcaldia(territorialRecords, "sedentaryRate"), [territorialRecords]);
  const obesityBySex = useMemo(() => buildHealthDistribution(healthProfiles, "sex", "obesityRate"), [healthProfiles]);
  const obesityByAge = useMemo(() => buildHealthDistribution(healthProfiles, "ageGroup", "obesityRate"), [healthProfiles]);
  const diabetesByAge = useMemo(() => buildHealthDistribution(healthProfiles, "ageGroup", "diabetesRate"), [healthProfiles]);
  const riskIndex = useMemo(() => buildRiskIndex(territorialRecords, filters), [territorialRecords, filters]);
  const layerSummary = useMemo(() => buildDataLayerSummary(territorialRecords), [territorialRecords]);
  const territorialTable = useMemo(() => buildFlattenedTableRows(territorialRecords), [territorialRecords]);
  const infrastructureExecutive = useMemo(() => buildInfrastructureExecutiveSummary(infrastructureDisplayDetails), [infrastructureDisplayDetails]);
  const infraStacked = useMemo(() => buildInfrastructureStackedByAlcaldia(infrastructureDisplayDetails), [infrastructureDisplayDetails]);
  const scopedInfrastructureDetails = useMemo(
    () => (selectedSpaceType ? infrastructureDisplayDetails.filter((item) => {
      const category =
        item.infrastructureType === "Gimnasio privado"
          ? "Gimnasios privados"
          : item.infrastructureType === "Club deportivo privado"
            ? "Clubes deportivos"
            : item.infrastructureType === "Academia deportiva privada"
              ? "Academias deportivas"
              : item.infrastructureType === "Deportivos públicos"
                ? "Deportivos públicos"
                : item.infrastructureType === "Parques / áreas verdes"
                  ? "Parques"
                  : "PILARES";
      return category === selectedSpaceType;
    }) : infrastructureDisplayDetails),
    [infrastructureDisplayDetails, selectedSpaceType]
  );
  const infrastructureExtremes = useMemo(() => buildInfrastructureAlcaldiaExtremes(scopedInfrastructureDetails), [scopedInfrastructureDetails]);
  const infrastructureTable = useMemo(() => buildInfrastructureDetailRows(scopedInfrastructureDetails), [scopedInfrastructureDetails]);
  const mapYear = useMemo(() => {
    if (filters.years.length === 0) return 2025;
    return Math.max(...filters.years.map((item) => Number(item)));
  }, [filters.years]);
  const mapAreas = useMemo(
    () =>
      dataset?.mapAreas.filter((record) => record.year === mapYear).filter((record) => (
        filters.alcaldias.length > 0 ? filters.alcaldias.includes(record.alcaldia) : true
      )) ?? [],
    [dataset, filters.alcaldias, mapYear]
  );
  const mapAreaLookup = useMemo(() => buildMapAreaLookup(mapAreas), [mapAreas]);
  const activeMapGeoKey = selectedMapGeoKey && mapAreaLookup[selectedMapGeoKey] ? selectedMapGeoKey : (mapAreas[0]?.geoKey ?? null);
  const selectedMapArea = activeMapGeoKey ? mapAreaLookup[activeMapGeoKey] : undefined;
  const selectedMapMetricMeta = mapMetricMeta[selectedMapMetric];
  const getSelectedMapMetricValue = (record: typeof mapAreas[number]) => {
    if (selectedMapMetric === "activity") return record.activityRate * 100;
    if (selectedMapMetric === "risk") return record.riskScore;
    if (selectedMapMetric === "publicInfrastructure") return record.publicInfrastructureCount;
    if (selectedMapMetric === "privateInfrastructure") return record.privateInfrastructureCount;
    if (selectedMapMetric === "totalInfrastructure") return record.totalInfrastructureCount;
    if (selectedMapMetric === "obesity") return record.obesityRate * 100;
    if (selectedMapMetric === "diabetes") return record.diabetesRate * 100;
    return record.sedentaryRate * 100;
  };
  const mapRanking = useMemo(
    () => [...mapAreas].sort((a, b) => getSelectedMapMetricValue(b) - getSelectedMapMetricValue(a)),
    [mapAreas, selectedMapMetric]
  );
  const selectedMapRank = useMemo(
    () => (selectedMapArea ? mapRanking.findIndex((item) => item.geoKey === selectedMapArea.geoKey) + 1 : null),
    [mapRanking, selectedMapArea]
  );
  const selectedMapInfrastructure = useMemo(
    () => (selectedMapArea ? infrastructureDetails.filter((item) => item.alcaldia === selectedMapArea.alcaldia && item.year === mapYear) : []),
    [infrastructureDetails, mapYear, selectedMapArea]
  );
  const privateMapUnits = useMemo(
    () => selectedMapInfrastructure.filter((item) => item.sourceDataset === "Directorio Estadístico de Unidades Económicas CDMX").reduce((sum, item) => sum + item.administrativeCount, 0),
    [selectedMapInfrastructure]
  );
  const publicMapUnits = useMemo(
    () => selectedMapInfrastructure.filter((item) => item.dataType === "real" && item.sourceDataset !== "Directorio Estadístico de Unidades Económicas CDMX").reduce((sum, item) => sum + item.administrativeCount, 0),
    [selectedMapInfrastructure]
  );
  const pilaresMapSites = useMemo(
    () => selectedMapInfrastructure.filter((item) => item.infrastructureType === "PILARES").reduce((sum, item) => sum + item.administrativeCount, 0),
    [selectedMapInfrastructure]
  );
  const pilaresMapOperational = useMemo(
    () => selectedMapInfrastructure.filter((item) => item.infrastructureType === "PILARES").reduce((sum, item) => sum + item.operationalUnits, 0),
    [selectedMapInfrastructure]
  );
  const publicSportsMapSites = useMemo(
    () => selectedMapInfrastructure.filter((item) => item.infrastructureType === "Deportivos públicos").reduce((sum, item) => sum + item.administrativeCount, 0),
    [selectedMapInfrastructure]
  );
  const mapRows = useMemo(
    () =>
      dataset?.mapAreas
        .filter((record) => (filters.alcaldias.length > 0 ? filters.alcaldias.includes(record.alcaldia) : true))
        .filter((record) => (filters.years.length > 0 ? filters.years.includes(String(record.year)) : true))
        .map((record) => ({
          "Año": String(record.year),
          "Alcaldía": record.alcaldia,
          "Geo key": record.geoKey,
          "Lat": record.centroid.lat.toFixed(4),
          "Lon": record.centroid.lon.toFixed(4),
          "Actividad": `${(record.activityRate * 100).toFixed(1)}%`,
          "Riesgo": record.riskScore.toFixed(1),
          "Semáforo": record.riskLevel,
          "Infra x100k": record.infraPer100k.toFixed(1),
          "Tipo de dato": record.dataType,
          "Fuente": record.source,
          "Nota metodológica": record.methodologicalNote
        })) ?? [],
    [dataset, filters.alcaldias, filters.years]
  );

  const methodologyRows = useMemo(
    () => dataset?.methodology.map((item) => ({ "Módulo": item.module, "Métrica": item.metric, "Capa": item.layer.replace("_", " "), "Fuente": item.source, "Lógica": item.logic, "Limitación": item.limitation })) ?? [],
    [dataset]
  );
  const sourcesRows = useMemo(
    () => dataset?.sourceRegistry.map((item) => ({ "Métrica": item.metric, "Capa": item.layer.replace("_", " "), "Fuente": item.source, "Cobertura": item.coverage, "Nota": item.note })) ?? [],
    [dataset]
  );
  const qualityRows = useMemo(
    () => dataset?.qualityChecks.map((item) => ({ "Chequeo": item.check, "Alcance": item.scope, "Estado": item.status, "Nota": item.note })) ?? [],
    [dataset]
  );

  const methodologyColumns = useMemo<ColumnDef<Record<string, string>, string>[]>(() => [
    { header: "Módulo", accessorKey: "Módulo" },
    { header: "Métrica", accessorKey: "Métrica" },
    { header: "Capa", accessorKey: "Capa" },
    { header: "Fuente", accessorKey: "Fuente" },
    { header: "Lógica", accessorKey: "Lógica" },
    { header: "Limitación", accessorKey: "Limitación" }
  ], []);
  const sourcesColumns = useMemo<ColumnDef<Record<string, string>, string>[]>(() => [
    { header: "Métrica", accessorKey: "Métrica" },
    { header: "Capa", accessorKey: "Capa" },
    { header: "Fuente", accessorKey: "Fuente" },
    { header: "Cobertura", accessorKey: "Cobertura" },
    { header: "Nota", accessorKey: "Nota" }
  ], []);
  const qualityColumns = useMemo<ColumnDef<Record<string, string>, string>[]>(() => [
    { header: "Chequeo", accessorKey: "Chequeo" },
    { header: "Alcance", accessorKey: "Alcance" },
    { header: "Estado", accessorKey: "Estado" },
    { header: "Nota", accessorKey: "Nota" }
  ], []);
  const territorialColumns = useMemo<ColumnDef<Record<string, string>, string>[]>(
    () => (territorialTable[0] ? Object.keys(territorialTable[0]).map((key) => ({ header: key, accessorKey: key })) : []),
    [territorialTable]
  );
  const infrastructureColumns = useMemo<ColumnDef<Record<string, string>, string>[]>(
    () => (infrastructureTable[0] ? Object.keys(infrastructureTable[0]).map((key) => ({ header: key, accessorKey: key })) : []),
    [infrastructureTable]
  );
  const mapColumns = useMemo<ColumnDef<Record<string, string>, string>[]>(
    () => (mapRows[0] ? Object.keys(mapRows[0]).map((key) => ({ header: key, accessorKey: key })) : []),
    [mapRows]
  );

  if (!dataset) {
    return <Card className="p-6 text-sm text-ink-600">No se encontró `dashboard.json`.</Card>;
  }

  const selectedYears = filters.years.length > 0 ? filters.years.join(", ") : "todos";
  const selectedRecordsText = `${formatNumber(territorialRecords.length)} celdas territoriales`;
  const average = (items: Array<{ value: number }>) => (items.length > 0 ? items.reduce((sum, item) => sum + item.value, 0) / items.length : 0);
  const visibleInfrastructureTable = showFullInfrastructure ? infrastructureTable : infrastructureTable.slice(0, 12);
  const visibleInfrastructureAdministrative = scopedInfrastructureDetails.reduce((sum, item) => sum + item.administrativeCount, 0);
  const visibleInfrastructureOperational = scopedInfrastructureDetails.reduce((sum, item) => sum + item.operationalUnits, 0);
  const visiblePublicUnits = scopedInfrastructureDetails
    .filter((item) => item.dataType === "real" && item.sourceDataset !== "Directorio Estadístico de Unidades Económicas CDMX")
    .reduce((sum, item) => sum + item.administrativeCount, 0);
  const visiblePrivateUnits = scopedInfrastructureDetails
    .filter((item) => item.sourceDataset === "Directorio Estadístico de Unidades Económicas CDMX")
    .reduce((sum, item) => sum + item.administrativeCount, 0);
  const visiblePrivateShare = visibleInfrastructureAdministrative > 0 ? (visiblePrivateUnits / visibleInfrastructureAdministrative) * 100 : 0;
  const visiblePublicShare = visibleInfrastructureAdministrative > 0 ? (visiblePublicUnits / visibleInfrastructureAdministrative) * 100 : 0;
  const pilaresRealSites = scopedInfrastructureDetails
    .filter((item) => item.infrastructureType === "PILARES")
    .reduce((sum, item) => sum + item.administrativeCount, 0);
  const pilaresOperationalSpaces = scopedInfrastructureDetails
    .filter((item) => item.infrastructureType === "PILARES")
    .reduce((sum, item) => sum + item.operationalUnits, 0);
  const publicSportsRealSites = scopedInfrastructureDetails
    .filter((item) => item.infrastructureType === "Deportivos públicos")
    .reduce((sum, item) => sum + item.administrativeCount, 0);
  const topPilaresBySite = Array.from(
    scopedInfrastructureDetails
      .filter((item) => item.infrastructureType === "PILARES")
      .reduce((acc, item) => {
        acc.set(item.alcaldia, (acc.get(item.alcaldia) ?? 0) + item.administrativeCount);
        return acc;
      }, new Map<string, number>())
      .entries()
  ).sort((a, b) => b[1] - a[1])[0];
  const topPilaresByOperational = Array.from(
    scopedInfrastructureDetails
      .filter((item) => item.infrastructureType === "PILARES")
      .reduce((acc, item) => {
        acc.set(item.alcaldia, (acc.get(item.alcaldia) ?? 0) + item.operationalUnits);
        return acc;
      }, new Map<string, number>())
      .entries()
  ).sort((a, b) => b[1] - a[1])[0];
  const healthKpis = [
    { label: "Obesidad", value: `${average(obesityByAlcaldia).toFixed(1)}%`, helper: "ENSANUT 2022 segmentada y territorializada" },
    { label: "Sobrepeso", value: `${average(overweightByAlcaldia).toFixed(1)}%`, helper: "Base oficial 2022 con lectura por sexo y edad" },
    { label: "Sobrepeso + obesidad", value: `${average(combinedWeightByAlcaldia).toFixed(1)}%`, helper: "Carga metabólica combinada" },
    { label: "Diabetes", value: `${average(diabetesByAlcaldia).toFixed(1)}%`, helper: "ENSANUT 2022 segmentada" },
    { label: "Sedentarismo", value: `${average(sedentaryByAlcaldia).toFixed(1)}%`, helper: "Complemento de actividad territorial" }
  ];

  return (
    <div className="space-y-8">
      <Card className={`space-y-4 p-5 ${presentationMode ? "hidden" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-ink-900">Filtros globales</div>
            <div className="text-xs text-ink-600">Sexo, edad, deporte, tipo de infraestructura y año actualizan la lectura institucional cuando la lógica del indicador lo permite.</div>
          </div>
          <button className="btn-ghost" type="button" onClick={() => setFilters(emptyFilters)}>
            Limpiar filtros
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filterConfig.map((filter) => (
            <MultiSelect
              key={filter.key}
              title={filter.title}
              options={filter.options}
              selected={filters[filter.key]}
              onChange={(values) => setFilters((prev) => ({ ...prev, [filter.key]: values }))}
            />
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={sections} active={activeSection} onChange={setActiveSection} />
        <div className="text-xs text-ink-600">Corte activo: años {selectedYears} · {selectedRecordsText}</div>
      </div>

      {activeSection === "Panorama" ? (
        <section className="section-block">
          <div>
            <div className="section-kicker">1. Panorama</div>
            <div className="section-heading">Lectura ejecutiva del sistema</div>
            <div className="section-copy">Resumen institucional de actividad física, población analizada, brechas y composición de capas de dato.</div>
          </div>
          <KpiGrid items={overviewKpis} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-4 p-5">
              <div className="text-base font-semibold text-ink-900">Capas del sistema</div>
              <KpiGrid items={layerSummary} />
            </Card>
            <Card className="space-y-4 p-5">
              <div className="text-base font-semibold text-ink-900">Insights ejecutivos</div>
              <div className="space-y-3">
                {dataset.insights.map((item) => (
                  <NoteBlock key={item.title} title={item.title} body={`${item.summary} ${item.implication}`} />
                ))}
              </div>
            </Card>
          </div>
        </section>
      ) : null}

      {activeSection === "Actividad" ? (
        <section className="section-block">
          <div>
            <div className="section-kicker">2. Actividad</div>
            <div className="section-heading">Actividad física y práctica deportiva</div>
            <div className="section-copy">Comparativos por sexo, edad, alcaldía y serie temporal con visibilidad explícita de la base metodológica.</div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Actividad por sexo" helper="Estimación territorial anclada a MOPRADEF" tooltip={chartMeta.activity}>
              <DistributionPie data={activityBySex} />
            </ChartCard>
            <ChartCard title="Actividad por grupo de edad" helper="La actividad cae conforme aumenta la edad" tooltip={chartMeta.activity}>
              <DistributionBar data={activityByAge} />
            </ChartCard>
            <ChartCard title="Actividad por alcaldía" helper="Ranking territorial del porcentaje activo" tooltip={chartMeta.activity}>
              <DistributionBar data={activityByAlcaldia} />
            </ChartCard>
            <ChartCard title="Timeline 2020-2026" helper="Serie institucional con proyección de planeación" tooltip={chartMeta.activityTimeline}>
              <DistributionBar data={activityTimeline} />
            </ChartCard>
            <Card className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-ink-900">Deportes más practicados</div>
                  <div className="text-xs text-ink-600">Top {sportsLimit} visible; el resto se agrupa como Otros.</div>
                </div>
                <div className="flex gap-2">
                  <button className={`btn-ghost ${sportsLimit === 5 ? "border-ink-900" : ""}`} onClick={() => setSportsLimit(5)} type="button">Top 5</button>
                  <button className={`btn-ghost ${sportsLimit === 10 ? "border-ink-900" : ""}`} onClick={() => setSportsLimit(10)} type="button">Top 10</button>
                </div>
              </div>
              <div className="h-64">
                <DistributionBar data={sportsTop} />
              </div>
              <div className="text-xs text-ink-600">La capa de deportes sigue marcada como preparada mientras se conecta una fuente oficial por disciplina.</div>
              <div className="meta-panel">
                <div className="meta-grid">
                  <div>
                    <div className="meta-label">Fuente</div>
                    <div className="meta-value">{chartMeta.sports.source}</div>
                  </div>
                  <div>
                    <div className="meta-label">Tipo de dato</div>
                    <div className="meta-value">{chartMeta.sports.dataType}</div>
                  </div>
                  <div>
                    <div className="meta-label">Nota metodológica</div>
                    <div className="meta-value">{chartMeta.sports.note}</div>
                  </div>
                </div>
              </div>
            </Card>
            <ChartCard title="Barreras principales" helper="Base oficial agregada útil para diseño de política pública" tooltip={chartMeta.barriers}>
              <DistributionBar data={barriers} />
            </ChartCard>
          </div>
        </section>
      ) : null}

      {activeSection === "Infraestructura" ? (
        <section className="section-block">
          <div>
            <div className="section-kicker">3. Infraestructura</div>
            <div className="section-heading">Infraestructura deportiva y comunitaria</div>
            <div className="section-copy">Separa claramente espacios observables, tipos de espacio, deportes disponibles y capacidad estimada donde todavía no existe aforo operativo.</div>
          </div>
          <KpiGrid
            items={[
              { label: "Infraestructura visible", value: formatNumber(infrastructure.reduce((sum, item) => sum + item.total, 0)), helper: "Conteos administrativos de sedes, instalaciones o establecimientos" },
              { label: "Espacios operativos estimados", value: formatNumber(visibleInfrastructureOperational), helper: "Aproximación analítica para lectura de capacidad territorial" },
              { label: "Densidad media", value: `${(infrastructure.reduce((sum, item) => sum + item.density, 0) / (infrastructure.length || 1)).toFixed(1)}`, helper: "Infraestructura administrativa por 100 mil habitantes" },
              { label: "Capacidad estimada", value: formatNumber(infrastructureDetails.reduce((sum, item) => sum + item.capacity, 0)), helper: "Solo cuando no existe aforo oficial consolidado" }
            ]}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Desglose por tipo" helper="Conteo administrativo separado entre infraestructura pública/comunitaria y privada" tooltip={chartMeta.infrastructure}>
              <StackedBar data={infraStacked} categories={["PILARES", "Deportivos públicos", "Gimnasios privados", "Clubes deportivos", "Academias deportivas", "Parques"]} />
            </ChartCard>
            <ChartCard title="Deportes disponibles en infraestructura" helper="Lectura consolidada del detalle de espacios" tooltip={chartMeta.infrastructure}>
              <DistributionBar data={infrastructureSports.slice(0, 8)} />
            </ChartCard>
          </div>
          <Card className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-ink-900">Cómo leer PILARES y métricas similares</div>
              <LayerBadge layer="real" />
              <LayerBadge layer="estimado" />
              <LayerBadge layer="preparado" />
            </div>
            <div className="text-sm leading-6 text-ink-700">
              Las sedes PILARES se contabilizan como registro real. Los espacios operativos son una aproximación analítica para estimar capacidad territorial y no equivalen al número oficial de sedes. El mismo criterio se aplica cuando una instalación real requiere una capa operativa o de capacidad para análisis.
            </div>
            <div className="text-sm leading-6 text-ink-700">
              DENUE representa unidades económicas registradas, no capacidad ni uso real del espacio. Mientras el extracto oficial disponible no exponga SCIAN verificable, gimnasios, clubes y academias privadas se mantienen como capa preparada.
            </div>
          </Card>
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="space-y-5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-ink-900">Resumen ejecutivo de infraestructura</div>
                  <div className="text-sm leading-6 text-ink-600">
                    Mantiene la lectura agregada y permite enfocar la tabla en un tipo de espacio concreto sin tocar la gráfica principal.
                  </div>
                  <div className="mt-2 text-xs text-ink-600">Corte visible para esta lectura detallada: {infrastructureYear}.</div>
                </div>
                {selectedSpaceType ? (
                  <button className="btn-ghost" type="button" onClick={() => setSelectedSpaceType(null)}>
                    Quitar foco de tipo
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Infraestructura visible</div>
                  <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(visibleInfrastructureAdministrative)}</div>
                  <div className="mt-2 text-xs text-ink-600">Conteos administrativos visibles en la vista</div>
                </div>
                <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Sedes PILARES reales</div>
                  <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(pilaresRealSites)}</div>
                  <div className="mt-2 text-xs text-ink-600">Conteo administrativo nominal por sede</div>
                </div>
                <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Espacios operativos PILARES</div>
                  <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(pilaresOperationalSpaces)}</div>
                  <div className="mt-2 text-xs text-ink-600">Estimación analítica de capacidad territorial, no sedes</div>
                </div>
                <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Deportivos públicos reales</div>
                  <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(publicSportsRealSites)}</div>
                  <div className="mt-2 text-xs text-ink-600">Instalaciones oficiales integradas</div>
                </div>
                <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Infraestructura privada</div>
                  <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(visiblePrivateUnits)}</div>
                  <div className="mt-2 text-xs text-ink-600">Preparada desde DENUE; no equivalente a sedes públicas</div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-mist-200 bg-mist-100/60 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Alcaldía con más sedes PILARES</div>
                  <div className="mt-2 text-lg font-semibold text-ink-900">{topPilaresBySite?.[0] ?? "Sin dato"}</div>
                  <div className="mt-2 text-xs text-ink-600">{topPilaresBySite ? `${formatNumber(topPilaresBySite[1])} sedes reales` : "Sin dato"}</div>
                </div>
                <div className="rounded-2xl border border-mist-200 bg-mist-100/60 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Alcaldía con más espacios PILARES</div>
                  <div className="mt-2 text-lg font-semibold text-ink-900">{topPilaresByOperational?.[0] ?? "Sin dato"}</div>
                  <div className="mt-2 text-xs text-ink-600">{topPilaresByOperational ? `${formatNumber(topPilaresByOperational[1])} espacios estimados` : "Sin dato"}</div>
                </div>
                <div className="rounded-2xl border border-mist-200 bg-mist-100/60 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Mayor infraestructura visible</div>
                  <div className="mt-2 text-lg font-semibold text-ink-900">{infrastructureExtremes.highestAdministrative?.alcaldia ?? "Sin dato"}</div>
                  <div className="mt-2 text-xs text-ink-600">{infrastructureExtremes.highestAdministrative ? `${formatNumber(infrastructureExtremes.highestAdministrative.administrativeTotal)} registros administrativos` : "Sin dato"}</div>
                </div>
                <div className="rounded-2xl border border-mist-200 bg-mist-100/60 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Mayor capacidad operativa</div>
                  <div className="mt-2 text-lg font-semibold text-ink-900">{infrastructureExtremes.highestOperational?.alcaldia ?? "Sin dato"}</div>
                  <div className="mt-2 text-xs text-ink-600">{infrastructureExtremes.highestOperational ? `${formatNumber(infrastructureExtremes.highestOperational.operationalTotal)} espacios estimados` : "Sin dato"}</div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {infrastructureExecutive.slice(0, 6).map((item) => {
                  const isActive = selectedSpaceType === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`rounded-2xl border px-4 py-4 text-left transition ${isActive ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white hover:border-ink-400"}`}
                      onClick={() => setSelectedSpaceType((prev) => (prev === item.key ? null : item.key))}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">{item.label}</div>
                        <LayerBadge layer={item.isPrivate ? "preparado" : "real"} />
                      </div>
                      <div className="mt-3 text-2xl font-semibold">{formatNumber(item.administrativeTotal)}</div>
                      <div className={`mt-2 text-xs ${isActive ? "text-white/80" : "text-ink-600"}`}>{(item.administrativePercent * 100).toFixed(1)}% del total administrativo visible</div>
                      <div className={`mt-1 text-xs ${isActive ? "text-white/80" : "text-ink-600"}`}>{formatNumber(item.operationalTotal)} espacios operativos estimados</div>
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-ink-600">
                El foco por tipo de espacio afecta esta vista ejecutiva y la tabla detallada. La gráfica principal se conserva como lectura institucional estable y trabaja solo con conteo administrativo.
              </div>
            </Card>
            <Card className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold text-ink-900">Público vs privado</div>
                <LayerBadge layer="real" />
                <LayerBadge layer="preparado" />
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink-900">Infraestructura pública y comunitaria</div>
                      <div className="mt-1 text-xs text-ink-600">PILARES y deportivos públicos se reportan como sedes/instalaciones reales; las capas operativas se presentan aparte.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-ink-900">{formatNumber(visiblePublicUnits)}</div>
                      <div className="text-xs text-ink-600">{visiblePublicShare.toFixed(1)}% del total visible</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink-900">Infraestructura privada</div>
                      <div className="mt-1 text-xs text-ink-600">DENUE CDMX descargado y normalizado por alcaldía; mientras no entre un corte con SCIAN verificable se reporta como preparado.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-ink-900">{formatNumber(visiblePrivateUnits)}</div>
                      <div className="text-xs text-ink-600">{visiblePrivateShare.toFixed(1)}% del total visible</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="meta-panel">
                <div className="meta-grid">
                  <div>
                    <div className="meta-label">Fuente</div>
                    <div className="meta-value">{chartMeta.infrastructure.source}</div>
                  </div>
                  <div>
                    <div className="meta-label">Tipo de dato</div>
                    <div className="meta-value">Real para sedes e instalaciones públicas; preparado para DENUE privado; estimado para espacios operativos y capacidad</div>
                  </div>
                  <div>
                    <div className="meta-label">Nota metodológica</div>
                    <div className="meta-value">DENUE representa unidades económicas registradas, no capacidad ni uso real del espacio. La comparación público vs privado es útil para lectura ejecutiva, pero no debe interpretarse como aforo equivalente entre sectores.</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="space-y-5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-ink-900">Mapa territorial</div>
                  <div className="text-sm leading-6 text-ink-600">
                    Geometría oficial de alcaldías conectada al modelo territorial. Año visualizado: {mapYear}.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "activity" as const, label: "Actividad" },
                    { key: "risk" as const, label: "Riesgo" },
                    { key: "publicInfrastructure" as const, label: "Infra pública" },
                    { key: "privateInfrastructure" as const, label: "Infra privada" },
                    { key: "totalInfrastructure" as const, label: "Infra total" },
                    { key: "obesity" as const, label: "Obesidad" },
                    { key: "diabetes" as const, label: "Diabetes" },
                    { key: "sedentary" as const, label: "Sedentarismo" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`btn-ghost ${selectedMapMetric === item.key ? "border-ink-900 bg-ink-900 text-white hover:text-white" : ""}`}
                      onClick={() => setSelectedMapMetric(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <TerritorialMap
                geometry={dataset.mapGeometry}
                areas={mapAreas}
                metric={selectedMapMetric}
                selectedGeoKey={activeMapGeoKey}
                onSelect={setSelectedMapGeoKey}
              />
              <div className="meta-panel">
                <div className="meta-grid">
                  <div>
                    <div className="meta-label">Fuente</div>
                    <div className="meta-value">{selectedMapMetricMeta.source}</div>
                  </div>
                  <div>
                    <div className="meta-label">Tipo de dato</div>
                    <div className="meta-value">{selectedMapMetricMeta.dataType}</div>
                  </div>
                  <div>
                    <div className="meta-label">Nota metodológica</div>
                    <div className="meta-value">{selectedMapMetricMeta.note}</div>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="space-y-5 p-6">
              <div>
                <div className="text-base font-semibold text-ink-900">Resumen rápido por alcaldía</div>
                <div className="text-sm leading-6 text-ink-600">
                  Selecciona una alcaldía en el mapa para revisar actividad, riesgo, infraestructura y ranking territorial de la métrica activa.
                </div>
              </div>
              {selectedMapArea ? (
                <>
                  <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                    <div className="text-lg font-semibold text-ink-900">{selectedMapArea.alcaldia}</div>
                    <div className="mt-2 text-sm text-ink-600">`geoKey`: {selectedMapArea.geoKey} · ranking {selectedMapRank ?? "-"} de {mapRanking.length} en {selectedMapMetricMeta.label.toLowerCase()}</div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4 md:col-span-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Métrica activa</div>
                      <div className="mt-2 text-2xl font-semibold text-ink-900">{selectedMapMetricMeta.formatter(getSelectedMapMetricValue(selectedMapArea))}</div>
                      <div className="mt-2 text-xs text-ink-600">{selectedMapMetricMeta.label} · {selectedMapMetricMeta.dataType}</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Actividad</div>
                      <div className="mt-2 text-2xl font-semibold text-ink-900">{(selectedMapArea.activityRate * 100).toFixed(1)}%</div>
                      <div className="mt-2 text-xs text-ink-600">Estimado territorial</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Riesgo</div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="text-2xl font-semibold text-ink-900">{selectedMapArea.riskScore.toFixed(1)}</div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedMapArea.riskLevel === "Rojo" ? "bg-red-100 text-red-700" : selectedMapArea.riskLevel === "Amarillo" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {selectedMapArea.riskLevel}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-ink-600">Insight compuesto</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Sedes PILARES</div>
                      <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(pilaresMapSites)}</div>
                      <div className="mt-2 text-xs text-ink-600">Conteo real por sede</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Espacios PILARES</div>
                      <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(pilaresMapOperational)}</div>
                      <div className="mt-2 text-xs text-ink-600">Estimación operativa para lectura territorial</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Deportivos públicos</div>
                      <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(publicSportsMapSites)}</div>
                      <div className="mt-2 text-xs text-ink-600">Instalaciones reales integradas</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Obesidad</div>
                      <div className="mt-2 text-2xl font-semibold text-ink-900">{(selectedMapArea.obesityRate * 100).toFixed(1)}%</div>
                      <div className="mt-2 text-xs text-ink-600">Estimado territorial</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Diabetes</div>
                      <div className="mt-2 text-2xl font-semibold text-ink-900">{(selectedMapArea.diabetesRate * 100).toFixed(1)}%</div>
                      <div className="mt-2 text-xs text-ink-600">Estimado territorial</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Sedentarismo</div>
                      <div className="mt-2 text-2xl font-semibold text-ink-900">{(selectedMapArea.sedentaryRate * 100).toFixed(1)}%</div>
                      <div className="mt-2 text-xs text-ink-600">Estimado territorial</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-white px-4 py-4 md:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Infraestructura privada</div>
                          <div className="mt-2 text-2xl font-semibold text-ink-900">{formatNumber(privateMapUnits)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Infraestructura pública visible</div>
                          <div className="mt-2 text-xl font-semibold text-ink-900">{formatNumber(publicMapUnits)}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-ink-600">La capa privada proviene de DENUE y permanece etiquetada como preparada hasta validar SCIAN objetivo. Las cifras operativas no equivalen a sedes administrativas.</div>
                    </div>
                    <div className="rounded-2xl border border-mist-200 bg-mist-100/70 px-4 py-4 md:col-span-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-600">Cómo leer esta vista</div>
                      <div className="mt-2 text-sm leading-6 text-ink-700">{selectedMapMetricMeta.note}</div>
                      <div className="mt-2 text-xs text-ink-600">El mapa muestra diferencias territoriales; no implica causalidad entre infraestructura, salud y actividad.</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-mist-300 bg-mist-100/60 p-6 text-sm text-ink-600">
                  No hay alcaldías visibles para la selección actual.
                </div>
              )}
            </Card>
          </div>
          <Card className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-ink-900">Infraestructura detallada</div>
                <div className="text-sm leading-6 text-ink-600">
                  Tipos de espacio, deportes disponibles, conteo administrativo real y espacios operativos estimados. Se resume la tabla para evitar saturación inicial.
                </div>
              </div>
              <button className="btn-ghost" type="button" onClick={() => setShowFullInfrastructure((prev) => !prev)}>
                {showFullInfrastructure ? "Resumir vista" : "Expandir detalle"}
              </button>
            </div>
            {selectedSpaceType ? (
              <div className="rounded-2xl border border-mist-200 bg-mist-100/80 px-4 py-3 text-sm text-ink-700">
                Foco activo por tipo de espacio: <span className="font-semibold text-ink-900">{selectedSpaceType}</span>.
              </div>
            ) : null}
            <div className="meta-panel">
              <div className="meta-grid">
                <div>
                  <div className="meta-label">Fuente</div>
                  <div className="meta-value">{chartMeta.infrastructure.source}</div>
                </div>
                <div>
                  <div className="meta-label">Tipo de dato</div>
                  <div className="meta-value">Mixto: real para infraestructura pública nominal; preparado para privada DENUE; estimada para capacidad cuando no existe aforo.</div>
                </div>
                <div>
                  <div className="meta-label">Nota metodológica</div>
                  <div className="meta-value">Las sedes PILARES y deportivos públicos se cuentan como registros reales. Los espacios operativos son una aproximación analítica para capacidad territorial y no equivalen al número oficial de sedes.</div>
                </div>
              </div>
            </div>
            <DataTable
              title={showFullInfrastructure ? "Tabla completa" : "Resumen de infraestructura"}
              columns={infrastructureColumns}
              data={visibleInfrastructureTable}
              pageSize={showFullInfrastructure ? 10 : 6}
              onExport={(visibleColumns) => {
                const columnsToUse = visibleColumns.length > 0 ? visibleColumns : Object.keys(infrastructureTable[0] ?? {});
                const csv = [
                  columnsToUse.join(","),
                  ...infrastructureTable.map((row) =>
                    columnsToUse.map((column) => `"${String((row as Record<string, string>)[column] ?? "").replace(/"/g, '""')}"`).join(",")
                  )
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "infraestructura_detallada_deporte_cdmx.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}
              allowColumnSelector
              hideControls={presentationMode}
            />
          </Card>
        </section>
      ) : null}

      {activeSection === "Salud" ? (
        <section className="section-block">
          <div>
            <div className="section-kicker">4. Salud</div>
            <div className="section-heading">Salud relacionada y carga metabólica</div>
            <div className="section-copy">Los filtros de sexo, edad y año ajustan los indicadores cuando el modelo lo permite. La capa sigue etiquetada como estimada/modelada para evitar lecturas engañosas.</div>
          </div>
          <KpiGrid items={healthKpis} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Obesidad por alcaldía" helper="Lectura territorial para focalización" tooltip={chartMeta.health}>
              <DistributionBar data={obesityByAlcaldia} />
            </ChartCard>
            <ChartCard title="Sobrepeso + obesidad por alcaldía" helper="Indicador combinado de carga metabólica" tooltip={{ ...chartMeta.health, dataType: "insight" }}>
              <DistributionBar data={combinedWeightByAlcaldia} />
            </ChartCard>
            <ChartCard title="Obesidad por sexo" helper="ENSANUT 2022 preparada para filtros dinámicos" tooltip={chartMeta.health}>
              <DistributionPie data={obesityBySex} />
            </ChartCard>
            <ChartCard title="Obesidad por grupo de edad" helper="Gradiente de carga metabólica por edad" tooltip={chartMeta.health}>
              <DistributionBar data={obesityByAge} />
            </ChartCard>
            <ChartCard title="Diabetes por edad" helper="Útil para programas focalizados en 45+ y 60+" tooltip={chartMeta.health}>
              <DistributionBar data={diabetesByAge} />
            </ChartCard>
            <ChartCard title="Sedentarismo por alcaldía" helper="Complemento de la actividad modelada" tooltip={chartMeta.health}>
              <DistributionBar data={sedentaryByAlcaldia} />
            </ChartCard>
          </div>
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-ink-900">Cómo leer esta capa</div>
              <LayerBadge layer="estimado" />
            </div>
            <div className="text-sm leading-6 text-ink-700">
              Obesidad, sobrepeso, diabetes y sedentarismo están modelados a partir de ENSANUT 2022 y reglas de segmentación. No representan una observación oficial directa publicada por alcaldía.
            </div>
            <div className="text-xs text-ink-600">
              Los filtros de sexo, edad y año cambian esta vista cuando existe segmentación compatible. Si una lectura no cambia por falta de base observada directa, se mantiene la nota metodológica visible.
            </div>
          </Card>
        </section>
      ) : null}

      {activeSection === "Riesgo" ? (
        <section className="section-block">
          <div>
            <div className="section-kicker">5. Riesgo</div>
            <div className="section-heading">Índice de riesgo físico territorial</div>
            <div className="section-copy">Semáforo territorial para priorización institucional a partir de actividad, obesidad, sedentarismo e infraestructura per cápita.</div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="space-y-4 p-5">
              <div className="text-base font-semibold text-ink-900">Ranking de riesgo físico</div>
              <div className="space-y-3">
                {riskIndex.map((item, index) => (
                  <div key={item.alcaldia} className="flex items-center justify-between rounded-2xl border border-mist-200 bg-white px-4 py-4">
                    <div>
                      <div className="text-sm font-semibold text-ink-900">{index + 1}. {item.alcaldia}</div>
                      <div className="mt-1 text-xs text-ink-600">
                        Actividad {(item.activityRate * 100).toFixed(1)}% · Obesidad {(item.obesityRate * 100).toFixed(1)}% · Sedentarismo {(item.sedentaryRate * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.level === "Rojo" ? "bg-red-100 text-red-700" : item.level === "Amarillo" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {item.level}
                      </span>
                      <div className="text-lg font-semibold text-ink-900">{item.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold text-ink-900">Definición del modelo</div>
                <LayerBadge layer="insight" />
              </div>
              <div className="space-y-3 text-sm leading-6 text-ink-700">
                <p>Riesgo = actividad física inversa + obesidad + sedentarismo + infraestructura per cápita inversa.</p>
                <p>La lectura es relativa: un score más alto indica peor balance territorial entre activación, salud y cobertura disponible.</p>
                <p>Semáforo verde indica mejor condición relativa; amarillo representa vigilancia; rojo marca prioridad de intervención.</p>
                <p>El score es defendible para priorización institucional, no para diagnóstico clínico.</p>
              </div>
              <div className="meta-panel">
                <div className="meta-grid">
                  <div>
                    <div className="meta-label">Fuente</div>
                    <div className="meta-value">{chartMeta.risk.source}</div>
                  </div>
                  <div>
                    <div className="meta-label">Tipo de dato</div>
                    <div className="meta-value">{chartMeta.risk.dataType}</div>
                  </div>
                  <div>
                    <div className="meta-label">Nota metodológica</div>
                    <div className="meta-value">{chartMeta.risk.note}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      ) : null}

      {activeSection === "Metodología" ? (
        <section className="section-block">
          <div>
            <div className="section-kicker">6. Metodología</div>
            <div className="section-heading">Trazabilidad y preparación institucional</div>
            <div className="section-copy">Explica qué es real, estimado o proyectado, y deja explícita la ruta para integrar datos públicos oficiales sin cambiar la arquitectura.</div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-4 p-5">
              <div className="text-base font-semibold text-ink-900">Qué es real, estimado y proyectado</div>
              <div className="space-y-3 text-sm leading-6 text-ink-700">
                <p><span className="font-semibold">Real:</span> sedes, instalaciones o establecimientos observables por tipo y alcaldía.</p>
                <p><span className="font-semibold">Base oficial:</span> ENSANUT 2022, benchmarks MOPRADEF y población base.</p>
                <p><span className="font-semibold">Estimado:</span> actividad y salud territorializadas con reglas explícitas.</p>
                <p><span className="font-semibold">Estimado operativo:</span> espacios operativos o capacidad derivados analíticamente a partir de una sede o instalación real.</p>
                <p><span className="font-semibold">Proyectado:</span> 2026 y cualquier valor futuro sin observación oficial.</p>
              </div>
            </Card>
            <Card className="space-y-4 p-5">
              <div className="text-base font-semibold text-ink-900">Timeline y quiebres</div>
              <div className="space-y-3 text-sm leading-6 text-ink-700">
                {dataset.meta.timelineNotes.map((item) => <p key={item}>{item}</p>)}
                {dataset.meta.methodologyBreaks.map((item) => <p key={item}>{item}</p>)}
              </div>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-4 p-5">
              <div className="text-base font-semibold text-ink-900">Preparación para integración real</div>
              <div className="space-y-3 text-sm leading-6 text-ink-700">
                <p><span className="font-semibold">PILARES:</span> ya integrado por sede real con nombre, estatus, latitud, longitud y alcaldía normalizada.</p>
                <p><span className="font-semibold">Deportivos públicos:</span> ya integrado por instalación real con alcaldía y coordenadas cuando existen.</p>
                <p><span className="font-semibold">Directorio económico / gimnasios:</span> DENUE ya descargado y normalizado; permanece como preparado por falta de SCIAN verificable en este export.</p>
                <p><span className="font-semibold">Mapa:</span> geometría oficial de alcaldías ya conectada al `geoKey` del modelo territorial.</p>
              </div>
            </Card>
            <Card className="space-y-4 p-5">
              <div className="text-base font-semibold text-ink-900">Capas listas para ETL futuro</div>
              <div className="space-y-3 text-sm leading-6 text-ink-700">
                <p><span className="font-semibold">Infraestructura detallada:</span> ya existe contrato para registro real por tipo, deporte y capacidad.</p>
                <p><span className="font-semibold">Salud segmentada:</span> ya existe contrato por sexo, edad y año para sustituir la capa modelada.</p>
                <p><span className="font-semibold">Mapa institucional:</span> ya existe geometría SVG derivada de GeoJSON oficial, `geoKey`, riesgo, actividad e infraestructura por alcaldía.</p>
              </div>
            </Card>
          </div>

          <ExportableTable title="Trazabilidad por módulo" columns={methodologyColumns} data={methodologyRows} fileName="metodologia_deporte_cdmx.csv" presentationMode={presentationMode} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ExportableTable title="Registro de fuentes" columns={sourcesColumns} data={sourcesRows} fileName="fuentes_deporte_cdmx.csv" presentationMode={presentationMode} />
            <ExportableTable title="Chequeos de calidad" columns={qualityColumns} data={qualityRows} fileName="calidad_deporte_cdmx.csv" presentationMode={presentationMode} pageSize={6} />
          </div>
        </section>
      ) : null}

      {activeSection === "Datos" ? (
        <section className="section-block">
          <div>
            <div className="section-kicker">7. Datos</div>
            <div className="section-heading">Tablas para revisión institucional</div>
            <div className="section-copy">Vista territorial, modelo base para mapa y metadata exportable para revisión con equipos de gobierno, PILARES e INDEPORTE.</div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="space-y-3 p-5">
              <div className="text-base font-semibold text-ink-900">Vista territorial</div>
              <div className="text-sm leading-6 text-ink-700">La tabla consolida actividad, salud, infraestructura y metadata por fila territorial filtrada.</div>
            </Card>
            <Card className="space-y-3 p-5">
              <div className="text-base font-semibold text-ink-900">Modelo para mapa</div>
              <div className="text-sm leading-6 text-ink-700">El dataset ya incorpora `geoKey`, centroides, actividad y riesgo por alcaldía para un futuro choropleth o heatmap sin depender de APIs externas.</div>
            </Card>
            <Card className="space-y-3 p-5">
              <div className="text-base font-semibold text-ink-900">Estado del corte</div>
              <div className="text-sm leading-6 text-ink-700">Año base de salud: {dataset.meta.healthBaseYear}. Años base de actividad: {dataset.meta.activityBaseYears.join(", ")}. Años proyectados: {dataset.meta.projectedYears.join(", ")}.</div>
            </Card>
          </div>
          <ExportableTable title="Tabla territorial" columns={territorialColumns} data={territorialTable} fileName="datos_territoriales_deporte_cdmx.csv" presentationMode={presentationMode} pageSize={12} />
          <ExportableTable title="Modelo base para mapa" columns={mapColumns} data={mapRows} fileName="modelo_mapa_deporte_cdmx.csv" presentationMode={presentationMode} pageSize={12} />
        </section>
      ) : null}
    </div>
  );
}
