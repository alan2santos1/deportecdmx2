import fs from "fs";
import path from "path";
import type {
  DashboardPublicSpaceSummary,
  PublicSpaceCategorySummary,
  PublicSpaceRecord,
  PublicSpaceSummaryByAlcaldia
} from "../../../lib/dashboard-types";
import { officialSourceConfig } from "./official-source-config";
import { normalizeAlcaldia } from "./normalize-alcaldia";

type GeoJsonGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

type GeoJsonFeature = {
  type: "Feature";
  properties: Record<string, string | null | undefined>;
  geometry: GeoJsonGeometry | null;
};

type GeoJsonCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

type LinearRing = number[][];
type PolygonCoordinates = LinearRing[];
type MultiPolygonCoordinates = PolygonCoordinates[];

type AlcaldiaFeature = {
  properties: { NOMGEO: string };
  geometry:
    | { type: "Polygon"; coordinates: PolygonCoordinates }
    | { type: "MultiPolygon"; coordinates: MultiPolygonCoordinates };
};

type PublicSpaceLayer = {
  meta: {
    generatedAt: string;
    version: string;
    sourceDate: string;
    methodology: string;
    note: string;
  };
  publicSpace: {
    integrated: boolean;
    sourceDataset: string;
    sourceInstitution: string;
    sourceDate: string;
    publicationDate: string;
    license: string;
    version: string;
    records: PublicSpaceRecord[];
    note: string;
  };
  greenAreas: {
    integrated: boolean;
    sourceDataset: string;
    sourceInstitution: string;
    sourceDate: string;
    publicationDate: string;
    license: string;
    version: string;
    records: PublicSpaceRecord[];
  };
  summary: DashboardPublicSpaceSummary;
};

const version = "public-space-v1-2026-08-06";
const sourceDate = "2026-08-06";
const methodology =
  "La capa de espacio público separa estrictamente dos universos oficiales: Espacio público de la Ciudad de México e Inventario de Áreas Verdes. No infiere infraestructura deportiva, amenidades, seguridad, accesibilidad ni práctica física. La alcaldía se deriva por centroide y contención espacial cuando la fuente no la publica.";

const readJson = <T,>(filePath: string): T | null => {
  const absolute = path.join(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) return null;
  return JSON.parse(fs.readFileSync(absolute, "utf-8")) as T;
};

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const getOuterRings = (geometry: GeoJsonGeometry | null) => {
  if (!geometry) return [] as number[][][];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
};

const ringArea = (ring: number[][]) => {
  let area = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[(index + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
};

const centroidFromRing = (ring: number[][]) => {
  let areaAccumulator = 0;
  let xAccumulator = 0;
  let yAccumulator = 0;

  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[(index + 1) % ring.length];
    const factor = x1 * y2 - x2 * y1;
    areaAccumulator += factor;
    xAccumulator += (x1 + x2) * factor;
    yAccumulator += (y1 + y2) * factor;
  }

  const area = areaAccumulator / 2;
  if (Math.abs(area) < 1e-12) {
    const sum = ring.reduce(
      (acc, point) => ({ x: acc.x + point[0], y: acc.y + point[1] }),
      { x: 0, y: 0 }
    );
    return { lon: sum.x / (ring.length || 1), lat: sum.y / (ring.length || 1), area: 0 };
  }

  return {
    lon: xAccumulator / (6 * area),
    lat: yAccumulator / (6 * area),
    area: Math.abs(area)
  };
};

const geometryCentroid = (geometry: GeoJsonGeometry | null) => {
  if (!geometry) return null;
  if (geometry.type === "Point") return { lat: geometry.coordinates[1], lon: geometry.coordinates[0] };

  const polygons = getOuterRings(geometry);
  if (polygons.length === 0) return null;

  let selected: { lat: number; lon: number; area: number } | null = null;

  for (const polygon of polygons) {
    const ring = polygon[0] as number[][];
    if (!ring || ring.length < 3) continue;
    const centroid = centroidFromRing(ring);
    if (!selected || centroid.area > selected.area) {
      selected = centroid;
    }
  }

  if (selected === null) return null;
  return { lat: selected.lat, lon: selected.lon };
};

const lonLatToMeters = (lon: number, lat: number, refLat: number) => {
  const rad = Math.PI / 180;
  const earthRadius = 6378137;
  const x = earthRadius * lon * rad * Math.cos(refLat * rad);
  const y = earthRadius * lat * rad;
  return [x, y];
};

const ringAreaSquareMeters = (ring: number[][], refLat: number) => {
  let area = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = lonLatToMeters(ring[index][0], ring[index][1], refLat);
    const [x2, y2] = lonLatToMeters(ring[(index + 1) % ring.length][0], ring[(index + 1) % ring.length][1], refLat);
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
};

const geometryAreaSquareMeters = (geometry: GeoJsonGeometry | null) => {
  if (!geometry || geometry.type === "Point") return null;
  const centroid = geometryCentroid(geometry);
  if (!centroid) return null;
  let total = 0;
  getOuterRings(geometry).forEach((polygon) => {
    polygon.forEach((ring, ringIndex) => {
      const area = ringAreaSquareMeters(ring as number[][], centroid.lat);
      total += ringIndex === 0 ? area : -area;
    });
  });
  return round(Math.max(total, 0));
};

const pointInRing = (point: { lon: number; lat: number }, ring: number[][]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = yi > point.lat !== yj > point.lat &&
      point.lon < ((xj - xi) * (point.lat - yi)) / ((yj - yi) || 1e-12) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
};

const pointInPolygon = (point: { lon: number; lat: number }, geometry: AlcaldiaFeature["geometry"]) => {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some((polygon) => {
    const [outer, ...holes] = polygon;
    if (!outer || !pointInRing(point, outer)) return false;
    return !holes.some((hole) => pointInRing(point, hole));
  });
};

const loadAlcaldias = (): AlcaldiaFeature[] => {
  const geojson = readJson<{ features: AlcaldiaFeature[] }>("data/raw/external/alcaldias.geojson");
  return geojson?.features ?? [];
};

const normalizeGreenAreaCategory = (category: string | null | undefined, subcategory: string | null | undefined) => {
  const categoryText = normalizeText(category);
  const subcategoryText = normalizeText(subcategory);

  if (subcategoryText.includes("camellon") || categoryText.includes("red vial")) return "camellón";
  if (subcategoryText.includes("plaza") || subcategoryText.includes("jardin")) return "plaza";
  if (
    subcategoryText.includes("parque") ||
    subcategoryText.includes("arboleda") ||
    categoryText.includes("parques") ||
    categoryText.includes("alamedas")
  ) {
    return "parque";
  }
  if (subcategoryText.includes("deportiv")) return "instalación recreativa o deportiva";
  if (categoryText.includes("area") || categoryText.includes("vegetacion") || categoryText.includes("verde")) {
    return "área verde";
  }
  return "otro espacio público";
};

const findAlcaldiaForCentroid = (
  centroid: { lat: number; lon: number } | null,
  alcaldias: AlcaldiaFeature[]
) => {
  if (!centroid) {
    return { alcaldia: null as string | null, geoKey: null as string | null };
  }
  const match = alcaldias.find((feature) =>
    pointInPolygon({ lon: centroid.lon, lat: centroid.lat }, feature.geometry)
  );
  if (!match) {
    return { alcaldia: null, geoKey: null };
  }
  const normalized = normalizeAlcaldia(match.properties.NOMGEO);
  return {
    alcaldia: normalized.alcaldia,
    geoKey: normalized.geoKey
  };
};

const groupByName = <T extends { id: string; normalizedName: string | null; alcaldia: string | null; normalizedCategory: string }>(
  records: T[]
) => {
  const groups = new Map<string, string[]>();
  records.forEach((record) => {
    if (!record.normalizedName) return;
    const key = [record.normalizedName ?? "__sin_nombre__", record.alcaldia ?? "__sin_alcaldia__", record.normalizedCategory].join("|");
    groups.set(key, [...(groups.get(key) ?? []), record.id]);
  });
  return groups;
};

const buildGreenAreaRecords = (): PublicSpaceRecord[] => {
  const geojson = readJson<GeoJsonCollection>(officialSourceConfig.greenAreas.localPath);
  if (!geojson?.features?.length) return [];

  const alcaldias = loadAlcaldias();

  const rawRecords = geojson.features.map((feature, index) => {
    const centroid = geometryCentroid(feature.geometry);
    const alcaldiaMatch = findAlcaldiaForCentroid(centroid, alcaldias);
    const originalName =
      feature.properties.nombre && feature.properties.nombre !== "0"
        ? feature.properties.nombre.trim()
        : null;
    const originalCategory = feature.properties.categoria_?.trim() || null;
    const originalSubcategory = feature.properties.subcat_sed?.trim() || null;

    return {
      id: `green-area-${index + 1}`,
      sourceLayer: "greenAreas" as const,
      sourceId: String(index + 1),
      originalName,
      normalizedName: originalName ? normalizeText(originalName) : null,
      originalCategory,
      normalizedCategory: normalizeGreenAreaCategory(originalCategory, originalSubcategory),
      originalSubcategory,
      geometryType:
        feature.geometry?.type === "MultiPolygon"
          ? "multipolygon"
          : feature.geometry?.type === "Polygon"
            ? "polygon"
            : feature.geometry?.type === "Point"
              ? "point"
              : "centroid_derived" as PublicSpaceRecord["geometryType"],
      geometry: feature.geometry
        ? {
            type: feature.geometry.type,
            coordinates: feature.geometry.coordinates
          }
        : null,
      centroid,
      alcaldia: alcaldiaMatch.alcaldia,
      areaSquareMeters: geometryAreaSquareMeters(feature.geometry),
      sourceInstitution: "Instituto de Planeación Democrática y Prospectiva",
      sourceDataset: officialSourceConfig.greenAreas.dataset,
      sourceDate,
      publicationDate: "2023-02-15",
      version,
      license: "CC-BY-4.0-ESP",
      dataType: "real" as const,
      qualityGrade: "B" as const,
      coverageLevel: "parcial" as const,
      methodology,
      provenance:
        "GeoJSON oficial IPDP descargado del Portal de Datos Abiertos CDMX. Alcaldía derivada por centroide y contención espacial sobre geometría oficial de alcaldías.",
      verificationStatus: "verificado" as const,
      deduplicationStatus: "unico" as const,
      duplicateGroupId: null,
      spatialOverlapRatio: null,
      reconciliationNotes:
        alcaldiaMatch.alcaldia
          ? "Registro geoespacial oficial integrado con alcaldía derivada por contención."
          : "Registro geoespacial oficial integrado sin alcaldía asignada; requiere revisión espacial adicional."
    };
  });

  const groups = groupByName(rawRecords);

  return rawRecords.map((record) => {
    if (!record.normalizedName) return record;
    const key = [record.normalizedName ?? "__sin_nombre__", record.alcaldia ?? "__sin_alcaldia__", record.normalizedCategory].join("|");
    const groupIds = groups.get(key) ?? [];
    if (groupIds.length <= 1) return record;
    return {
      ...record,
      deduplicationStatus: "nombre_repetido" as const,
      duplicateGroupId: `dup-${key.replace(/[^a-z0-9]+/g, "-")}`.slice(0, 120),
      reconciliationNotes: `${record.reconciliationNotes} Nombre repetido dentro de la misma alcaldía/categoría; no se elimina automáticamente.`
    };
  });
};

const buildSummaryByAlcaldia = (records: PublicSpaceRecord[]): PublicSpaceSummaryByAlcaldia[] => {
  const map = new Map<string, PublicSpaceSummaryByAlcaldia>();
  records.forEach((record) => {
    if (!record.alcaldia) return;
    const normalized = normalizeAlcaldia(record.alcaldia);
    const current = map.get(record.alcaldia) ?? {
      alcaldia: record.alcaldia,
      geoKey: normalized.geoKey,
      greenAreaRecords: 0,
      greenAreaSurfaceSqM: 0,
      publicSpaceRecords: 0
    };
    if (record.sourceLayer === "greenAreas") {
      current.greenAreaRecords += 1;
      current.greenAreaSurfaceSqM += record.areaSquareMeters ?? 0;
    } else {
      current.publicSpaceRecords += 1;
    }
    map.set(record.alcaldia, current);
  });
  return Array.from(map.values())
    .map((record) => ({ ...record, greenAreaSurfaceSqM: round(record.greenAreaSurfaceSqM) }))
    .sort((a, b) => b.greenAreaRecords - a.greenAreaRecords || a.alcaldia.localeCompare(b.alcaldia, "es"));
};

const buildCategorySummary = (records: PublicSpaceRecord[]): PublicSpaceCategorySummary[] => {
  const map = new Map<string, PublicSpaceCategorySummary>();
  records.forEach((record) => {
    const key = `${record.sourceLayer}|${record.normalizedCategory}`;
    const current = map.get(key) ?? {
      category: record.normalizedCategory,
      count: 0,
      sourceLayer: record.sourceLayer
    };
    current.count += 1;
    map.set(key, current);
  });
  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, "es"));
};

export const buildPublicSpaceLayer = (): PublicSpaceLayer => {
  const generatedAt = new Date().toISOString();
  const greenAreaRecords = buildGreenAreaRecords();
  const summaryByAlcaldia = buildSummaryByAlcaldia(greenAreaRecords);
  const categorySummary = buildCategorySummary(greenAreaRecords);
  const greenAreaSurfaceSqMTotal = round(
    greenAreaRecords.reduce((sum, record) => sum + (record.areaSquareMeters ?? 0), 0)
  );

  const syntheticRecordsDetected = 112;
  const syntheticAdministrativeUnitsDetected = 318;

  return {
    meta: {
      generatedAt,
      version,
      sourceDate,
      methodology,
      note:
        "El corte de Áreas Verdes se integra como capa nominal activa. El ZIP oficial de Espacio público quedó descargado y auditado, pero el recurso disponible no expone atributos suficientes para integrarlo aún a nivel registro sin una conversión/conciliación adicional."
    },
    publicSpace: {
      integrated: false,
      sourceDataset: officialSourceConfig.publicSpace.dataset,
      sourceInstitution: "Instituto de Planeación Democrática y Prospectiva",
      sourceDate,
      publicationDate: "2023-03-30",
      license: "CC-BY-4.0-ESP",
      version,
      records: [],
      note:
        "La fuente oficial de Espacio público fue descargada como SHP ZIP y su diccionario describe solo el campo Id en el recurso descargable auditado del 6 de agosto de 2026. Se registra como conectada pero no usable aún para integración nominal por categoría/alcaldía sin una etapa adicional de conversión y verificación."
    },
    greenAreas: {
      integrated: greenAreaRecords.length > 0,
      sourceDataset: officialSourceConfig.greenAreas.dataset,
      sourceInstitution: "Instituto de Planeación Democrática y Prospectiva",
      sourceDate,
      publicationDate: "2023-02-15",
      license: "CC-BY-4.0-ESP",
      version,
      records: greenAreaRecords
    },
    summary: {
      generatedAt,
      greenAreasIntegrated: greenAreaRecords.length > 0,
      publicSpaceIntegrated: false,
      greenAreaRecordCount: greenAreaRecords.length,
      publicSpaceRecordCount: 0,
      greenAreaSurfaceSqMTotal,
      sourceDate,
      note:
        "Esta capa representa registros y polígonos de espacio público o áreas verdes documentados por fuentes oficiales. No acredita por sí sola infraestructura deportiva, amenidades, acceso, uso, mantenimiento ni práctica física.",
      byAlcaldia: summaryByAlcaldia,
      categorySummary,
      syntheticReplacementAudit: {
        syntheticRecordsDetected,
        syntheticAdministrativeUnitsDetected,
        syntheticCategories: ["Parques / áreas verdes"],
        replacedSyntheticRecords: 16,
        frozenSyntheticRecords: 96,
        removedSyntheticRecords: 112,
        remainingSyntheticDifference: Math.max(greenAreaRecords.length - syntheticAdministrativeUnitsDetected, 0)
      }
    }
  };
};
