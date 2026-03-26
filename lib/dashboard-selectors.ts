import type {
  CanchaOperationalRecord,
  CanchasFilterState,
  DashboardDataset,
  DashboardFilterState,
  DataLayer,
  HealthProfileRecord,
  InfrastructureDetailRecord,
  MapAreaRecord,
  SportsRecord,
  TerritorialRecord
} from "./dashboard-types";
import { formatNumber } from "./utils";

export type SelectOption = { label: string; value: string };

export type DistributionDatum = {
  name: string;
  value: number;
  percent: number;
  denominator: number;
};

export type InfrastructureDatum = {
  name: string;
  deportivos: number;
  pilares: number;
  gimnasiosPrivados: number;
  clubesPrivados: number;
  academiasPrivadas: number;
  parques: number;
  total: number;
  density: number;
  activityRate: number;
};

export type RiskDatum = {
  alcaldia: string;
  score: number;
  level: "Verde" | "Amarillo" | "Rojo";
  activityRate: number;
  obesityRate: number;
  sedentaryRate: number;
  infraCoverage: number;
};

export type ExecutiveInfrastructureDatum = {
  key: string;
  label: string;
  administrativeTotal: number;
  operationalTotal: number;
  administrativePercent: number;
  operationalPercent: number;
  isPrivate: boolean;
};

export type CanchasExecutiveInsight = {
  title: string;
  body: string;
};

export const emptyFilters: DashboardFilterState = {
  alcaldias: [],
  years: [],
  sexes: [],
  ageGroups: [],
  sports: [],
  infrastructureTypes: []
};

export const emptyCanchasFilters: CanchasFilterState = {
  alcaldias: [],
  operationalStatuses: [],
  inaugurationStatuses: [],
  figurePresence: [],
  schedulePresence: [],
  activityPresence: [],
  types: [],
  materials: [],
  origins: []
};

const uniq = (items: string[]) => Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, "es"));

export const buildFilterConfig = (dataset: DashboardDataset) => {
  const records = dataset.territorialRecords;
  const sports = dataset.sportsRecords;
  const infrastructureDetails = dataset.infrastructureDetails;
  return [
    { title: "Alcaldía", key: "alcaldias" as const, options: uniq(records.map((item) => item.alcaldia)).map((value) => ({ label: value, value })) },
    { title: "Año", key: "years" as const, options: uniq(records.map((item) => String(item.year))).map((value) => ({ label: value, value })) },
    { title: "Sexo", key: "sexes" as const, options: uniq(records.map((item) => item.sex)).map((value) => ({ label: value, value })) },
    { title: "Grupo de edad", key: "ageGroups" as const, options: uniq(records.map((item) => item.ageGroup)).map((value) => ({ label: value, value })) },
    { title: "Deporte", key: "sports" as const, options: uniq(sports.map((item) => item.sport)).map((value) => ({ label: value, value })) },
    {
      title: "Tipo de infraestructura",
      key: "infrastructureTypes" as const,
      options: uniq(infrastructureDetails.map((item) => item.infrastructureType)).map((value) => ({ label: value, value }))
    }
  ];
};

const recordHasSelectedInfrastructure = (record: TerritorialRecord, infrastructureTypes: string[]) => {
  if (infrastructureTypes.length === 0) return true;
  return infrastructureTypes.some((type) => {
    if (type === "PILARES") return record.pilares > 0;
    if (type === "Deportivos públicos") return record.publicSportsCenters > 0;
    if (type === "Gimnasio privado") return record.privateGyms > 0;
    if (type === "Club deportivo privado") return record.privateGyms > 0;
    if (type === "Academia deportiva privada") return record.privateGyms > 0;
    if (type === "Parques / áreas verdes") return record.parks > 0;
    return false;
  });
};

export const filterTerritorialRecords = (records: TerritorialRecord[], filters: DashboardFilterState) => {
  return records.filter((record) => {
    if (filters.alcaldias.length > 0 && !filters.alcaldias.includes(record.alcaldia)) return false;
    if (filters.years.length > 0 && !filters.years.includes(String(record.year))) return false;
    if (filters.sexes.length > 0 && !filters.sexes.includes(record.sex)) return false;
    if (filters.ageGroups.length > 0 && !filters.ageGroups.includes(record.ageGroup)) return false;
    if (filters.sports.length > 0 && !filters.sports.includes(record.sportFocus)) return false;
    if (!recordHasSelectedInfrastructure(record, filters.infrastructureTypes)) return false;
    return true;
  });
};

export const filterSportsRecords = (records: SportsRecord[], filters: DashboardFilterState) => {
  return records.filter((record) => {
    if (filters.alcaldias.length > 0 && !filters.alcaldias.includes(record.alcaldia)) return false;
    if (filters.years.length > 0 && !filters.years.includes(String(record.year))) return false;
    if (filters.sexes.length > 0 && !filters.sexes.includes(record.sex)) return false;
    if (filters.ageGroups.length > 0 && !filters.ageGroups.includes(record.ageGroup)) return false;
    if (filters.sports.length > 0 && !filters.sports.includes(record.sport)) return false;
    return true;
  });
};

export const filterHealthProfiles = (records: HealthProfileRecord[], filters: DashboardFilterState) => {
  return records.filter((record) => {
    if (filters.years.length > 0 && !filters.years.includes(String(record.year))) return false;
    if (filters.sexes.length > 0 && !filters.sexes.includes(record.sex)) return false;
    if (filters.ageGroups.length > 0 && !filters.ageGroups.includes(record.ageGroup)) return false;
    return true;
  });
};

export const filterInfrastructureDetails = (records: InfrastructureDetailRecord[], filters: DashboardFilterState) => {
  return records.filter((record) => {
    if (filters.alcaldias.length > 0 && !filters.alcaldias.includes(record.alcaldia)) return false;
    if (filters.years.length > 0 && !filters.years.includes(String(record.year))) return false;
    if (filters.infrastructureTypes.length > 0 && !filters.infrastructureTypes.includes(record.infrastructureType)) return false;
    if (filters.sports.length > 0 && !record.sportsAvailable.some((sport) => filters.sports.includes(sport))) return false;
    return true;
  });
};

const sum = (items: number[]) => items.reduce((acc, value) => acc + value, 0);
const share = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);

const weightedAverage = (records: TerritorialRecord[], metric: (record: TerritorialRecord) => number) => {
  const denominator = sum(records.map((record) => record.population)) || 1;
  const numerator = sum(records.map((record) => metric(record) * record.population));
  return numerator / denominator;
};

const groupBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  });
  return map;
};

export const buildOverviewKpis = (records: TerritorialRecord[]) => {
  const totalPopulation = sum(records.map((record) => record.population));
  const totalActive = sum(records.map((record) => record.activePopulation));
  const activityRate = totalPopulation > 0 ? totalActive / totalPopulation : 0;

  const byAlcaldia = Array.from(groupBy(records, (record) => record.alcaldia)).map(([name, items]) => ({
    name,
    rate: weightedAverage(items, (item) => item.activeRate)
  }));
  const bySex = Array.from(groupBy(records, (record) => record.sex)).map(([name, items]) => ({
    name,
    rate: weightedAverage(items, (item) => item.activeRate)
  }));
  const byAge = Array.from(groupBy(records, (record) => record.ageGroup)).map(([name, items]) => ({
    name,
    rate: weightedAverage(items, (item) => item.activeRate)
  }));

  const topAlcaldia = [...byAlcaldia].sort((a, b) => b.rate - a.rate)[0];
  const sortedAge = [...byAge].sort((a, b) => b.rate - a.rate);
  const men = bySex.find((item) => item.name === "Hombres")?.rate ?? 0;
  const women = bySex.find((item) => item.name === "Mujeres")?.rate ?? 0;

  return [
    { label: "% población activa", value: `${(activityRate * 100).toFixed(1)}%`, helper: `${formatNumber(totalActive)} personas activas modeladas` },
    { label: "Población total analizada", value: formatNumber(totalPopulation), helper: `${records.length} celdas territoriales filtradas` },
    { label: "Alcaldía más activa", value: topAlcaldia?.name ?? "Sin dato", helper: topAlcaldia ? `${(topAlcaldia.rate * 100).toFixed(1)}% de actividad` : "Sin dato" },
    { label: "Brecha hombres vs mujeres", value: `${(Math.abs(men - women) * 100).toFixed(1)} pp`, helper: `${(men * 100).toFixed(1)}% hombres vs ${(women * 100).toFixed(1)}% mujeres` },
    { label: "Grupo más activo", value: sortedAge[0]?.name ?? "Sin dato", helper: sortedAge[0] ? `${(sortedAge[0].rate * 100).toFixed(1)}%` : "Sin dato" },
    { label: "Grupo menos activo", value: sortedAge[sortedAge.length - 1]?.name ?? "Sin dato", helper: sortedAge[sortedAge.length - 1] ? `${(sortedAge[sortedAge.length - 1].rate * 100).toFixed(1)}%` : "Sin dato" }
  ];
};

export const buildRateDistribution = (
  records: TerritorialRecord[],
  getKey: (record: TerritorialRecord) => string,
  metric: (record: TerritorialRecord) => number = (record) => record.activePopulation
): DistributionDatum[] => {
  return Array.from(groupBy(records, getKey)).map(([name, items]) => {
    const denominator = sum(items.map((item) => item.population)) || 1;
    const value = sum(items.map((item) => metric(item)));
    const percent = value > denominator ? weightedAverage(items, metric) : value / denominator;
    return { name, value, percent, denominator };
  }).sort((a, b) => b.percent - a.percent);
};

export const buildMetricByAlcaldia = (
  records: TerritorialRecord[],
  metric: keyof Pick<TerritorialRecord, "obesityRate" | "overweightRate" | "combinedWeightRiskRate" | "diabetesRate" | "sedentaryRate">
) => {
  return Array.from(groupBy(records, (record) => record.alcaldia)).map(([name, items]) => ({
    name,
    value: weightedAverage(items, (item) => item[metric]) * 100,
    percent: weightedAverage(items, (item) => item[metric]),
    denominator: 100
  })).sort((a, b) => b.value - a.value);
};

export const buildHealthDistribution = (
  records: HealthProfileRecord[],
  groupByKey: "sex" | "ageGroup",
  metric: keyof Pick<HealthProfileRecord, "obesityRate" | "overweightRate" | "diabetesRate" | "sedentaryRate">
) => {
  return Array.from(groupBy(records, (record) => record[groupByKey])).map(([name, items]) => ({
    name,
    value: (items.reduce((sum, item) => sum + item[metric], 0) / (items.length || 1)) * 100,
    percent: items.reduce((sum, item) => sum + item[metric], 0) / (items.length || 1),
    denominator: 100
  })).sort((a, b) => b.value - a.value);
};

export const buildInfrastructureByAlcaldia = (records: TerritorialRecord[], filters: DashboardFilterState): InfrastructureDatum[] => {
  return Array.from(groupBy(records, (record) => record.alcaldia)).map(([name, items]) => {
    const sample = items[0];
    const population = sum(items.map((item) => item.population)) || 1;
    const includeAll = filters.infrastructureTypes.length === 0;
    const deportivos = includeAll || filters.infrastructureTypes.includes("Deportivos públicos") ? sample.publicSportsCenters : 0;
    const pilares = includeAll || filters.infrastructureTypes.includes("PILARES") ? sample.pilares : 0;
    const gimnasiosPrivados = includeAll || filters.infrastructureTypes.includes("Gimnasio privado") ? sample.privateGyms : 0;
    const clubesPrivados = includeAll || filters.infrastructureTypes.includes("Club deportivo privado") ? 0 : 0;
    const academiasPrivadas = includeAll || filters.infrastructureTypes.includes("Academia deportiva privada") ? 0 : 0;
    const parques = includeAll || filters.infrastructureTypes.includes("Parques / áreas verdes") ? sample.parks : 0;
    const total = deportivos + pilares + gimnasiosPrivados + clubesPrivados + academiasPrivadas + parques;
    return {
      name,
      deportivos,
      pilares,
      gimnasiosPrivados,
      clubesPrivados,
      academiasPrivadas,
      parques,
      total,
      density: (total / population) * 100000,
      activityRate: weightedAverage(items, (item) => item.activeRate)
    };
  }).sort((a, b) => b.total - a.total);
};

const getInfrastructureCategoryLabel = (record: InfrastructureDetailRecord) => {
  if (record.infrastructureType === "Gimnasio privado") return "Gimnasios privados";
  if (record.infrastructureType === "Club deportivo privado") return "Clubes deportivos";
  if (record.infrastructureType === "Academia deportiva privada") return "Academias deportivas";
  if (record.infrastructureType === "Deportivos públicos") return "Deportivos públicos";
  if (record.infrastructureType === "Parques / áreas verdes") return "Parques";
  return "PILARES";
};

export const buildInfrastructureStackedByAlcaldia = (records: InfrastructureDetailRecord[]) => {
  return Array.from(groupBy(records, (record) => record.alcaldia)).map(([alcaldia, items]) => {
    const summary: Record<string, string | number> = {
      name: alcaldia,
      "PILARES": 0,
      "Deportivos públicos": 0,
      "Gimnasios privados": 0,
      "Clubes deportivos": 0,
      "Academias deportivas": 0,
      "Parques": 0
    };
    items.forEach((item) => {
      const label = getInfrastructureCategoryLabel(item);
      summary[label] = Number(summary[label] ?? 0) + item.administrativeCount;
    });
    return summary;
  }).sort((a, b) => {
    const totalA =
      Number(a["PILARES"]) +
      Number(a["Deportivos públicos"]) +
      Number(a["Gimnasios privados"]) +
      Number(a["Clubes deportivos"]) +
      Number(a["Academias deportivas"]) +
      Number(a["Parques"]);
    const totalB =
      Number(b["PILARES"]) +
      Number(b["Deportivos públicos"]) +
      Number(b["Gimnasios privados"]) +
      Number(b["Clubes deportivos"]) +
      Number(b["Academias deportivas"]) +
      Number(b["Parques"]);
    return totalB - totalA;
  });
};

export const buildSportsTop = (sportsRecords: SportsRecord[], limit: 5 | 10) => {
  const grouped = Array.from(groupBy(sportsRecords, (record) => record.sport)).map(([name, items]) => ({
    name,
    value: sum(items.map((item) => item.participants)),
    denominator: sum(sportsRecords.map((item) => item.participants)) || 1
  })).map((item) => ({
    ...item,
    percent: item.value / item.denominator
  })).sort((a, b) => b.value - a.value);

  const top = grouped.slice(0, limit);
  const remaining = grouped.slice(limit);
  const remainingValue = sum(remaining.map((item) => item.value));
  if (remainingValue > 0) {
    top.push({
      name: "Otros",
      value: remainingValue,
      percent: remainingValue / (grouped[0]?.denominator ?? 1),
      denominator: grouped[0]?.denominator ?? 1
    });
  }
  return top;
};

export const buildBarrierDistribution = () => {
  return [
    { name: "Falta de tiempo", value: 52.1, percent: 0.521, denominator: 100 },
    { name: "Problemas de salud", value: 17.9, percent: 0.179, denominator: 100 },
    { name: "Cansancio laboral", value: 15.2, percent: 0.152, denominator: 100 }
  ];
};

export const buildYearTrend = (records: TerritorialRecord[]) => {
  return Array.from(groupBy(records, (record) => String(record.year))).map(([name, items]) => {
    const denominator = sum(items.map((item) => item.population)) || 1;
    const active = sum(items.map((item) => item.activePopulation));
    return {
      name,
      value: active,
      percent: active / denominator,
      denominator
    };
  }).sort((a, b) => Number(a.name) - Number(b.name));
};

export const buildInfrastructureDetailRows = (records: InfrastructureDetailRecord[]) => {
  return records.map((record) => ({
    "Año": String(record.year),
    "Alcaldía": record.alcaldia,
    "Geo key": record.geoKey ?? "",
    "Tipo de infraestructura": record.infrastructureType,
    "Sector": record.infrastructureType.includes("privado") ? "Privado" : "Público / comunitario",
    "Tipo de espacio": record.tipo_espacio,
    "Espacio": record.spaceName,
    "Conteo administrativo": formatNumber(record.administrativeCount),
    "Etiqueta administrativa": record.administrativeLabel,
    "Espacios operativos estimados": formatNumber(record.operationalUnits),
    "Etiqueta operativa": record.operationalLabel,
    "Capacidad": formatNumber(record.capacity),
    "Tipo de capacidad": record.capacityType,
    "Estatus": record.status ?? "",
    "Latitud": record.latitude?.toFixed(6) ?? "",
    "Longitud": record.longitude?.toFixed(6) ?? "",
    "Deportes disponibles": record.sportsAvailable.join(", "),
    "Tipo de dato": record.dataType,
    "Dataset origen": record.sourceDataset ?? "",
    "Fuente": record.source,
    "Nota metodológica": record.methodologicalNote
  }));
};

export const buildInfrastructureSportsSummary = (records: InfrastructureDetailRecord[]) => {
  const sportMap = new Map<string, number>();
  records.forEach((record) => {
    record.sportsAvailable.forEach((sport) => {
      sportMap.set(sport, (sportMap.get(sport) ?? 0) + record.operationalUnits);
    });
  });
  return Array.from(sportMap.entries()).map(([name, value]) => ({
    name,
    value,
    percent: value / (sum(Array.from(sportMap.values())) || 1),
    denominator: sum(Array.from(sportMap.values())) || 1
  })).sort((a, b) => b.value - a.value);
};

export const buildInfrastructureExecutiveSummary = (records: InfrastructureDetailRecord[]) => {
  const totalAdministrative = sum(records.map((record) => record.administrativeCount)) || 1;
  const totalOperational = sum(records.map((record) => record.operationalUnits)) || 1;
  const grouped = Array.from(groupBy(records, (record) => getInfrastructureCategoryLabel(record))).map(([tipo, items]) => {
    const administrativeTotal = sum(items.map((item) => item.administrativeCount));
    const operationalTotal = sum(items.map((item) => item.operationalUnits));
    const privateUnits = sum(
      items.map((item) => (item.sourceDataset === "Directorio Estadístico de Unidades Económicas CDMX" ? item.administrativeCount : 0))
    );
    return {
      key: tipo,
      label: tipo,
      administrativeTotal,
      operationalTotal,
      administrativePercent: administrativeTotal / totalAdministrative,
      operationalPercent: operationalTotal / totalOperational,
      isPrivate: privateUnits === administrativeTotal && administrativeTotal > 0
    };
  });

  return grouped.sort((a, b) => b.administrativeTotal - a.administrativeTotal);
};

export const buildInfrastructureAlcaldiaExtremes = (records: InfrastructureDetailRecord[]) => {
  const grouped = Array.from(groupBy(records, (record) => record.alcaldia)).map(([alcaldia, items]) => ({
    alcaldia,
    administrativeTotal: sum(items.map((item) => item.administrativeCount)),
    operationalTotal: sum(items.map((item) => item.operationalUnits))
  }));

  const byAdministrative = [...grouped].sort((a, b) => b.administrativeTotal - a.administrativeTotal);
  const byOperational = [...grouped].sort((a, b) => b.operationalTotal - a.operationalTotal);
  return {
    highestAdministrative: byAdministrative[0] ?? null,
    lowestAdministrative: byAdministrative[byAdministrative.length - 1] ?? null,
    highestOperational: byOperational[0] ?? null,
    lowestOperational: byOperational[byOperational.length - 1] ?? null
  };
};

export const buildDataLayerSummary = (records: TerritorialRecord[]) => {
  const counts = new Map<DataLayer, number>();
  records.forEach((record) => {
    counts.set(record.infrastructureDataType, (counts.get(record.infrastructureDataType) ?? 0) + 1);
    counts.set(record.healthDataType, (counts.get(record.healthDataType) ?? 0) + 1);
    counts.set(record.activityDataType, (counts.get(record.activityDataType) ?? 0) + 1);
  });
  return [
    { label: "Dato real", value: String(counts.get("real") ?? 0), helper: "Infraestructura contable y observable" },
    { label: "Base oficial", value: String(counts.get("base_oficial") ?? 0), helper: "Población base censal" },
    { label: "Estimado", value: String(counts.get("estimado") ?? 0), helper: "Actividad y salud territorializadas" },
    { label: "Proyectado / preparado", value: String((counts.get("proyectado") ?? 0) + (counts.get("preparado") ?? 0)), helper: "Escenarios y capas de planeación" }
  ];
};

export const buildRiskIndex = (records: TerritorialRecord[], filters: DashboardFilterState): RiskDatum[] => {
  const infrastructure = buildInfrastructureByAlcaldia(records, filters);
  const densities = infrastructure.map((item) => item.density);
  const maxDensity = Math.max(...densities, 1);

  return Array.from(groupBy(records, (record) => record.alcaldia)).map(([alcaldia, items]) => {
    const activityRate = weightedAverage(items, (item) => item.activeRate);
    const obesityRate = weightedAverage(items, (item) => item.obesityRate);
    const sedentaryRate = weightedAverage(items, (item) => item.sedentaryRate);
    const density = infrastructure.find((item) => item.name === alcaldia)?.density ?? 0;
    const infraPenalty = 1 - density / maxDensity;
    const score =
      ((1 - activityRate) * 38) +
      (obesityRate * 27) +
      (sedentaryRate * 20) +
      (infraPenalty * 15);
    const level: RiskDatum["level"] = score >= 32 ? "Rojo" : score >= 24 ? "Amarillo" : "Verde";
    return {
      alcaldia,
      score: Number(score.toFixed(1)),
      level,
      activityRate,
      obesityRate,
      sedentaryRate,
      infraCoverage: density
    };
  }).sort((a, b) => b.score - a.score);
};

export const buildFlattenedTableRows = (records: TerritorialRecord[]) => {
  return records.map((record) => ({
    Alcaldía: record.alcaldia,
    Año: String(record.year),
    Sexo: record.sex,
    "Grupo de edad": record.ageGroup,
    "Población": formatNumber(record.population),
    "% activa": `${(record.activeRate * 100).toFixed(1)}%`,
    "Activos": formatNumber(record.activePopulation),
    "Sedentarismo": `${(record.sedentaryRate * 100).toFixed(1)}%`,
    "Obesidad": `${(record.obesityRate * 100).toFixed(1)}%`,
    "Sobrepeso": `${(record.overweightRate * 100).toFixed(1)}%`,
    "Sobrepeso + obesidad": `${(record.combinedWeightRiskRate * 100).toFixed(1)}%`,
    "Diabetes": `${(record.diabetesRate * 100).toFixed(1)}%`,
    "PILARES": String(record.pilares),
    "Deportivos públicos": String(record.publicSportsCenters),
    "Infraestructura privada": String(record.privateGyms),
    "Parques / áreas verdes": String(record.parks),
    "Densidad infra x100k": record.infraPer100k.toFixed(1),
    "Tipo dato actividad": record.activityDataType,
    "Tipo dato salud": record.healthDataType,
    "Tipo dato infraestructura": record.infrastructureDataType,
    "Fuente actividad": record.activitySource,
    "Fuente salud": record.healthSource,
    "Fuente infraestructura": record.infrastructureSource,
    "Nota metodológica": record.methodologicalNote
  }));
};

export const buildMapAreaLookup = (records: MapAreaRecord[]) => {
  return records.reduce<Record<string, MapAreaRecord>>((acc, record) => {
    acc[record.geoKey] = record;
    return acc;
  }, {});
};

const canchaPresenceLabel = (value: boolean, positive: string, negative: string) => (value ? positive : negative);

export const buildCanchasFilterConfig = (records: CanchaOperationalRecord[]) => [
  { title: "Alcaldía", key: "alcaldias" as const, options: uniq(records.map((item) => item.alcaldia)).map((value) => ({ label: value, value })) },
  {
    title: "Estatus operativo",
    key: "operationalStatuses" as const,
    options: [
      { label: "Completa", value: "completa" },
      { label: "Parcial", value: "parcial" },
      { label: "Pendiente", value: "pendiente" }
    ]
  },
  {
    title: "Estatus de inauguración",
    key: "inaugurationStatuses" as const,
    options: [
      { label: "Inaugurada", value: "inaugurada" },
      { label: "Próxima", value: "proxima" },
      { label: "Sin fecha", value: "sin_fecha" }
    ]
  },
  {
    title: "Figura educativa",
    key: "figurePresence" as const,
    options: [
      { label: "Con figura educativa", value: "con_figura" },
      { label: "Sin figura educativa", value: "sin_figura" }
    ]
  },
  {
    title: "Horario",
    key: "schedulePresence" as const,
    options: [
      { label: "Con horario", value: "con_horario" },
      { label: "Sin horario", value: "sin_horario" }
    ]
  },
  {
    title: "Actividades",
    key: "activityPresence" as const,
    options: [
      { label: "Con actividades", value: "con_actividades" },
      { label: "Sin actividades", value: "sin_actividades" }
    ]
  },
  { title: "Tipo de cancha", key: "types" as const, options: uniq(records.map((item) => item.tipoCancha).filter(Boolean) as string[]).map((value) => ({ label: value, value })) },
  { title: "Material", key: "materials" as const, options: uniq(records.map((item) => item.material).filter(Boolean) as string[]).map((value) => ({ label: value, value })) },
  { title: "Origen", key: "origins" as const, options: uniq(records.map((item) => item.origen).filter(Boolean) as string[]).map((value) => ({ label: value, value })) }
];

export const filterCanchasRecords = (
  records: CanchaOperationalRecord[],
  filters: CanchasFilterState,
  globalFilters: DashboardFilterState
) => {
  return records.filter((record) => {
    if (globalFilters.alcaldias.length > 0 && !globalFilters.alcaldias.includes(record.alcaldia)) return false;
    if (globalFilters.years.length > 0 && !globalFilters.years.includes(String(record.year))) return false;
    if (filters.alcaldias.length > 0 && !filters.alcaldias.includes(record.alcaldia)) return false;
    if (filters.operationalStatuses.length > 0 && !filters.operationalStatuses.includes(record.operationalStatus)) return false;
    if (filters.inaugurationStatuses.length > 0 && !filters.inaugurationStatuses.includes(record.inaugurationStatus)) return false;
    if (filters.figurePresence.length > 0 && !filters.figurePresence.includes(record.hasFigureEducativa ? "con_figura" : "sin_figura")) return false;
    if (filters.schedulePresence.length > 0 && !filters.schedulePresence.includes(record.hasSchedule ? "con_horario" : "sin_horario")) return false;
    if (filters.activityPresence.length > 0 && !filters.activityPresence.includes(record.hasActivities ? "con_actividades" : "sin_actividades")) return false;
    if (filters.types.length > 0 && !filters.types.includes(record.tipoCancha ?? "")) return false;
    if (filters.materials.length > 0 && !filters.materials.includes(record.material ?? "")) return false;
    if (filters.origins.length > 0 && !filters.origins.includes(record.origen ?? "")) return false;
    return true;
  });
};

export const buildCanchasKpis = (records: CanchaOperationalRecord[]) => [
  { label: "Total de canchas", value: formatNumber(records.length), helper: "Registros operativos integrados desde el Excel real" },
  { label: "Inauguradas", value: formatNumber(records.filter((item) => item.inaugurationStatus === "inaugurada").length), helper: "Fecha válida pasada o señal explícita de inauguración" },
  { label: "Próximas", value: formatNumber(records.filter((item) => item.inaugurationStatus === "proxima").length), helper: "Fecha futura o mención tentativa / por inaugurar" },
  { label: "Pendientes", value: formatNumber(records.filter((item) => item.operationalStatus === "pendiente").length), helper: "Información mínima para operación" },
  { label: "Con datos completos", value: formatNumber(records.filter((item) => item.operationalStatus === "completa").length), helper: "Fecha + dato operativo básico + horario + actividades" },
  { label: "Con horario", value: formatNumber(records.filter((item) => item.hasSchedule).length), helper: "Horario operativo o malla horaria capturada" },
  { label: "Con responsable PILARES", value: formatNumber(records.filter((item) => Boolean(item.assignedPilaresResponsibleName)).length), helper: "Responsable de sede identificado desde el catálogo PILARES" },
  { label: "Con actividades", value: formatNumber(records.filter((item) => item.hasActivities).length), helper: "Actividades operativas registradas en la base" }
];

const buildOperationalTrafficLight = (record: CanchaOperationalRecord) => {
  if (record.operationalStatus === "completa") return "Verde";
  if (record.operationalStatus === "lista_para_operar" || record.operationalStatus === "parcial") return "Amarillo";
  return "Rojo";
};

export const buildCanchasSummaryRows = (records: CanchaOperationalRecord[]) => {
  return Array.from(groupBy(records, (record) => record.alcaldia))
    .map(([alcaldia, items]) => ({
      Alcaldía: alcaldia,
      "Total de canchas": formatNumber(items.length),
      Inauguradas: formatNumber(items.filter((item) => item.inaugurationStatus === "inaugurada").length),
      Próximas: formatNumber(items.filter((item) => item.inaugurationStatus === "proxima").length),
      "Sin fecha": formatNumber(items.filter((item) => item.inaugurationStatus === "sin_fecha").length),
      Completas: formatNumber(items.filter((item) => item.operationalStatus === "completa").length),
      "Lista para operar": formatNumber(items.filter((item) => item.operationalStatus === "lista_para_operar").length),
      Pendientes: formatNumber(items.filter((item) => item.operationalStatus === "pendiente").length),
      "Sin promotor": formatNumber(items.filter((item) => item.tienePromotorFutbol !== "si").length),
      "Con horario": formatNumber(items.filter((item) => item.hasSchedule).length),
      "Sin responsable PILARES": formatNumber(items.filter((item) => !item.assignedPilaresResponsibleName).length),
      "Con actividades": formatNumber(items.filter((item) => item.hasActivities).length),
      "Con coordenadas": formatNumber(items.filter((item) => item.hasCoordinates).length),
      "Semáforo operativo":
        items.filter((item) => item.operationalStatus === "pendiente").length / (items.length || 1) >= 0.25
          ? "Rojo"
          : items.filter((item) => item.operationalStatus === "completa" || item.operationalStatus === "lista_para_operar").length / (items.length || 1) >= 0.6
            ? "Verde"
            : "Amarillo"
    }))
    .sort((a, b) => Number(b["Total de canchas"].replace(/,/g, "")) - Number(a["Total de canchas"].replace(/,/g, "")));
};

export const buildCanchasAlerts = (records: CanchaOperationalRecord[]) => [
  { label: "Canchas sin fecha", value: formatNumber(records.filter((item) => item.inaugurationStatus === "sin_fecha").length), helper: "Requieren confirmación de inauguración" },
  { label: "Sin promotor", value: formatNumber(records.filter((item) => item.tienePromotorFutbol !== "si").length), helper: "Sin promotor de futbol confirmado en la base" },
  { label: "Sin horario", value: formatNumber(records.filter((item) => !item.hasSchedule).length), helper: "Sin horario operativo o malla horaria" },
  { label: "Sin actividades", value: formatNumber(records.filter((item) => !item.hasActivities).length), helper: "Sin actividades registradas en la base" },
  { label: "Sin responsable PILARES", value: formatNumber(records.filter((item) => !item.assignedPilaresResponsibleName).length), helper: "Sin responsable de sede identificado" }
];

export const buildCanchasQualitySummary = (records: CanchaOperationalRecord[]) => [
  { label: "Total de canchas", value: formatNumber(records.length), helper: "Base operativa integrada" },
  { label: "Coordenada real", value: formatNumber(records.filter((item) => item.geolocationType === "real").length), helper: "Tomada desde hojas territoriales" },
  { label: "Coordenada aproximada", value: formatNumber(records.filter((item) => item.geolocationType === "aproximada_pilares" || item.geolocationType === "aproximada_alcaldia").length), helper: "Heredada desde PILARES o centroide de alcaldía" },
  { label: "Sin coordenada", value: formatNumber(records.filter((item) => item.geolocationType === "sin_coordenada").length), helper: "Sin ubicación utilizable" },
  { label: "Con responsable PILARES", value: formatNumber(records.filter((item) => Boolean(item.assignedPilaresResponsibleName)).length), helper: "Responsable de sede disponible" },
  { label: "Con horario", value: formatNumber(records.filter((item) => item.hasSchedule).length), helper: "Horario o malla horaria disponible" },
  { label: "Con actividades", value: formatNumber(records.filter((item) => item.hasActivities).length), helper: "Actividades registradas" },
  { label: "Con fecha válida", value: formatNumber(records.filter((item) => item.inaugurationStatus !== "sin_fecha").length), helper: "Fecha o señal textual usable" }
];

export const buildCanchasExecutiveKpis = (records: CanchaOperationalRecord[]) => {
  const total = records.length || 1;
  return [
    { label: "% inauguradas", value: `${share(records.filter((item) => item.inaugurationStatus === "inaugurada").length, total).toFixed(1)}%`, helper: "Fecha pasada o señal explícita de inauguración" },
    { label: "% próximas", value: `${share(records.filter((item) => item.inaugurationStatus === "proxima").length, total).toFixed(1)}%`, helper: "Corte con arranque próximo o tentativo" },
    { label: "% sin fecha", value: `${share(records.filter((item) => item.inaugurationStatus === "sin_fecha").length, total).toFixed(1)}%`, helper: "Pendiente de programación visible" },
    { label: "% completas", value: `${share(records.filter((item) => item.operationalStatus === "completa").length, total).toFixed(1)}%`, helper: "Operación documentada con 5/5 señales" },
    { label: "% parciales", value: `${share(records.filter((item) => item.operationalStatus === "parcial" || item.operationalStatus === "lista_para_operar").length, total).toFixed(1)}%`, helper: "Operación en captura o casi lista" },
    { label: "% con promotor", value: `${share(records.filter((item) => item.tienePromotorFutbol === "si").length, total).toFixed(1)}%`, helper: "Promotor de futbol confirmado en la base" },
    { label: "% con horario", value: `${share(records.filter((item) => item.hasSchedule || item.mallaHorariaFutbol || item.mallaHorariaDisciplinas).length, total).toFixed(1)}%`, helper: "Horario general o malla específica visible" },
    { label: "% con responsable PILARES", value: `${share(records.filter((item) => Boolean(item.assignedPilaresResponsibleName)).length, total).toFixed(1)}%`, helper: "Sede PILARES con responsable identificado" }
  ];
};

export const buildCanchasExecutiveInsights = (records: CanchaOperationalRecord[]): CanchasExecutiveInsight[] => {
  if (records.length === 0) return [];
  const total = records.length;
  const inaugurated = records.filter((item) => item.inaugurationStatus === "inaugurada");
  const noPromoter = records.filter((item) => item.tienePromotorFutbol !== "si");
  const withPromoter = records.filter((item) => item.tienePromotorFutbol === "si");
  const withHorario = records.filter((item) => item.hasSchedule || Boolean(item.mallaHorariaFutbol) || Boolean(item.mallaHorariaDisciplinas));
  const completeLike = records.filter((item) => item.operationalStatus === "completa" || item.operationalStatus === "lista_para_operar");
  const topBy = (
    label: string,
    predicate: (item: CanchaOperationalRecord) => boolean
  ) =>
    Array.from(groupBy(records.filter(predicate), (item) => item.alcaldia))
      .map(([alcaldia, items]) => ({ alcaldia, total: items.length }))
      .sort((a, b) => b.total - a.total)[0] ?? null;

  const topPending = topBy("pendientes", (item) => item.operationalStatus === "pendiente");
  const topComplete = topBy("completas", (item) => item.operationalStatus === "completa");
  const topNoDate = topBy("sin fecha", (item) => item.inaugurationStatus === "sin_fecha");
  const topNoPromoter = topBy("sin promotor", (item) => item.tienePromotorFutbol !== "si");
  const topNoHorario = topBy("sin horario", (item) => !item.hasSchedule && !item.mallaHorariaFutbol && !item.mallaHorariaDisciplinas);
  const topUpcomingLowOps = Array.from(groupBy(records.filter((item) => item.inaugurationStatus === "proxima"), (item) => item.alcaldia))
    .map(([alcaldia, items]) => ({
      alcaldia,
      total: items.length,
      lowOpsShare: items.filter((item) => item.operationalStatus === "parcial" || item.operationalStatus === "pendiente").length / (items.length || 1)
    }))
    .sort((a, b) => b.total - a.total || b.lowOpsShare - a.lowOpsShare)[0] ?? null;

  const promoterCompleteShare = share(withPromoter.filter((item) => item.operationalStatus === "completa" || item.operationalStatus === "lista_para_operar").length, withPromoter.length || 1);
  const noPromoterCompleteShare = share(noPromoter.filter((item) => item.operationalStatus === "completa" || item.operationalStatus === "lista_para_operar").length, noPromoter.length || 1);
  const horarioCompleteShare = share(withHorario.filter((item) => item.operationalStatus === "completa" || item.operationalStatus === "lista_para_operar").length, withHorario.length || 1);
  const inauguratedCompleteShare = share(inaugurated.filter((item) => item.operationalStatus === "completa" || item.operationalStatus === "lista_para_operar").length, inaugurated.length || 1);

  return [
    {
      title: "Cobertura operativa documentada",
      body: `${share(completeLike.length, total).toFixed(1)}% de las canchas visibles están completas o listas para operar. ${topComplete ? `${topComplete.alcaldia} concentra el mayor volumen de canchas completas (${formatNumber(topComplete.total)}).` : ""}`
    },
    {
      title: "Promotor de futbol y madurez operativa",
      body: `${share(withPromoter.length, total).toFixed(1)}% de las canchas reporta promotor de futbol. Entre ellas, ${promoterCompleteShare.toFixed(1)}% está completa o lista para operar, frente a ${noPromoterCompleteShare.toFixed(1)}% entre las canchas sin promotor confirmado.`
    },
    {
      title: "Horario como señal de preparación",
      body: `${share(withHorario.length, total).toFixed(1)}% ya registra horario o malla horaria. Dentro de ese grupo, ${horarioCompleteShare.toFixed(1)}% está completa o lista para operar. ${topNoHorario ? `${topNoHorario.alcaldia} concentra más casos sin horario (${formatNumber(topNoHorario.total)}).` : ""}`
    },
    {
      title: "Arranque próximo con documentación desigual",
      body: `${share(records.filter((item) => item.inaugurationStatus === "proxima").length, total).toFixed(1)}% de las canchas está marcada como próxima. ${topUpcomingLowOps ? `${topUpcomingLowOps.alcaldia} destaca por tener más canchas próximas con operación aún parcial o pendiente.` : ""}`
    },
    {
      title: "Focos de seguimiento inmediato",
      body: `${topPending ? `${topPending.alcaldia} concentra más canchas pendientes (${formatNumber(topPending.total)}). ` : ""}${topNoDate ? `${topNoDate.alcaldia} lidera los casos sin fecha (${formatNumber(topNoDate.total)}). ` : ""}${topNoPromoter ? `${topNoPromoter.alcaldia} concentra más canchas sin promotor confirmado (${formatNumber(topNoPromoter.total)}).` : ""}`
    },
    {
      title: "Inauguración y documentación",
      body: `${share(inaugurated.length, total).toFixed(1)}% de las canchas ya se marca como inaugurada. Dentro de ese grupo, ${inauguratedCompleteShare.toFixed(1)}% ya cuenta con documentación operativa completa o lista para operar.`
    }
  ];
};

export const buildCanchasTableRows = (records: CanchaOperationalRecord[]) => {
  return records.map((record) => ({
    Nombre: record.name,
    Alcaldía: record.alcaldia,
    Domicilio: record.domicilio,
    "Fecha de inauguración": record.inaugurationDateIso ?? record.inaugurationDateRaw ?? "",
    "Estatus de inauguración": record.inaugurationStatus === "proxima" ? "Próxima" : record.inaugurationStatus === "sin_fecha" ? "Sin fecha" : "Inaugurada",
    "Estatus operativo":
      record.operationalStatus === "completa"
        ? "Completa"
        : record.operationalStatus === "lista_para_operar"
          ? "Lista para operar"
          : record.operationalStatus === "parcial"
            ? "Parcial"
            : "Pendiente",
    "Semáforo operativo": buildOperationalTrafficLight(record),
    "Cuenta con promotor de futbol":
      record.tienePromotorFutbol === "si"
        ? "Sí"
        : record.tienePromotorFutbol === "no"
          ? "No"
          : "Sin dato",
    "Cantidad de promotores": record.promoterCount !== null && record.promoterCount !== undefined ? formatNumber(record.promoterCount) : "",
    Coordinador: "No identificable en la fuente",
    "PILARES asignado": record.assignedPilaresOfficialName ?? record.pilaresAssigned ?? "",
    "Responsable PILARES": record.assignedPilaresResponsibleName ?? "",
    "Teléfono PILARES": record.assignedPilaresContact ?? "",
    "Contacto PILARES": record.assignedPilaresEmail ?? "",
    Horario: record.schedule ?? "",
    "Malla horaria futbol": record.mallaHorariaFutbol ?? "",
    "Malla horaria disciplinas": record.mallaHorariaDisciplinas ?? "",
    Disciplinas: record.disciplinas.join(", "),
    Actividades: record.activities.join(", "),
    Observaciones: record.observations ?? "",
    "Geolocalización": record.geolocationLabel,
    "Calidad del dato": record.dataQualityLabel
  }));
};
