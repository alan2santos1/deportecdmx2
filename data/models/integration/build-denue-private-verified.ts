import fs from "fs";
import path from "path";
import {
  extractDenueScianCode,
  getDenueScianDefinition,
  normalizeDenueRecord,
  supportedDenueScianCodes
} from "./denue-normalizer";
import { normalizeAlcaldia } from "./normalize-alcaldia";
import { officialSourceConfig } from "./official-source-config";

type DenueGeojsonFeature = {
  properties: Record<string, string | null | undefined>;
  geometry?: { type: string; coordinates?: [number, number] };
};

type DenueGeojson = {
  features: DenueGeojsonFeature[];
};

type DenueVerifiedRecord = {
  id: string;
  clee: string | null;
  originalId: string | null;
  razonSocial: string | null;
  nombreComercial: string | null;
  domicilio: string | null;
  colonia: string | null;
  alcaldia: string;
  originalAlcaldia: string | null;
  geoKey: string | null;
  latitud: number | null;
  longitud: number | null;
  scian: string;
  scianDescripcion: string;
  categoriaDashboard: string | null;
  ownershipScope: "privado" | "publico_mixto";
  fechaDirectorio: string | null;
  fuente: string;
  version: string;
  qualityGrade: "A" | "B" | "C" | "D";
  coverageLevel: "completa" | "parcial" | "agregada" | "no_representativa" | "no_disponible";
  institutionalScope: "infraestructura_privada" | "cdmx_general";
  sourceDate: string;
  methodology: string;
  provenance: {
    dataset: string;
    sourceUrl: string;
    localPath: string;
    featureIndex: number;
    geometryType: string | null;
  };
  metadata: Record<string, string | null | undefined>;
};

export type DenuePrivateVerifiedLayer = {
  meta: {
    generatedAt: string;
    dataset: string;
    sourceUrl: string;
    localPath: string;
    sourceDate: string;
    version: string;
    status: "preparado" | "activo";
    dataType: "preparado" | "real";
    methodology: string;
    qualityGrade: "A" | "B" | "C" | "D";
    coverageLevel: "completa" | "parcial" | "agregada" | "no_representativa" | "no_disponible";
    scianTargets: typeof officialSourceConfig.denue.scianTargets;
    audit: {
      totalRawFeatures: number;
      featuresWithSupportedScian: number;
      featuresWithoutSupportedScian: number;
      duplicateFeaturesSkipped: number;
      verifiedPrivateRecords: number;
      unsupportedOwnershipRecords: number;
      missingCoordinates: number;
      missingClee: number;
      missingOriginalId: number;
      missingScianFieldInRawExtract: boolean;
    };
    distributions: {
      byAlcaldia: Array<{ alcaldia: string; count: number }>;
      byCategory: Array<{ category: string; count: number }>;
      byScian: Array<{ scian: string; label: string; count: number }>;
    };
    limitations: string[];
  };
  records: DenueVerifiedRecord[];
};

const denuePath = path.join(process.cwd(), officialSourceConfig.denue.localPath);

const readDenue = (): DenueGeojson | null => {
  if (!fs.existsSync(denuePath)) return null;
  return JSON.parse(fs.readFileSync(denuePath, "utf-8")) as DenueGeojson;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildDistribution = (values: string[]) =>
  Object.entries(
    values.reduce<Record<string, number>>((acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

export const buildDenuePrivateVerifiedLayer = (): DenuePrivateVerifiedLayer => {
  const raw = readDenue();
  const generatedAt = new Date().toISOString();
  const version = "denue-private-v1-2026-08-04";
  const methodology =
    "La capa privada DENUE solo admite registros con SCIAN 2023 explícito en el extracto integrado. No usa NLP, clasificación por nombre, actividad, categoría comercial ni inferencias de disciplina, amenidades o capacidad.";

  if (!raw?.features?.length) {
    return {
      meta: {
        generatedAt,
        dataset: officialSourceConfig.denue.dataset,
        sourceUrl: officialSourceConfig.denue.url,
        localPath: officialSourceConfig.denue.localPath,
        sourceDate: "2026-08-04",
        version,
        status: "preparado",
        dataType: "preparado",
        methodology,
        qualityGrade: "D",
        coverageLevel: "no_disponible",
        scianTargets: officialSourceConfig.denue.scianTargets,
        audit: {
          totalRawFeatures: 0,
          featuresWithSupportedScian: 0,
          featuresWithoutSupportedScian: 0,
          duplicateFeaturesSkipped: 0,
          verifiedPrivateRecords: 0,
          unsupportedOwnershipRecords: 0,
          missingCoordinates: 0,
          missingClee: 0,
          missingOriginalId: 0,
          missingScianFieldInRawExtract: true
        },
        distributions: {
          byAlcaldia: [],
          byCategory: [],
          byScian: []
        },
        limitations: [
          "No existe extracto DENUE cargado en el repositorio o el archivo está vacío.",
          "La capa permanece preparada hasta incorporar un corte con SCIAN verificable."
        ]
      },
      records: []
    };
  }

  const seen = new Set<string>();
  let duplicateFeaturesSkipped = 0;
  let unsupportedOwnershipRecords = 0;
  let missingCoordinates = 0;
  let missingClee = 0;
  let missingOriginalId = 0;

  const featuresWithSupportedScian = raw.features.filter((feature) =>
    Boolean(extractDenueScianCode(feature.properties))
  ).length;

  const missingScianFieldInRawExtract = raw.features.every(
    (feature) => !supportedDenueScianCodes.some((code) => Object.values(feature.properties).includes(code))
  );

  const records = raw.features.flatMap((feature, index) => {
    const scian = extractDenueScianCode(feature.properties);
    if (!scian) return [];

    const normalized = normalizeDenueRecord({
      id: `denue-${index + 1}`,
      nombre: feature.properties.nmbr_st ?? feature.properties.rzn_scl ?? `DENUE ${index + 1}`,
      alcaldia: feature.properties.alcaldi,
      scianCode: scian
    });
    if (!normalized) return [];

    if (normalized.ownershipScope !== "privado") {
      unsupportedOwnershipRecords += 1;
      return [];
    }

    const normalizedAlcaldia = normalizeAlcaldia(feature.properties.alcaldi);
    const coords = feature.geometry?.coordinates;
    const dedupeKey = [
      normalized.scianCode,
      feature.properties.clee ?? "",
      feature.properties.nmbr_st ?? feature.properties.rzn_scl ?? "",
      feature.properties.direccn ?? "",
      normalizedAlcaldia.alcaldia,
      Array.isArray(coords) ? coords.join(",") : ""
    ].join("|");

    if (seen.has(dedupeKey)) {
      duplicateFeaturesSkipped += 1;
      return [];
    }
    seen.add(dedupeKey);

    const definition = getDenueScianDefinition(normalized.scianCode);
    if (!definition) return [];

    const clee = feature.properties.clee ?? null;
    const originalId = feature.properties.id ?? feature.properties.objectid ?? feature.properties.ogc_fid ?? null;
    if (!clee) missingClee += 1;
    if (!originalId) missingOriginalId += 1;

    const latitud = Array.isArray(coords) ? toNumber(coords[1]) : null;
    const longitud = Array.isArray(coords) ? toNumber(coords[0]) : null;
    if (latitud === null || longitud === null) missingCoordinates += 1;

    const record: DenueVerifiedRecord = {
      id: normalized.id,
      clee,
      originalId,
      razonSocial: feature.properties.rzn_scl ?? null,
      nombreComercial: feature.properties.nmbr_st ?? null,
      domicilio: feature.properties.direccn ?? null,
      colonia: feature.properties.colonia ?? null,
      alcaldia: normalizedAlcaldia.alcaldia,
      originalAlcaldia: normalizedAlcaldia.original,
      geoKey: normalizedAlcaldia.geoKey,
      latitud,
      longitud,
      scian: normalized.scianCode,
      scianDescripcion: definition.label,
      categoriaDashboard: normalized.dashboardCategory,
      ownershipScope: normalized.ownershipScope,
      fechaDirectorio: feature.properties.fech_lt ?? null,
      fuente: "INEGI / DENUE CDMX",
      version,
      qualityGrade: "B",
      coverageLevel: "parcial",
      institutionalScope: "infraestructura_privada",
      sourceDate: "2026-08-04",
      methodology,
      provenance: {
        dataset: officialSourceConfig.denue.dataset,
        sourceUrl: officialSourceConfig.denue.url,
        localPath: officialSourceConfig.denue.localPath,
        featureIndex: index,
        geometryType: feature.geometry?.type ?? null
      },
      metadata: feature.properties
    };

    return [record];
  });

  const byAlcaldia = buildDistribution(records.map((record) => record.alcaldia)).map(({ key, count }) => ({
    alcaldia: key,
    count
  }));
  const byCategory = buildDistribution(
    records.map((record) => record.categoriaDashboard ?? "Otros deportivos")
  ).map(({ key, count }) => ({ category: key, count }));
  const byScian = buildDistribution(records.map((record) => record.scian)).map(({ key, count }) => ({
    scian: key,
    label: getDenueScianDefinition(key)?.label ?? key,
    count
  }));

  const featuresWithoutSupportedScian = raw.features.length - featuresWithSupportedScian;
  const verifiedPrivateRecords = records.length;

  return {
    meta: {
      generatedAt,
      dataset: officialSourceConfig.denue.dataset,
      sourceUrl: officialSourceConfig.denue.url,
      localPath: officialSourceConfig.denue.localPath,
      sourceDate: "2026-08-04",
      version,
      status: verifiedPrivateRecords > 0 ? "activo" : "preparado",
      dataType: verifiedPrivateRecords > 0 ? "real" : "preparado",
      methodology,
      qualityGrade: verifiedPrivateRecords > 0 ? "B" : "D",
      coverageLevel: verifiedPrivateRecords > 0 ? "parcial" : "no_disponible",
      scianTargets: officialSourceConfig.denue.scianTargets,
      audit: {
        totalRawFeatures: raw.features.length,
        featuresWithSupportedScian,
        featuresWithoutSupportedScian,
        duplicateFeaturesSkipped,
        verifiedPrivateRecords,
        unsupportedOwnershipRecords,
        missingCoordinates,
        missingClee,
        missingOriginalId,
        missingScianFieldInRawExtract
      },
      distributions: {
        byAlcaldia,
        byCategory,
        byScian
      },
      limitations: [
        "Solo se integran registros con SCIAN 2023 explícito y soportado por el proyecto.",
        "Los códigos 713942, 713944 y 611622 no alimentan la capa privada del dashboard porque corresponden a sector público o mixto en la gobernanza vigente del repositorio.",
        "Si el extracto no preserva CLEE u originalId, esos campos se conservan como nulos y se reportan como limitación del corte.",
        "No se derivan disciplinas, amenidades, capacidad, usuarios ni número de canchas a partir del directorio económico."
      ]
    },
    records
  };
};
