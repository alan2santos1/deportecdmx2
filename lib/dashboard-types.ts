export type DataLayer = "real" | "base_oficial" | "estimado" | "preparado" | "proyectado" | "insight";

export type InfrastructureType =
  | "PILARES"
  | "UTOPÍAs"
  | "Deportivos públicos"
  | "Gimnasio privado"
  | "Club deportivo privado"
  | "Academia deportiva privada"
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
  privateClubs: number;
  privateSchools: number;
  utopias: number;
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
  disciplineStatus: "disponible" | "no_documentado";
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

export type CanchaOperationalStatus = "completa" | "lista_para_operar" | "parcial" | "pendiente";
export type CanchaInaugurationStatus = "inaugurada" | "proxima" | "sin_fecha";
export type CanchaGeolocationType = "real" | "aproximada_pilares" | "aproximada_alcaldia" | "sin_coordenada";

export type CanchaOperationalRecord = {
  id: string;
  consecutiveNumber: number;
  year: number;
  alcaldia: string;
  geoKey: string;
  name: string;
  domicilio: string;
  tipoCancha?: string | null;
  material?: string | null;
  origen?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  projectedPoint?: { x: number; y: number } | null;
  geolocationType: CanchaGeolocationType;
  geolocationLabel: string;
  geolocationSource: string;
  mapsLink?: string | null;
  pilaresAssigned: string | null;
  assignedPilaresOfficialName?: string | null;
  assignedPilaresResponsibleName?: string | null;
  assignedPilaresContact?: string | null;
  assignedPilaresEmail?: string | null;
  assignedPilaresSchedule?: string | null;
  assignedPilaresAlcaldia?: string | null;
  nearestPilares1?: string | null;
  distanceToPilares1?: number | null;
  nearestPilares2?: string | null;
  distanceToPilares2?: number | null;
  territorialStatus?: string | null;
  territorialAdvance?: string | null;
  territorialSourceSheet?: string | null;
  nombreFiguraEducativa?: string | null;
  tipoFiguraEducativa?: string | null;
  telefonoFiguraEducativa?: string | null;
  inaugurationDateRaw?: string | null;
  inaugurationDateIso?: string | null;
  inaugurationStatus: CanchaInaugurationStatus;
  tienePromotorFutbol: "si" | "no" | "sin_dato";
  mallaHorariaFutbol?: string | null;
  schedule?: string | null;
  mallaHorariaDisciplinas?: string | null;
  disciplinas: string[];
  activities: string[];
  promoterCount?: number | null;
  observations?: string | null;
  operationalStatus: CanchaOperationalStatus;
  hasFigureEducativa: boolean;
  hasPhone: boolean;
  hasSchedule: boolean;
  hasActivities: boolean;
  hasCoordinates: boolean;
  sourceSheets: string[];
  source: string;
  dataType: "real";
  methodologicalNote: string;
  statusDerivedNote: string;
  inaugurationDerivedNote: string;
  dataQualityLabel: "alta" | "media" | "baja";
};

export type CanchasSummaryRecord = {
  alcaldia: string;
  total: number;
  inauguradas: number;
  proximas: number;
  pendientes: number;
  completas: number;
  conHorario: number;
  conFiguraEducativa: number;
  conActividades: number;
  conCoordenadas: number;
  source: string;
  dataType: "insight";
  methodologicalNote: string;
};

export type CanchasFilterState = {
  alcaldias: string[];
  operationalStatuses: string[];
  inaugurationStatuses: string[];
  figurePresence: string[];
  schedulePresence: string[];
  activityPresence: string[];
  types: string[];
  materials: string[];
  origins: string[];
};

export type MapAreaRecord = {
  alcaldia: string;
  year: number;
  geoKey: string;
  centroid: { lat: number; lon: number };
  activityRate: number;
  obesityRate: number;
  diabetesRate: number;
  sedentaryRate: number;
  riskScore: number;
  riskLevel: "Verde" | "Amarillo" | "Rojo";
  publicInfrastructureCount: number;
  privateInfrastructureCount: number;
  totalInfrastructureCount: number;
  utopiasCount: number;
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
  canchasRecords: CanchaOperationalRecord[];
  canchasSummary: CanchasSummaryRecord[];
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
