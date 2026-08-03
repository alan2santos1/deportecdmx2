import type { DataLayer, InfrastructureDetailRecord, QualityGrade } from "../../../../lib/dashboard-types";

export type InfrastructureLayerCoverage =
  | "nominal_cdmx"
  | "territorial_agregada"
  | "parcial_cdmx"
  | "sin_cobertura"
  | "pendiente_integracion";

export type InfrastructureLayerKind =
  | "infraestructura_publica"
  | "infraestructura_comunitaria"
  | "infraestructura_privada"
  | "movilidad_activa"
  | "espacio_publico"
  | "academica"
  | "territorial";

export type InfrastructureLayerStatus = "activa" | "preparada" | "desactivada";

export type InfrastructureLayerProvenance = {
  institution: string;
  sourceType: "dataset_oficial" | "investigacion_curada" | "archivo_procesado" | "placeholder_arquitectonico";
  sourceUrl?: string;
  localPath?: string;
  sourceDate?: string;
  asOfDate?: string;
  referencePeriod?: string;
  methodology?: string;
  coverage?: string;
  provenanceNote: string;
};

export type InfrastructureLayerDescriptor = {
  key: string;
  label: string;
  version: string;
  enabledByDefault: boolean;
  status: InfrastructureLayerStatus;
  dataType: DataLayer;
  qualityGrade: QualityGrade;
  layerKind: InfrastructureLayerKind;
  coverageLevel: InfrastructureLayerCoverage;
  methodology: string;
  provenance: InfrastructureLayerProvenance;
};

export type InfrastructureLayerBuildResult = {
  descriptor: InfrastructureLayerDescriptor;
  details: InfrastructureDetailRecord[];
};

export type InfrastructureLayerModule = {
  descriptor: InfrastructureLayerDescriptor;
  build: () => InfrastructureLayerBuildResult;
};

export type OfficialInfrastructureSummaryByAlcaldia = Record<
  string,
  {
    pilares: number;
    utopias: number;
    publicSportsCenters: number;
    privateFacilities: number;
    privateGyms: number;
    privateClubs: number;
    privateSchools: number;
  }
>;
