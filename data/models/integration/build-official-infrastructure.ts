import fs from "fs";
import path from "path";
import type { DataLayer, InfrastructureDetailRecord } from "../../../lib/dashboard-types";
import { buildInfrastructureModules } from "./infrastructure/modules";
import type { OfficialInfrastructureSummaryByAlcaldia } from "./infrastructure/types";

export type OfficialInfrastructureLayer = {
  meta: {
    generatedAt: string;
    integratedSources: Array<{
      key: string;
      dataset: string;
      localPath: string;
      integrated: boolean;
      recordCount: number;
      note: string;
      enabledByDefault: boolean;
      version: string;
      status: string;
      dataType: string;
      qualityGrade: string;
      coverageLevel: string;
      methodology: string;
      provenance: {
        institution: string;
        sourceType: string;
        sourceUrl?: string;
        sourceDate?: string;
        asOfDate?: string;
        coverage?: string;
        methodology?: string;
        provenanceNote: string;
      };
    }>;
    layerRegistry: Array<{
      key: string;
      label: string;
      enabledByDefault: boolean;
      status: string;
      version: string;
      dataType: string;
      qualityGrade: string;
      coverageLevel: string;
      methodology: string;
    }>;
  };
  details: InfrastructureDetailRecord[];
  summaryByAlcaldia: OfficialInfrastructureSummaryByAlcaldia;
  geometryPlaceholder: Array<{ alcaldia: string; geoKey: string; status: DataLayer; note: string }>;
};

const buildSummaryByAlcaldia = (
  details: OfficialInfrastructureLayer["details"]
): OfficialInfrastructureSummaryByAlcaldia => {
  return details.reduce<OfficialInfrastructureSummaryByAlcaldia>((acc, item) => {
    const key = item.alcaldia;
    if (key === "Sin alcaldía documentada") return acc;

    acc[key] = acc[key] ?? {
      pilares: 0,
      utopias: 0,
      publicSportsCenters: 0,
      privateFacilities: 0,
      privateGyms: 0,
      privateClubs: 0,
      privateSchools: 0
    };

    if (item.infrastructureType === "PILARES") acc[key].pilares += 1;
    if (item.infrastructureType === "UTOPÍAs") acc[key].utopias += 1;
    if (item.infrastructureType === "Deportivos públicos") acc[key].publicSportsCenters += 1;

    if (item.sourceDataset === "Infraestructura privada DENUE") {
      acc[key].privateFacilities += 1;
      if (item.subtype === "Gimnasio privado") acc[key].privateGyms += 1;
      if (item.subtype === "Club deportivo privado") acc[key].privateClubs += 1;
      if (item.subtype === "Academia deportiva privada") acc[key].privateSchools += 1;
    }

    return acc;
  }, {});
};

const buildGeometryPlaceholder = (summaryByAlcaldia: OfficialInfrastructureSummaryByAlcaldia) => {
  return Object.keys(summaryByAlcaldia).map((alcaldia) => ({
    alcaldia,
    geoKey: alcaldia
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    status: "preparado" as DataLayer,
    note: "Placeholder legado para compatibilidad. La geometría oficial vive en la capa territorial y no en cada fuente de infraestructura."
  }));
};

const geometryLocalPath = "data/raw/external/alcaldias.geojson";

export const buildOfficialInfrastructureLayer = (): OfficialInfrastructureLayer => {
  const modules = buildInfrastructureModules();
  const activeResults = modules
    .filter((module) => module.descriptor.enabledByDefault)
    .map((module) => module.build());

  const details = activeResults.flatMap((result) => result.details);
  const summaryByAlcaldia = buildSummaryByAlcaldia(details);
  const geometryPlaceholder = buildGeometryPlaceholder(summaryByAlcaldia);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      integratedSources: [
        ...activeResults.map((result) => ({
          key: result.descriptor.key,
          dataset: result.descriptor.label,
          localPath: result.descriptor.provenance.localPath ?? "",
          integrated: result.details.length > 0,
          recordCount: result.details.length,
          note: result.descriptor.provenance.provenanceNote,
          enabledByDefault: result.descriptor.enabledByDefault,
          version: result.descriptor.version,
          status: result.descriptor.status,
          dataType: result.descriptor.dataType,
          qualityGrade: result.descriptor.qualityGrade,
          coverageLevel: result.descriptor.coverageLevel,
          methodology: result.descriptor.methodology,
          provenance: {
            institution: result.descriptor.provenance.institution,
            sourceType: result.descriptor.provenance.sourceType,
            sourceUrl: result.descriptor.provenance.sourceUrl,
            sourceDate: result.descriptor.provenance.sourceDate,
            asOfDate: result.descriptor.provenance.asOfDate,
            coverage: result.descriptor.provenance.coverage,
            methodology: result.descriptor.provenance.methodology,
            provenanceNote: result.descriptor.provenance.provenanceNote
          }
        })),
        {
          key: "geometry",
          dataset: "Geometría de alcaldías",
          localPath: geometryLocalPath,
          integrated: fs.existsSync(path.join(process.cwd(), geometryLocalPath)),
          recordCount: geometryPlaceholder.length,
          note: "Activo territorial base compartido por todas las capas; no es una fuente de infraestructura por sí misma.",
          enabledByDefault: true,
          version: "infra-v1-2026-08-03",
          status: "activa",
          dataType: "real",
          qualityGrade: "A",
          coverageLevel: "nominal_cdmx",
          methodology: "Compatibilidad canónica con geoKey para mapa y agregación territorial.",
          provenance: {
            institution: "Datos Abiertos CDMX / geometría oficial",
            sourceType: "dataset_oficial",
            sourceDate: "2026-08-03",
            asOfDate: "2026-08-03",
            coverage: "16 alcaldías",
            methodology: "Geometría base compartida a nivel alcaldía.",
            provenanceNote: "La arquitectura territorial queda desacoplada de las capas de infraestructura."
          }
        }
      ],
      layerRegistry: modules.map((module) => ({
        key: module.descriptor.key,
        label: module.descriptor.label,
        enabledByDefault: module.descriptor.enabledByDefault,
        status: module.descriptor.status,
        version: module.descriptor.version,
        dataType: module.descriptor.dataType,
        qualityGrade: module.descriptor.qualityGrade,
        coverageLevel: module.descriptor.coverageLevel,
        methodology: module.descriptor.methodology
      }))
    },
    details,
    summaryByAlcaldia,
    geometryPlaceholder
  };
};
