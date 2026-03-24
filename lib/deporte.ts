import type { RowRecord, SemanticFields, SheetData } from "./types";
import { formatNumber, formatPercent, normalizeKey, toNumber, uniq } from "./utils";

export type FilterConfigItem = {
  key: string;
  column: string;
  options: Array<{ label: string; value: string }>;
};

export type SportFilters = Record<string, string[]>;

export type StatusDatum = {
  name: string;
  value: number;
  percent: number;
  denominator: number;
};

export type InfrastructureBreakdownDatum = {
  name: string;
  total: number;
  deportivos: number;
  pilares: number;
  gimnasios: number;
  parques: number;
  actividadPct: number;
  infraPer100k: number;
};

export type RiskDatum = {
  name: string;
  score: number;
  nivel: "Alto" | "Medio" | "Bajo";
  actividadPct: number;
  obesidad: number;
  infraPer100k: number;
};

const getUniqueValues = (rows: RowRecord[], column?: string) => {
  if (!column) return [];
  return uniq(
    rows
      .map((row) => row[column])
      .filter((value) => typeof value === "string" && value.trim() !== "")
  ).sort((a, b) => a.localeCompare(b, "es"));
};

export const buildSportFilterConfig = (
  rows: RowRecord[],
  semantic: SemanticFields,
  sportsSheet?: SheetData | null,
  infrastructureSheet?: SheetData | null
): FilterConfigItem[] => {
  const entries = [
    { key: "Alcaldía", column: semantic.alcaldia },
    { key: "Año", column: semantic.anio },
    { key: "Sexo", column: semantic.sexo },
    { key: "Grupo de edad", column: semantic.grupoEdad },
    { key: "Deporte", column: semantic.deporte },
    { key: "Tipo de infraestructura", column: semantic.tipoInfraestructura }
  ];

  const filters = entries
    .filter((entry) => entry.column)
    .map((entry) => ({
      key: entry.key,
      column: entry.column as string,
      options: getUniqueValues(rows, entry.column).map((value) => ({ label: value, value }))
    }));

  return filters;
};

export const applyFilters = (rows: RowRecord[], filters: SportFilters) => {
  const activeFilters = Object.entries(filters).filter(([column, values]) => values.length > 0 && !column.startsWith("__"));
  if (activeFilters.length === 0) return rows;

  return rows.filter((row) =>
    activeFilters.every(([column, values]) => {
      const value = row[column];
      if (typeof value !== "string") return false;
      return values.some((item) => normalizeKey(item) === normalizeKey(value));
    })
  );
};

export const filterSportsSheet = (rows: RowRecord[], filters: SportFilters) => {
  return rows.filter((row) => {
    const sportSelected = filters.DeportePrincipal ?? filters.__deporte__ ?? [];
    const alcaldiaSelected = filters.Alcaldia ?? filters.alcaldia ?? [];
    const anioSelected = filters.Anio ?? filters.anio ?? [];
    if (sportSelected.length > 0 && !sportSelected.some((value) => normalizeKey(value) === normalizeKey(row.Deporte ?? ""))) {
      return false;
    }
    if (alcaldiaSelected.length > 0 && !alcaldiaSelected.some((value) => normalizeKey(value) === normalizeKey(row.Alcaldia ?? ""))) {
      return false;
    }
    if (anioSelected.length > 0 && !anioSelected.some((value) => normalizeKey(value) === normalizeKey(row.Anio ?? ""))) {
      return false;
    }
    return true;
  });
};

const sumColumn = (rows: RowRecord[], column?: string) => {
  if (!column) return 0;
  return rows.reduce((sum, row) => sum + (toNumber(row[column]) ?? 0), 0);
};

const averageColumn = (rows: RowRecord[], column?: string) => {
  if (!column || rows.length === 0) return 0;
  const values = rows.map((row) => toNumber(row[column])).filter((value): value is number => value !== null);
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const groupBy = (rows: RowRecord[], column?: string) => {
  const map = new Map<string, RowRecord[]>();
  if (!column) return map;
  rows.forEach((row) => {
    const key = row[column];
    if (!key) return;
    map.set(key, [...(map.get(key) ?? []), row]);
  });
  return map;
};

export const buildPanoramaKpis = (rows: RowRecord[], semantic: SemanticFields) => {
  const totalPopulation = sumColumn(rows, semantic.poblacionTotal);
  const activePopulation = sumColumn(rows, semantic.personasActivas);
  const activePct = totalPopulation > 0 ? activePopulation / totalPopulation : 0;

  const byAlcaldia = Array.from(groupBy(rows, semantic.alcaldia).entries()).map(([name, items]) => {
    const population = sumColumn(items, semantic.poblacionTotal);
    const active = sumColumn(items, semantic.personasActivas);
    return {
      name,
      population,
      active,
      pct: population > 0 ? active / population : 0
    };
  });

  const bySexo = Array.from(groupBy(rows, semantic.sexo).entries()).map(([name, items]) => ({
    name,
    pct: sumColumn(items, semantic.poblacionTotal) > 0
      ? sumColumn(items, semantic.personasActivas) / sumColumn(items, semantic.poblacionTotal)
      : 0
  }));

  const byEdad = Array.from(groupBy(rows, semantic.grupoEdad).entries()).map(([name, items]) => ({
    name,
    pct: sumColumn(items, semantic.poblacionTotal) > 0
      ? sumColumn(items, semantic.personasActivas) / sumColumn(items, semantic.poblacionTotal)
      : 0
  }));

  const topAlcaldia = [...byAlcaldia].sort((a, b) => b.pct - a.pct)[0];
  const sortedEdad = [...byEdad].sort((a, b) => b.pct - a.pct);
  const topEdad = sortedEdad[0];
  const bottomEdad = sortedEdad[sortedEdad.length - 1];
  const hombres = bySexo.find((item) => normalizeKey(item.name).includes("hombre"))?.pct ?? 0;
  const mujeres = bySexo.find((item) => normalizeKey(item.name).includes("mujer"))?.pct ?? 0;

  return [
    { label: "% población activa", value: formatPercent(activePct), helper: `${formatNumber(activePopulation)} personas activas modeladas` },
    { label: "Población total analizada", value: formatNumber(totalPopulation), helper: `${formatNumber(rows.length)} celdas territoriales preparadas` },
    { label: "Alcaldía más activa", value: topAlcaldia ? topAlcaldia.name : "Sin dato", helper: topAlcaldia ? formatPercent(topAlcaldia.pct) : "Sin dato" },
    { label: "Brecha H vs M", value: formatPercent(Math.abs(hombres - mujeres)), helper: `${formatPercent(hombres)} hombres vs ${formatPercent(mujeres)} mujeres` },
    { label: "Grupo más activo", value: topEdad ? topEdad.name : "Sin dato", helper: topEdad ? formatPercent(topEdad.pct) : "Sin dato" },
    { label: "Grupo menos activo", value: bottomEdad ? bottomEdad.name : "Sin dato", helper: bottomEdad ? formatPercent(bottomEdad.pct) : "Sin dato" }
  ];
};

export const buildRateDistribution = (rows: RowRecord[], groupColumn?: string, semantic?: SemanticFields) => {
  if (!groupColumn || !semantic?.poblacionTotal || !semantic.personasActivas) return [];
  return Array.from(groupBy(rows, groupColumn).entries())
    .map(([name, items]) => {
      const population = sumColumn(items, semantic.poblacionTotal);
      const active = sumColumn(items, semantic.personasActivas);
      return {
        name,
        value: active,
        percent: population > 0 ? active / population : 0,
        denominator: population
      };
    })
    .sort((a, b) => b.percent - a.percent);
};

export const buildInfrastructureVsActivity = (rows: RowRecord[], semantic: SemanticFields) => {
  if (!semantic.alcaldia) return [];
  return Array.from(groupBy(rows, semantic.alcaldia).entries())
    .map(([name, items]) => {
      const population = sumColumn(items, semantic.poblacionTotal);
      const active = sumColumn(items, semantic.personasActivas);
      const infrastructure = averageColumn(items, semantic.infraestructura);
      return {
        name,
        actividadPct: population > 0 ? active / population : 0,
        infraestructura: infrastructure,
        value: Math.round(infrastructure),
        percent: population > 0 ? active / population : 0,
        denominator: population
      };
    })
    .sort((a, b) => b.actividadPct - a.actividadPct);
};

export const buildInfrastructureBreakdown = (rows: RowRecord[], semantic: SemanticFields): InfrastructureBreakdownDatum[] => {
  if (!semantic.alcaldia) return [];
  return Array.from(groupBy(rows, semantic.alcaldia).entries()).map(([name, items]) => {
    const population = sumColumn(items, semantic.poblacionTotal);
    const active = sumColumn(items, semantic.personasActivas);
    const deportivos = Math.round(averageColumn(items, semantic.deportivos));
    const pilares = Math.round(averageColumn(items, semantic.pilares));
    const gimnasios = Math.round(averageColumn(items, semantic.gimnasios));
    const parques = Math.round(averageColumn(items, semantic.parques));
    const total = deportivos + pilares + gimnasios + parques;
    return {
      name,
      total,
      deportivos,
      pilares,
      gimnasios,
      parques,
      actividadPct: population > 0 ? active / population : 0,
      infraPer100k: population > 0 ? (total / population) * 100000 : 0
    };
  }).sort((a, b) => b.total - a.total);
};

export const buildHealthComparison = (rows: RowRecord[], semantic: SemanticFields, metric: "obesidad" | "diabetes" | "sobrepeso" | "sedentarismo") => {
  const column = metric === "obesidad"
    ? semantic.obesidad
    : metric === "diabetes"
      ? semantic.diabetes
      : metric === "sobrepeso"
        ? semantic.sobrepeso
        : semantic.sedentarismo;
  if (!semantic.alcaldia || !column) return [];
  return Array.from(groupBy(rows, semantic.alcaldia).entries())
    .map(([name, items]) => ({
      name,
      value: Math.round(averageColumn(items, column) * 10) / 10,
      percent: averageColumn(items, column) / 100,
      denominator: 100
    }))
    .sort((a, b) => b.value - a.value);
};

export const buildSportsParticipation = (sheet: SheetData | null, filters?: SportFilters, limit = 5) => {
  if (!sheet) return [];
  const filteredSheetRows = filters ? filterSportsSheet(sheet.rows, filters) : sheet.rows;
  const deporteColumn = sheet.columns.find((column) => normalizeKey(column).includes("deporte"));
  const participantsColumn = sheet.columns.find((column) => normalizeKey(column).includes("participantes"));
  if (!deporteColumn || !participantsColumn) return [];

  const total = sumColumn(filteredSheetRows, participantsColumn) || 1;
  const base = filteredSheetRows
    .map((row) => ({
      name: row[deporteColumn] ?? "Sin dato",
      value: toNumber(row[participantsColumn]) ?? 0,
      percent: (toNumber(row[participantsColumn]) ?? 0) / total,
      denominator: total
    }))
    .sort((a, b) => b.value - a.value);

  const sorted = base.filter((item) => item.name !== "Otros");
  const top = sorted.slice(0, limit);
  const remaining = sorted.slice(limit);
  const othersValue = remaining.reduce((sum, item) => sum + item.value, 0);
  if (othersValue > 0) {
    top.push({
      name: "Otros",
      value: othersValue,
      percent: othersValue / total,
      denominator: total
    });
  }
  return top;
};

export const buildStatusDistribution = (rows: RowRecord[], column: string): StatusDatum[] => {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const key = row[column];
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const denominator = Array.from(counts.values()).reduce((sum, value) => sum + value, 0) || 1;
  return Array.from(counts.entries()).map(([name, value]) => ({
    name,
    value,
    percent: value / denominator,
    denominator
  }));
};

export const buildMethodologyHighlights = (rows: RowRecord[]) => {
  if (rows.length === 0) return [];
  const sample = rows[0];
  return [
    { label: "Población", value: sample.ClasificacionPoblacionTotal ?? "Sin dato", helper: sample.FuentePoblacionTotal ?? "" },
    { label: "Actividad", value: sample.ClasificacionPersonasActivas ?? "Sin dato", helper: sample.FuentePersonasActivas ?? "" },
    { label: "Infraestructura", value: sample.ClasificacionInfraestructura ?? "Sin dato", helper: sample.FuenteInfraestructura ?? "" },
    { label: "Salud", value: sample.ClasificacionSalud ?? "Sin dato", helper: sample.FuenteSalud ?? "" }
  ];
};

export const buildRiskIndex = (rows: RowRecord[], semantic: SemanticFields): RiskDatum[] => {
  if (!semantic.alcaldia || !semantic.obesidad || !semantic.personasActivas || !semantic.poblacionTotal) return [];
  return Array.from(groupBy(rows, semantic.alcaldia).entries()).map(([name, items]) => {
    const population = sumColumn(items, semantic.poblacionTotal);
    const active = sumColumn(items, semantic.personasActivas);
    const actividadPct = population > 0 ? (active / population) * 100 : 0;
    const obesidad = averageColumn(items, semantic.obesidad);
    const infraPer100k = averageColumn(items, "InfraestructuraPor100k");
    const score = Math.round((Math.max(0, 50 - actividadPct) * 0.6) + (obesidad * 0.4));
    const nivel: RiskDatum["nivel"] = actividadPct < 40 && obesidad >= 36 ? "Alto" : actividadPct >= 46 ? "Bajo" : "Medio";
    return { name, score, nivel, actividadPct, obesidad, infraPer100k };
  }).sort((a, b) => b.score - a.score);
};

export const buildDatasetInsights = (rows: RowRecord[], semantic: SemanticFields) => {
  const activityByAlcaldia = buildRateDistribution(rows, semantic.alcaldia, semantic);
  const obesityByAlcaldia = buildHealthComparison(rows, semantic, "obesidad");
  const infrastructure = buildInfrastructureBreakdown(rows, semantic);
  const risks = buildRiskIndex(rows, semantic);
  const topActivity = activityByAlcaldia[0];
  const lowestActivity = activityByAlcaldia[activityByAlcaldia.length - 1];
  const topObesity = obesityByAlcaldia[0];
  const topRisk = risks[0];
  const infraGap = [...infrastructure].sort((a, b) => a.infraPer100k - b.infraPer100k)[0];

  return [
    topActivity ? `${topActivity.name} lidera en actividad física modelada con ${formatPercent(topActivity.percent)} de población activa.` : null,
    lowestActivity ? `${lowestActivity.name} muestra la menor activación relativa con ${formatPercent(lowestActivity.percent)} y requiere intervención focalizada.` : null,
    topObesity ? `${topObesity.name} concentra la prevalencia de obesidad más alta del corte preparado (${topObesity.value.toFixed(1)}%).` : null,
    topRisk ? `${topRisk.name} combina menor resiliencia física relativa y mayor presión de salud, por lo que aparece primero en el índice de riesgo físico.` : null,
    infraGap ? `${infraGap.name} presenta alta población con baja infraestructura per cápita, indicando una brecha crítica de cobertura deportiva.` : null
  ].filter(Boolean) as string[];
};
