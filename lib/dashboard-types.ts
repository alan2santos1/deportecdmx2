export type DataLayer = "real" | "base_oficial" | "estimado" | "preparado" | "proyectado" | "insight";

export type InfrastructureType =
  | "PILARES"
  | "Deportivos públicos"
  | "Gimnasios"
  | "Parques / áreas verdes";

export type MetricMetadata = {
  source: string;
  dataType: DataLayer;
  note: string;
};

export type TerritorialRecord = {
  alcaldia: string;
  year: number;
  sex: "Hombres" | "Mujeres";
  ageGroup: "12-17" | "18-29" | "30-44" | "45-59" | "60+";
  sportFocus: string;
  dominantInfraType: InfrastructureType;
  population: number;
  activePopulation: number;
  activeRate: number;
  sedentaryRate: number;
  obesityRate: number;
  overweightRate: number;
  combinedWeightRiskRate: number;
  diabetesRate: number;
  pilares: number;
  publicSportsCenters: number;
  privateGyms: number;
  parks: number;
  totalInfrastructure: number;
  infraPer100k: number;
  activityDataType: Exclude<DataLayer, "real" | "insight" | "base_oficial">;
  healthDataType: "estimado";
  infrastructureDataType: "real";
  populationDataType: "base_oficial" | "proyectado";
  activitySource: string;
  healthSource: string;
  infrastructureSource: string;
  populationSource: string;
  methodologicalNote: string;
  methodologicalBreak?: string;
};

export type InfrastructureDetailRecord = {
  id: string;
  spaceName: string;
  tipo_espacio: string;
  infrastructureType: InfrastructureType;
  alcaldia: string;
  year: number;
  sportsAvailable: string[];
  administrativeCount: number;
  administrativeLabel: string;
  operationalUnits: number;
  operationalLabel: string;
  capacity: number;
  capacityType: "real" | "estimada";
  units: number;
  latitude?: number | null;
  longitude?: number | null;
  status?: string | null;
  sourceDataset?: string;
  originalAlcaldia?: string | null;
  needsAlcaldiaNormalization?: boolean;
  geoKey?: string;
  subtype?: string;
  dataType: DataLayer;
  source: string;
  methodologicalNote: string;
};

export type SportsRecord = {
  alcaldia: string;
  year: number;
  sex: "Hombres" | "Mujeres";
  ageGroup: TerritorialRecord["ageGroup"];
  sport: string;
  participants: number;
  share: number;
  dataType: "preparado";
  source: string;
  note: string;
};

export type HealthProfileRecord = {
  year: number;
  sex: "Hombres" | "Mujeres";
  ageGroup: TerritorialRecord["ageGroup"];
  obesityRate: number;
  overweightRate: number;
  diabetesRate: number;
  sedentaryRate: number;
  dataType: DataLayer;
  source: string;
  methodologicalNote: string;
};

export type MethodologyEntry = {
  module: string;
  metric: string;
  layer: DataLayer;
  source: string;
  logic: string;
  limitation: string;
};

export type SourceRegistryEntry = {
  metric: string;
  layer: DataLayer;
  source: string;
  coverage: string;
  note: string;
};

export type InsightEntry = {
  title: string;
  summary: string;
  implication: string;
};

export type QualityEntry = {
  check: string;
  scope: string;
  status: "OK" | "ATENCION";
  note: string;
};

export type DashboardMeta = {
  generatedAt: string;
  supportedYears: number[];
  activityBaseYears: number[];
  healthBaseYear: number;
  projectionYear: number;
  methodologyBreaks: string[];
  projectedYears: number[];
  timelineNotes: string[];
};

export type MapAreaRecord = {
  alcaldia: string;
  year: number;
  geoKey: string;
  centroid: { lat: number; lon: number };
  activityRate: number;
  riskScore: number;
  riskLevel: "Verde" | "Amarillo" | "Rojo";
  infraPer100k: number;
  dataType: DataLayer;
  source: string;
  methodologicalNote: string;
};

export type MapGeometryFeature = {
  geoKey: string;
  alcaldia: string;
  path: string;
};

export type DashboardDataset = {
  meta: DashboardMeta;
  territorialRecords: TerritorialRecord[];
  infrastructureDetails: InfrastructureDetailRecord[];
  sportsRecords: SportsRecord[];
  healthProfiles: HealthProfileRecord[];
  mapAreas: MapAreaRecord[];
  mapGeometry: MapGeometryFeature[];
  methodology: MethodologyEntry[];
  sourceRegistry: SourceRegistryEntry[];
  qualityChecks: QualityEntry[];
  insights: InsightEntry[];
};

export type DashboardFilterState = {
  alcaldias: string[];
  years: string[];
  sexes: string[];
  ageGroups: string[];
  sports: string[];
  infrastructureTypes: string[];
};
