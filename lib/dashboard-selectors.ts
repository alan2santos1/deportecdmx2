import type {
  CanchaOperationalRecord,
  CanchasFilterState,
  DashboardDataset,
  DashboardFilterState,
  DataLayer,
  HealthProfileRecord,
  InfrastructureDetailRecord,
  MapAreaRecord,
  PublicSpaceSummaryByAlcaldia,
  ProgrammedOfferRecord,
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
  utopias: number;
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

export type ProgrammedOfferDatum = {
  name: string;
  value: number;
  percent: number;
  denominator: number;
};

export type ProgrammedOfferChannelFilter = "ambos" | "pilares" | "ponte_pila";
export type PanoramaInfrastructureScope =
  | "publica"
  | "comunitaria"
  | "privada_denue"
  | "canchas"
  | "utopias"
  | "parques";

export type PanoramaAlcaldiaDatum = {
  alcaldia: string;
  poblacion: number;
  mujeresPercent: number;
  hombresPercent: number;
  sedesProgramadas: number;
  clasesProgramadas: number;
  sesionesProgramadas: number;
  horasProgramadas: number;
  diversidadDisciplinaria: number;
  principalesDisciplinas: string[];
  infraestructuraPublica: number;
  infraestructuraComunitaria: number;
  infraestructuraPrivadaFormal: number;
  utopias: number;
  canchas: number;
  coberturaProgramatica10k: number;
  horasProgramadas10k: number;
  qualityLabel: string;
  cutLabel: string;
};

export type FilterApplicabilityNote = {
  key: string;
  scope: "aplica" | "parcial" | "no_aplica";
  message: string;
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
  administrativeStatuses: [],
  documentationStatuses: [],
  workStatuses: [],
  openingStatuses: [],
  locationQualities: [],
  reconciliationConfidences: [],
  evidencePresence: [],
  promoterPresence: [],
  schedulePresence: [],
  activityPresence: [],
  types: [],
  materials: [],
  origins: []
};

const uniq = (items: string[]) => Array.from(new Set(items)).sort((a, b) => a.localeCompare(b, "es"));

export const buildFilterConfig = (dataset: DashboardDataset) => {
  const records = dataset.territorialRecords;
  const sports = uniq([
    ...dataset.programmedOfferRecords.map((item) => item.disciplineNormalized).filter(Boolean) as string[],
    ...dataset.infrastructureDetails.flatMap((item) => item.sportsAvailable)
  ]);
  const infrastructureDetails = dataset.infrastructureDetails;
  return [
    { title: "Alcaldía", key: "alcaldias" as const, options: uniq(records.map((item) => item.alcaldia)).map((value) => ({ label: value, value })) },
    { title: "Año", key: "years" as const, options: uniq(records.map((item) => String(item.year))).map((value) => ({ label: value, value })) },
    { title: "Sexo", key: "sexes" as const, options: uniq(records.map((item) => item.sex)).map((value) => ({ label: value, value })) },
    { title: "Grupo de edad", key: "ageGroups" as const, options: uniq(records.map((item) => item.ageGroup)).map((value) => ({ label: value, value })) },
    { title: "Disciplina / oferta programada", key: "sports" as const, options: sports.map((value) => ({ label: value, value })) },
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
    if (type === "UTOPÍAs") return record.utopias > 0;
    if (type === "Deportivos públicos") return record.publicSportsCenters > 0;
    if (type === "Gimnasio privado") return record.privateGyms > 0;
    if (type === "Club deportivo privado") return record.privateClubs > 0;
    if (type === "Academia deportiva privada") return record.privateSchools > 0;
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

const mapStaffSexSelection = (sexes: string[]) => sexes.flatMap((sex) => {
  if (sex === "Hombres") return ["H"];
  if (sex === "Mujeres") return ["M"];
  return [];
});

export const filterProgrammedOfferRecords = (records: ProgrammedOfferRecord[], filters: DashboardFilterState) => {
  const staffSexSelections = mapStaffSexSelection(filters.sexes);
  return records.filter((record) => {
    if (filters.alcaldias.length > 0 && !filters.alcaldias.includes(record.alcaldia)) return false;
    if (filters.years.length > 0 && !filters.years.includes(String(record.year))) return false;
    if (staffSexSelections.length > 0 && !staffSexSelections.includes(record.staffSex)) return false;
    if (filters.sports.length > 0 && !filters.sports.includes(record.disciplineNormalized ?? "")) return false;
    return true;
  });
};

export const filterProgrammedOfferByChannel = (
  records: ProgrammedOfferRecord[],
  channelFilter: ProgrammedOfferChannelFilter
) => {
  if (channelFilter === "ambos") return records;
  const expectedChannel = channelFilter === "pilares" ? "PILARES" : "Ponte Pila";
  return records.filter((record) => record.channel === expectedChannel);
};

export const buildFilterApplicabilityNotes = (filters: DashboardFilterState): FilterApplicabilityNote[] => {
  const notes: FilterApplicabilityNote[] = [];
  if (filters.sports.length > 0) {
    notes.push({
      key: "sports",
      scope: "parcial",
      message: "La disciplina solo afecta oferta programada, infraestructura con disciplina documentada y lecturas operativas relacionadas. No modifica salud, demografía ni riesgo base."
    });
  }
  if (filters.infrastructureTypes.length > 0) {
    notes.push({
      key: "infrastructureTypes",
      scope: "parcial",
      message: "El tipo de infraestructura afecta módulos de infraestructura y comparativas territoriales relacionadas. No vacía actividad, salud ni oferta programada."
    });
  }
  if (filters.ageGroups.length > 0) {
    notes.push({
      key: "ageGroups",
      scope: "parcial",
      message: "El grupo de edad aplica a demografía, actividad y salud. No aplica a infraestructura, Canchas ni oferta programada porque las mallas no documentan población objetivo por clase."
    });
  }
  if (filters.sexes.length > 0) {
    notes.push({
      key: "sexes",
      scope: "parcial",
      message: "El filtro de sexo aplica a actividad, salud y demografía. En oferta programada se usa solo cuando la fuente documenta sexo del personal asignado."
    });
  }
  return notes;
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
    const utopias = includeAll || filters.infrastructureTypes.includes("UTOPÍAs") ? sample.utopias : 0;
    const gimnasiosPrivados = includeAll || filters.infrastructureTypes.includes("Gimnasio privado") ? sample.privateGyms : 0;
    const clubesPrivados = includeAll || filters.infrastructureTypes.includes("Club deportivo privado") ? sample.privateClubs : 0;
    const academiasPrivadas = includeAll || filters.infrastructureTypes.includes("Academia deportiva privada") ? sample.privateSchools : 0;
    const parques = includeAll || filters.infrastructureTypes.includes("Parques / áreas verdes") ? sample.parks : 0;
    const total = deportivos + pilares + utopias + gimnasiosPrivados + clubesPrivados + academiasPrivadas;
    return {
      name,
      deportivos,
      pilares,
      utopias,
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
  if (record.infrastructureType === "UTOPÍAs") return "UTOPÍAs";
  return "PILARES";
};

export const buildInfrastructureStackedByAlcaldia = (records: InfrastructureDetailRecord[]) => {
  return Array.from(groupBy(records.filter((record) => record.alcaldia !== "Sin alcaldía documentada"), (record) => record.alcaldia)).map(([alcaldia, items]) => {
    const summary: Record<string, string | number> = {
      name: alcaldia,
      "PILARES": 0,
      "UTOPÍAs": 0,
      "Deportivos públicos": 0,
      "Gimnasios privados": 0,
      "Clubes deportivos": 0,
      "Academias deportivas": 0
    };
    items.forEach((item) => {
      const label = getInfrastructureCategoryLabel(item);
      summary[label] = Number(summary[label] ?? 0) + item.administrativeCount;
    });
    return summary;
  }).sort((a, b) => {
    const totalA =
      Number(a["PILARES"]) +
      Number(a["UTOPÍAs"]) +
      Number(a["Deportivos públicos"]) +
      Number(a["Gimnasios privados"]) +
      Number(a["Clubes deportivos"]) +
      Number(a["Academias deportivas"]);
    const totalB =
      Number(b["PILARES"]) +
      Number(b["UTOPÍAs"]) +
      Number(b["Deportivos públicos"]) +
      Number(b["Gimnasios privados"]) +
      Number(b["Clubes deportivos"]) +
      Number(b["Academias deportivas"]);
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

export const buildProgrammedOfferTop = (records: ProgrammedOfferRecord[], limit: 5 | 10): ProgrammedOfferDatum[] => {
  const grouped = Array.from(groupBy(records, (record) => record.disciplineNormalized ?? "No documentada")).map(([name, items]) => ({
    name,
    value: sum(items.map((item) => item.sessionCount)),
    denominator: sum(records.map((item) => item.sessionCount)) || 1
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

export const buildProgrammedOfferVariantAudit = (
  records: ProgrammedOfferRecord[],
  variants: string[]
) => {
  const normalizeVariant = (value: string | null | undefined) =>
    String(value ?? "")
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const grouped = new Map<string, { name: string; value: number; byChannel: Record<string, number> }>();
  const targets = variants.map((variant) => normalizeVariant(variant));

  records.forEach((record) => {
    const rawValues = new Set(
      [record.disciplineOriginal, record.activityOriginal]
        .map((value) => normalizeVariant(value))
        .filter(Boolean)
    );

    rawValues.forEach((value) => {
      if (!targets.some((target) => value.includes(target))) return;
      const current = grouped.get(value) ?? { name: value, value: 0, byChannel: {} };
      current.value += 1;
      current.byChannel[record.channel] = (current.byChannel[record.channel] ?? 0) + 1;
      grouped.set(value, current);
    });
  });

  return Array.from(grouped.values()).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "es"));
};

export const buildProgrammedOfferDistribution = (
  records: ProgrammedOfferRecord[],
  getKey: (record: ProgrammedOfferRecord) => string
): ProgrammedOfferDatum[] => {
  const denominator = sum(records.map((record) => record.sessionCount)) || 1;
  return Array.from(groupBy(records, getKey)).map(([name, items]) => ({
    name,
    value: sum(items.map((item) => item.sessionCount)),
    percent: sum(items.map((item) => item.sessionCount)) / denominator,
    denominator
  })).sort((a, b) => b.value - a.value);
};

export const buildPanoramaDeportivoAlcaldia = (
  territorialRecords: TerritorialRecord[],
  programmedOfferRecords: ProgrammedOfferRecord[],
  infrastructureDetails: InfrastructureDetailRecord[],
  canchasRecords: CanchaOperationalRecord[]
): PanoramaAlcaldiaDatum[] => {
  const populationsByAlcaldia = new Map<string, { total: number; men: number; women: number }>();
  Array.from(groupBy(territorialRecords, (record) => `${record.alcaldia}-${record.year}`)).forEach(([, items]) => {
    const alcaldia = items[0]?.alcaldia;
    if (!alcaldia || populationsByAlcaldia.has(alcaldia)) return;
    const total = sum(items.map((item) => item.population));
    const men = sum(items.filter((item) => item.sex === "Hombres").map((item) => item.population));
    const women = sum(items.filter((item) => item.sex === "Mujeres").map((item) => item.population));
    populationsByAlcaldia.set(alcaldia, { total, men, women });
  });

  const classGroupsByAlcaldia = new Map<string, Set<string>>();
  const venuesByAlcaldia = new Map<string, Set<string>>();
  const disciplinesByAlcaldia = new Map<string, Set<string>>();
  const hoursByAlcaldia = new Map<string, number>();
  const sessionsByAlcaldia = new Map<string, number>();

  programmedOfferRecords.forEach((record) => {
    classGroupsByAlcaldia.set(record.alcaldia, new Set([...(classGroupsByAlcaldia.get(record.alcaldia) ?? new Set()), record.classGroupId]));
    venuesByAlcaldia.set(record.alcaldia, new Set([...(venuesByAlcaldia.get(record.alcaldia) ?? new Set()), `${record.channel}-${record.classGroupId.split("|")[2] ?? record.classGroupId}`]));
    if (record.disciplineNormalized) {
      disciplinesByAlcaldia.set(record.alcaldia, new Set([...(disciplinesByAlcaldia.get(record.alcaldia) ?? new Set()), record.disciplineNormalized]));
    }
    hoursByAlcaldia.set(record.alcaldia, (hoursByAlcaldia.get(record.alcaldia) ?? 0) + record.scheduledHours);
    sessionsByAlcaldia.set(record.alcaldia, (sessionsByAlcaldia.get(record.alcaldia) ?? 0) + record.sessionCount);
  });

  const topDisciplinesByAlcaldia = new Map<string, string[]>();
  Array.from(groupBy(programmedOfferRecords, (record) => record.alcaldia)).forEach(([alcaldia, items]) => {
    const grouped = Array.from(groupBy(items, (item) => item.disciplineNormalized ?? "No documentada"))
      .map(([name, disciplineItems]) => ({ name, value: sum(disciplineItems.map((item) => item.sessionCount)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((item) => item.name);
    topDisciplinesByAlcaldia.set(alcaldia, grouped);
  });

  return Array.from(populationsByAlcaldia.entries()).map(([alcaldia, population]) => {
    const infra = infrastructureDetails.filter((item) => item.alcaldia === alcaldia);
    const programVenues = venuesByAlcaldia.get(alcaldia)?.size ?? 0;
    const programmedClasses = classGroupsByAlcaldia.get(alcaldia)?.size ?? 0;
    const sessions = sessionsByAlcaldia.get(alcaldia) ?? 0;
    const hours = hoursByAlcaldia.get(alcaldia) ?? 0;
    return {
      alcaldia,
      poblacion: population.total,
      mujeresPercent: population.total > 0 ? population.women / population.total : 0,
      hombresPercent: population.total > 0 ? population.men / population.total : 0,
      sedesProgramadas: programVenues,
      clasesProgramadas: programmedClasses,
      sesionesProgramadas: sessions,
      horasProgramadas: Number(hours.toFixed(1)),
      diversidadDisciplinaria: disciplinesByAlcaldia.get(alcaldia)?.size ?? 0,
      principalesDisciplinas: topDisciplinesByAlcaldia.get(alcaldia) ?? [],
      infraestructuraPublica: infra.filter((item) => item.infrastructureType === "Deportivos públicos").reduce((acc, item) => acc + item.administrativeCount, 0),
      infraestructuraComunitaria:
        infra.filter((item) => item.infrastructureType === "PILARES" || item.infrastructureType === "UTOPÍAs").reduce((acc, item) => acc + item.administrativeCount, 0),
      infraestructuraPrivadaFormal: infra.filter((item) => item.sourceDataset === "Infraestructura privada DENUE").reduce((acc, item) => acc + item.administrativeCount, 0),
      utopias: infra.filter((item) => item.infrastructureType === "UTOPÍAs").reduce((acc, item) => acc + item.administrativeCount, 0),
      canchas: canchasRecords.filter((item) => item.alcaldia === alcaldia).length,
      coberturaProgramatica10k: population.total > 0 ? (programVenues / population.total) * 10000 : 0,
      horasProgramadas10k: population.total > 0 ? (hours / population.total) * 10000 : 0,
      qualityLabel: sessions > 0 ? "A · oferta programada vigente" : "D · no disponible",
      cutLabel: sessions > 0 ? "2026-07 Ponte Pila / 2026-04 PILARES" : "Aún no disponible"
    };
  }).sort((a, b) => b.sesionesProgramadas - a.sesionesProgramadas);
};

export const buildProgrammedOfferKpis = (records: ProgrammedOfferRecord[]) => {
  const uniqueClasses = new Set(records.map((record) => record.classGroupId)).size;
  const uniqueVenues = new Set(records.map((record) => `${record.channel}-${record.alcaldia}-${record.classGroupId.split("|")[2] ?? record.classGroupId}`)).size;
  const uniqueDisciplines = new Set(records.map((record) => record.disciplineNormalized).filter(Boolean)).size;
  const totalHours = sum(records.map((record) => record.scheduledHours));
  const weekendSessions = records.filter((record) => record.isWeekend).length;
  return [
    { label: "Sedes con programación", value: formatNumber(uniqueVenues), helper: "Sedes o puntos con al menos una sesión programada en el corte visible" },
    { label: "Clases programadas", value: formatNumber(uniqueClasses), helper: "Conteo único de grupos o clases programadas" },
    { label: "Sesiones semanales", value: formatNumber(records.length), helper: "Slots de horario visibles en el corte operativo" },
    { label: "Horas semanales", value: totalHours.toFixed(1), helper: "Horas programadas, no asistencia observada" },
    { label: "Disciplinas ofertadas", value: formatNumber(uniqueDisciplines), helper: "Disciplinas distintas documentadas y normalizadas" },
    { label: "Oferta en fin de semana", value: formatNumber(weekendSessions), helper: "Sesiones programadas sábado o domingo" }
  ];
};

export const buildInfrastructureScopeKpi = (
  infrastructureDetails: InfrastructureDetailRecord[],
  canchasRecords: CanchaOperationalRecord[],
  scope: PanoramaInfrastructureScope,
  publicSpaceSummaryByAlcaldia: PublicSpaceSummaryByAlcaldia[] = []
) => {
  if (scope === "publica") {
    const value = infrastructureDetails
      .filter((item) => item.infrastructureType === "Deportivos públicos")
      .reduce((sum, item) => sum + item.administrativeCount, 0);
    return {
      label: "Infraestructura pública visible",
      value,
      unit: "instalaciones",
      helper: "Deportivos públicos documentados en la vista activa"
    };
  }
  if (scope === "comunitaria") {
    const value = infrastructureDetails
      .filter((item) => item.infrastructureType === "PILARES")
      .reduce((sum, item) => sum + item.administrativeCount, 0);
    return {
      label: "Infraestructura comunitaria visible",
      value,
      unit: "sedes",
      helper: "Sedes PILARES reales documentadas en la vista activa"
    };
  }
  if (scope === "privada_denue") {
    const value = infrastructureDetails
      .filter((item) => item.sourceDataset === "Infraestructura privada DENUE")
      .reduce((sum, item) => sum + item.administrativeCount, 0);
    return {
      label: "Infraestructura privada formal visible",
      value,
      unit: "establecimientos",
      helper: "Unidades económicas deportivas registradas en DENUE"
    };
  }
  if (scope === "canchas") {
    return {
      label: "Canchas visibles",
      value: canchasRecords.length,
      unit: "canchas",
      helper: "Registros operativos del módulo Canchas dentro de la vista activa"
    };
  }
  if (scope === "utopias") {
    const value = infrastructureDetails
      .filter((item) => item.infrastructureType === "UTOPÍAs")
      .reduce((sum, item) => sum + item.administrativeCount, 0);
    return {
      label: "UTOPÍAs visibles",
      value,
      unit: "sedes",
      helper: "Capa institucional real por sede documentada"
    };
  }
  const value = publicSpaceSummaryByAlcaldia.reduce((sum, item) => sum + item.greenAreaRecords, 0);
  const surfaceSqM = publicSpaceSummaryByAlcaldia.reduce((sum, item) => sum + item.greenAreaSurfaceSqM, 0);
  return {
    label: "Áreas verdes visibles",
    value,
    unit: "polígonos",
    helper: `${(surfaceSqM / 10000).toFixed(1)} ha documentadas en la capa oficial separada de espacio público`
  };
};

export const buildProgrammedOfferTableRows = (rows: PanoramaAlcaldiaDatum[]) =>
  rows.map((row) => ({
    Alcaldía: row.alcaldia,
    Población: formatNumber(row.poblacion),
    "% mujeres": `${(row.mujeresPercent * 100).toFixed(1)}%`,
    "% hombres": `${(row.hombresPercent * 100).toFixed(1)}%`,
    "Sedes programadas": formatNumber(row.sedesProgramadas),
    "Clases programadas": formatNumber(row.clasesProgramadas),
    "Sesiones programadas": formatNumber(row.sesionesProgramadas),
    "Horas programadas": row.horasProgramadas.toFixed(1),
    "Diversidad disciplinaria": formatNumber(row.diversidadDisciplinaria),
    "Principales disciplinas": row.principalesDisciplinas.join(", ") || "Aún no disponible",
    "Infraestructura pública": formatNumber(row.infraestructuraPublica),
    "Infraestructura comunitaria": formatNumber(row.infraestructuraComunitaria),
    "Infraestructura privada formal": formatNumber(row.infraestructuraPrivadaFormal),
    UTOPÍAs: formatNumber(row.utopias),
    Canchas: formatNumber(row.canchas),
    "Cobertura programática x10k": row.coberturaProgramatica10k.toFixed(2),
    "Horas programadas x10k": row.horasProgramadas10k.toFixed(2),
    "Corte": row.cutLabel,
    "Calidad": row.qualityLabel
  }));

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
    "Estado de disciplinas": record.disciplineStatus === "disponible" ? "Disponible" : "No documentado",
    "Deportes documentados": record.sportsAvailable.length > 0 ? record.sportsAvailable.join(", ") : "No documentado / subrepresentado",
    "Tipo de dato": record.dataType,
    "Dataset origen": record.sourceDataset ?? "",
    "Fuente": record.source,
    "Nota metodológica": record.methodologicalNote
  }));
};

export const buildInfrastructureSportsSummary = (records: InfrastructureDetailRecord[]) => {
  const sportMap = new Map<string, number>();
  records.forEach((record) => {
    if (record.sportsAvailable.length === 0) {
      const fallbackLabel = record.dataType === "real" ? "No documentado / subrepresentado" : "No documentado";
      sportMap.set(fallbackLabel, (sportMap.get(fallbackLabel) ?? 0) + record.operationalUnits);
      return;
    }
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
      items.map((item) => (item.sourceDataset === "Infraestructura privada DENUE" ? item.administrativeCount : 0))
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
  const grouped = Array.from(groupBy(records.filter((record) => record.alcaldia !== "Sin alcaldía documentada"), (record) => record.alcaldia)).map(([alcaldia, items]) => ({
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

export const buildDataLayerSummary = (
  records: TerritorialRecord[],
  infrastructureDetails: InfrastructureDetailRecord[],
  programmedOfferRecords: ProgrammedOfferRecord[]
) => {
  const counts = new Map<DataLayer, number>();
  records.forEach((record) => {
    counts.set(record.healthDataType, (counts.get(record.healthDataType) ?? 0) + 1);
    counts.set(record.activityDataType, (counts.get(record.activityDataType) ?? 0) + 1);
  });
  infrastructureDetails.forEach((record) => {
    counts.set(record.dataType, (counts.get(record.dataType) ?? 0) + 1);
  });
  programmedOfferRecords.forEach((record) => {
    counts.set(record.dataType, (counts.get(record.dataType) ?? 0) + 1);
  });
  return [
    { label: "Dato real", value: String(counts.get("real") ?? 0), helper: "Infraestructura nominal y oferta programada vigente" },
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
    "UTOPÍAs": String(record.utopias),
    "Deportivos públicos": String(record.publicSportsCenters),
    "Gimnasios privados": String(record.privateGyms),
    "Clubes deportivos privados": String(record.privateClubs),
    "Academias deportivas privadas": String(record.privateSchools),
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

const documentationTrafficLight = (record: CanchaOperationalRecord) => {
  if (record.documentationStatus === "completa") return "Verde";
  if (record.documentationStatus === "parcial") return "Amarillo";
  return "Rojo";
};

const locationQualityFilterValue = (record: CanchaOperationalRecord) => {
  if (record.geolocationType === "real") return "real";
  if (record.geolocationType === "aproximada_pilares") return "aproximada_pilares";
  if (record.geolocationType === "aproximada_alcaldia") return "aproximada_alcaldia";
  return "sin_coordenada";
};

export const buildCanchasFilterConfig = (records: CanchaOperationalRecord[]) => [
  { title: "Alcaldía", key: "alcaldias" as const, options: uniq(records.map((item) => item.alcaldia)).map((value) => ({ label: value, value })) },
  {
    title: "Estado administrativo",
    key: "administrativeStatuses" as const,
    options: [
      { label: "Registrada", value: "registrada" },
      { label: "Incompleta", value: "incompleta" },
      { label: "Requiere revisión", value: "requiere_revision" }
    ]
  },
  {
    title: "Completitud documental",
    key: "documentationStatuses" as const,
    options: [
      { label: "Completa", value: "completa" },
      { label: "Parcial", value: "parcial" },
      { label: "Mínima", value: "minima" }
    ]
  },
  {
    title: "Estado de obra",
    key: "workStatuses" as const,
    options: [
      { label: "Intervención confirmada", value: "intervencion_confirmada" },
      { label: "Lista confirmada", value: "lista_confirmada" },
      { label: "Entrega confirmada", value: "entregada_confirmada" },
      { label: "Sin confirmación", value: "sin_confirmacion" },
      { label: "Contradicción", value: "contradiccion" }
    ]
  },
  {
    title: "Estado de apertura",
    key: "openingStatuses" as const,
    options: [
      { label: "Inaugurada confirmada", value: "inaugurada_confirmada" },
      { label: "Probable", value: "probable" },
      { label: "Sin confirmación pública", value: "sin_confirmacion_publica" },
      { label: "Contradicción", value: "contradiccion" }
    ]
  },
  {
    title: "Calidad de ubicación",
    key: "locationQualities" as const,
    options: [
      { label: "Coordenada real", value: "real" },
      { label: "Aproximada por PILARES", value: "aproximada_pilares" },
      { label: "Aproximada por alcaldía", value: "aproximada_alcaldia" },
      { label: "Sin coordenada", value: "sin_coordenada" }
    ]
  },
  {
    title: "Confianza de conciliación",
    key: "reconciliationConfidences" as const,
    options: [
      { label: "Alta", value: "alta" },
      { label: "Media", value: "media" },
      { label: "Baja", value: "baja" },
      { label: "Sin match", value: "sin_match" }
    ]
  },
  {
    title: "Evidencia oficial",
    key: "evidencePresence" as const,
    options: [
      { label: "Con evidencia", value: "con_evidencia" },
      { label: "Sin evidencia", value: "sin_evidencia" }
    ]
  },
  {
    title: "Promotor de futbol",
    key: "promoterPresence" as const,
    options: [
      { label: "Con promotor", value: "con_promotor" },
      { label: "Sin promotor", value: "sin_promotor" }
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
    if (filters.administrativeStatuses.length > 0 && !filters.administrativeStatuses.includes(record.administrativeStatus)) return false;
    if (filters.documentationStatuses.length > 0 && !filters.documentationStatuses.includes(record.documentationStatus)) return false;
    if (filters.workStatuses.length > 0 && !filters.workStatuses.includes(record.workStatus)) return false;
    if (filters.openingStatuses.length > 0 && !filters.openingStatuses.includes(record.openingStatus)) return false;
    if (filters.locationQualities.length > 0 && !filters.locationQualities.includes(locationQualityFilterValue(record))) return false;
    if (filters.reconciliationConfidences.length > 0 && !filters.reconciliationConfidences.includes(record.matchConfidence)) return false;
    if (filters.evidencePresence.length > 0 && !filters.evidencePresence.includes(record.hasOfficialEvidence ? "con_evidencia" : "sin_evidencia")) return false;
    if (filters.promoterPresence.length > 0 && !filters.promoterPresence.includes(record.tienePromotorFutbol === "si" ? "con_promotor" : "sin_promotor")) return false;
    if (filters.schedulePresence.length > 0 && !filters.schedulePresence.includes(record.hasSchedule ? "con_horario" : "sin_horario")) return false;
    if (filters.activityPresence.length > 0 && !filters.activityPresence.includes(record.hasActivities ? "con_actividades" : "sin_actividades")) return false;
    if (filters.types.length > 0 && !filters.types.includes(record.tipoCancha ?? "")) return false;
    if (filters.materials.length > 0 && !filters.materials.includes(record.material ?? "")) return false;
    if (filters.origins.length > 0 && !filters.origins.includes(record.origen ?? "")) return false;
    return true;
  });
};

export const buildCanchasKpis = (records: CanchaOperationalRecord[]) => [
  { label: "Registros administrativos", value: formatNumber(records.length), helper: "Padrón administrativo integrado desde el Excel real" },
  { label: "Inauguración confirmada", value: formatNumber(records.filter((item) => item.openingStatus === "inaugurada_confirmada").length), helper: "Solo con evidencia oficial conciliada individualmente" },
  { label: "Entrega / lista confirmada", value: formatNumber(records.filter((item) => item.workStatus === "entregada_confirmada" || item.workStatus === "lista_confirmada").length), helper: "Evidencia oficial individual de entrega o lista" },
  { label: "Coincidencia probable", value: formatNumber(records.filter((item) => item.matchConfidence === "media").length), helper: "Match probable que no se publica como confirmación" },
  { label: "Sin confirmación pública", value: formatNumber(records.filter((item) => item.openingStatus === "sin_confirmacion_publica").length), helper: "Sin evidencia pública individual conciliada" },
  { label: "Requiere revisión", value: formatNumber(records.filter((item) => item.administrativeStatus === "requiere_revision").length), helper: "Registro con señal administrativa o territorial conflictiva" },
  { label: "Con horario", value: formatNumber(records.filter((item) => item.hasSchedule).length), helper: "Horario operativo o malla horaria capturada" },
  { label: "Con actividades", value: formatNumber(records.filter((item) => item.hasActivities).length), helper: "Actividades operativas registradas en la base" }
];

export const buildCanchasSummaryRows = (records: CanchaOperationalRecord[]) => {
  return Array.from(groupBy(records, (record) => record.alcaldia))
    .map(([alcaldia, items]) => ({
      Alcaldía: alcaldia,
      "Total de registros": formatNumber(items.length),
      "Inauguración confirmada": formatNumber(items.filter((item) => item.openingStatus === "inaugurada_confirmada").length),
      Probables: formatNumber(items.filter((item) => item.openingStatus === "probable").length),
      "Sin confirmación pública": formatNumber(items.filter((item) => item.openingStatus === "sin_confirmacion_publica").length),
      "Documentación completa": formatNumber(items.filter((item) => item.documentationStatus === "completa").length),
      "Documentación mínima": formatNumber(items.filter((item) => item.documentationStatus === "minima").length),
      "Entrega/lista confirmada": formatNumber(items.filter((item) => item.workStatus === "entregada_confirmada" || item.workStatus === "lista_confirmada").length),
      "Sin promotor": formatNumber(items.filter((item) => item.tienePromotorFutbol !== "si").length),
      "Con horario": formatNumber(items.filter((item) => item.hasSchedule).length),
      "Con evidencia oficial": formatNumber(items.filter((item) => item.hasOfficialEvidence).length),
      "Con actividades": formatNumber(items.filter((item) => item.hasActivities).length),
      "Coordenada real": formatNumber(items.filter((item) => item.geolocationType === "real").length),
      "Ubicación aproximada": formatNumber(items.filter((item) => item.geolocationType === "aproximada_pilares" || item.geolocationType === "aproximada_alcaldia").length),
      "Semáforo documental":
        items.filter((item) => item.documentationStatus === "minima").length / (items.length || 1) >= 0.25
          ? "Rojo"
          : items.filter((item) => item.documentationStatus === "completa").length / (items.length || 1) >= 0.45
            ? "Verde"
            : "Amarillo"
    }))
    .sort((a, b) => Number(b["Total de registros"].replace(/,/g, "")) - Number(a["Total de registros"].replace(/,/g, "")));
};

export const buildCanchasAlerts = (records: CanchaOperationalRecord[]) => [
  { label: "Sin confirmación pública", value: formatNumber(records.filter((item) => item.openingStatus === "sin_confirmacion_publica").length), helper: "No existe evidencia pública individual conciliada" },
  { label: "Coincidencia probable", value: formatNumber(records.filter((item) => item.openingStatus === "probable").length), helper: "Requieren revisión humana antes de publicar como confirmadas" },
  { label: "Requiere revisión", value: formatNumber(records.filter((item) => item.administrativeStatus === "requiere_revision").length), helper: "Registro con señales administrativas o territoriales conflictivas" },
  { label: "Sin promotor", value: formatNumber(records.filter((item) => item.tienePromotorFutbol !== "si").length), helper: "Sin promotor de futbol confirmado en la base" },
  { label: "Sin horario", value: formatNumber(records.filter((item) => !item.hasSchedule).length), helper: "Sin horario operativo o malla horaria" },
  { label: "Sin actividades", value: formatNumber(records.filter((item) => !item.hasActivities).length), helper: "Sin actividades registradas en la base" }
];

export const buildCanchasQualitySummary = (records: CanchaOperationalRecord[]) => [
  { label: "Total de canchas", value: formatNumber(records.length), helper: "Base operativa integrada" },
  { label: "Coordenada real", value: formatNumber(records.filter((item) => item.geolocationType === "real").length), helper: "Tomada desde hojas territoriales" },
  { label: "Coordenada aproximada", value: formatNumber(records.filter((item) => item.geolocationType === "aproximada_pilares" || item.geolocationType === "aproximada_alcaldia").length), helper: "Heredada desde PILARES o centroide de alcaldía" },
  { label: "Sin coordenada", value: formatNumber(records.filter((item) => item.geolocationType === "sin_coordenada").length), helper: "Sin ubicación utilizable" },
  { label: "Con evidencia oficial", value: formatNumber(records.filter((item) => item.hasOfficialEvidence).length), helper: "Con evidencia oficial conciliada" },
  { label: "Confianza alta", value: formatNumber(records.filter((item) => item.matchConfidence === "alta").length), helper: "Match alto o validación manual" },
  { label: "Con horario", value: formatNumber(records.filter((item) => item.hasSchedule).length), helper: "Horario o malla horaria disponible" },
  { label: "Con actividades", value: formatNumber(records.filter((item) => item.hasActivities).length), helper: "Actividades registradas" },
  { label: "Con fecha cargada", value: formatNumber(records.filter((item) => Boolean(item.inaugurationDateIso || item.inaugurationDateRaw)).length), helper: "Fecha o texto administrativo disponible" }
];

export const buildCanchasExecutiveKpis = (records: CanchaOperationalRecord[]) => {
  const total = records.length || 1;
  return [
    { label: "% inauguración confirmada", value: `${share(records.filter((item) => item.openingStatus === "inaugurada_confirmada").length, total).toFixed(1)}%`, helper: "Solo con evidencia oficial individual" },
    { label: "% probable", value: `${share(records.filter((item) => item.openingStatus === "probable").length, total).toFixed(1)}%`, helper: "Coincidencia media que requiere validación humana" },
    { label: "% sin confirmación pública", value: `${share(records.filter((item) => item.openingStatus === "sin_confirmacion_publica").length, total).toFixed(1)}%`, helper: "Sin evidencia pública individual conciliada" },
    { label: "% documentación completa", value: `${share(records.filter((item) => item.documentationStatus === "completa").length, total).toFixed(1)}%`, helper: "Expediente documental con señales operativas suficientes" },
    { label: "% documentación mínima", value: `${share(records.filter((item) => item.documentationStatus === "minima").length, total).toFixed(1)}%`, helper: "Expediente con información mínima" },
    { label: "% con promotor", value: `${share(records.filter((item) => item.tienePromotorFutbol === "si").length, total).toFixed(1)}%`, helper: "Promotor de futbol confirmado en la base" },
    { label: "% con horario", value: `${share(records.filter((item) => item.hasSchedule || item.mallaHorariaFutbol || item.mallaHorariaDisciplinas).length, total).toFixed(1)}%`, helper: "Horario general o malla específica visible" },
    { label: "% con evidencia oficial", value: `${share(records.filter((item) => item.hasOfficialEvidence).length, total).toFixed(1)}%`, helper: "Registro con evidencia oficial conciliada" }
  ];
};

export const buildCanchasExecutiveInsights = (records: CanchaOperationalRecord[]): CanchasExecutiveInsight[] => {
  if (records.length === 0) return [];
  const total = records.length;
  const confirmedOpening = records.filter((item) => item.openingStatus === "inaugurada_confirmada");
  const probableOpening = records.filter((item) => item.openingStatus === "probable");
  const noPromoter = records.filter((item) => item.tienePromotorFutbol !== "si");
  const withPromoter = records.filter((item) => item.tienePromotorFutbol === "si");
  const withHorario = records.filter((item) => item.hasSchedule || Boolean(item.mallaHorariaFutbol) || Boolean(item.mallaHorariaDisciplinas));
  const fullyDocumented = records.filter((item) => item.documentationStatus === "completa");
  const topBy = (
    predicate: (item: CanchaOperationalRecord) => boolean
  ) =>
    Array.from(groupBy(records.filter(predicate), (item) => item.alcaldia))
      .map(([alcaldia, items]) => ({ alcaldia, total: items.length }))
      .sort((a, b) => b.total - a.total)[0] ?? null;

  const topMinimal = topBy((item) => item.documentationStatus === "minima");
  const topComplete = topBy((item) => item.documentationStatus === "completa");
  const topNoConfirmation = topBy((item) => item.openingStatus === "sin_confirmacion_publica");
  const topNoPromoter = topBy((item) => item.tienePromotorFutbol !== "si");
  const topNoHorario = topBy((item) => !item.hasSchedule && !item.mallaHorariaFutbol && !item.mallaHorariaDisciplinas);
  const topProbableLowDocs = Array.from(groupBy(records.filter((item) => item.openingStatus === "probable"), (item) => item.alcaldia))
    .map(([alcaldia, items]) => ({
      alcaldia,
      total: items.length,
      lowDocsShare: items.filter((item) => item.documentationStatus !== "completa").length / (items.length || 1)
    }))
    .sort((a, b) => b.total - a.total || b.lowDocsShare - a.lowDocsShare)[0] ?? null;

  const promoterCompleteShare = share(withPromoter.filter((item) => item.documentationStatus === "completa").length, withPromoter.length || 1);
  const noPromoterCompleteShare = share(noPromoter.filter((item) => item.documentationStatus === "completa").length, noPromoter.length || 1);
  const horarioCompleteShare = share(withHorario.filter((item) => item.documentationStatus === "completa").length, withHorario.length || 1);
  const confirmedDocumentedShare = share(confirmedOpening.filter((item) => item.documentationStatus === "completa").length, confirmedOpening.length || 1);

  return [
    {
      title: "Cobertura documental defendible",
      body: `${share(fullyDocumented.length, total).toFixed(1)}% de las canchas visibles tiene documentación completa. ${topComplete ? `${topComplete.alcaldia} concentra el mayor volumen de expedientes completos (${formatNumber(topComplete.total)}).` : ""}`
    },
    {
      title: "Promotor de futbol y completitud documental",
      body: `${share(withPromoter.length, total).toFixed(1)}% de las canchas reporta promotor de futbol. Entre ellas, ${promoterCompleteShare.toFixed(1)}% tiene expediente completo, frente a ${noPromoterCompleteShare.toFixed(1)}% entre las canchas sin promotor confirmado.`
    },
    {
      title: "Horario como señal de expediente maduro",
      body: `${share(withHorario.length, total).toFixed(1)}% ya registra horario o malla horaria. Dentro de ese grupo, ${horarioCompleteShare.toFixed(1)}% tiene documentación completa. ${topNoHorario ? `${topNoHorario.alcaldia} concentra más casos sin horario (${formatNumber(topNoHorario.total)}).` : ""}`
    },
    {
      title: "Coincidencias probables aún no confirmadas",
      body: `${share(probableOpening.length, total).toFixed(1)}% de las canchas visibles tiene coincidencia probable con evidencia oficial, pero todavía no confirmación suficiente para publicarse como inaugurada. ${topProbableLowDocs ? `${topProbableLowDocs.alcaldia} concentra más probables con expediente todavía incompleto.` : ""}`
    },
    {
      title: "Focos de seguimiento inmediato",
      body: `${topMinimal ? `${topMinimal.alcaldia} concentra más expedientes mínimos (${formatNumber(topMinimal.total)}). ` : ""}${topNoConfirmation ? `${topNoConfirmation.alcaldia} lidera los casos sin confirmación pública (${formatNumber(topNoConfirmation.total)}). ` : ""}${topNoPromoter ? `${topNoPromoter.alcaldia} concentra más canchas sin promotor confirmado (${formatNumber(topNoPromoter.total)}).` : ""}`
    },
    {
      title: "Confirmación pública y expediente",
      body: `${share(confirmedOpening.length, total).toFixed(1)}% de las canchas visibles cuenta con inauguración confirmada individualmente. Dentro de ese grupo, ${confirmedDocumentedShare.toFixed(1)}% también tiene expediente documental completo.`
    }
  ];
};

export const buildCanchasTableRows = (records: CanchaOperationalRecord[]) => {
  return records.map((record) => ({
    Nombre: record.name,
    Alcaldía: record.alcaldia,
    Domicilio: record.domicilio,
    "Fecha administrativa": record.inaugurationDateIso ?? record.inaugurationDateRaw ?? "",
    "Estado administrativo":
      record.administrativeStatus === "registrada"
        ? "Registrada"
        : record.administrativeStatus === "incompleta"
          ? "Incompleta"
          : "Requiere revisión",
    "Completitud documental":
      record.documentationStatus === "completa"
        ? "Completa"
        : record.documentationStatus === "parcial"
          ? "Parcial"
          : "Mínima",
    "Estado de obra":
      record.workStatus === "intervencion_confirmada"
        ? "Intervención confirmada"
        : record.workStatus === "lista_confirmada"
          ? "Lista confirmada"
          : record.workStatus === "entregada_confirmada"
            ? "Entrega confirmada"
            : record.workStatus === "contradiccion"
              ? "Contradicción"
              : "Sin confirmación",
    "Estado de apertura":
      record.openingStatus === "inaugurada_confirmada"
        ? "Inaugurada confirmada"
        : record.openingStatus === "probable"
          ? "Probable"
          : record.openingStatus === "contradiccion"
            ? "Contradicción"
            : "Sin confirmación pública",
    "Semáforo documental": documentationTrafficLight(record),
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
    "Confianza conciliación":
      record.matchConfidence === "alta"
        ? "Alta"
        : record.matchConfidence === "media"
          ? "Media"
          : record.matchConfidence === "baja"
            ? "Baja"
            : "Sin match",
    "Evidencia oficial": record.hasOfficialEvidence ? "Sí" : "No",
    "Última verificación": record.lastVerifiedAt ?? "",
    "Calidad del dato": record.dataQualityLabel
  }));
};
