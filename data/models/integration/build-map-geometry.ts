import fs from "fs";
import path from "path";
import type { MapGeometryFeature } from "../../../lib/dashboard-types";
import { normalizeAlcaldia } from "./normalize-alcaldia";

type Position = [number, number];

const getGeometryCoordinates = (geometry: { type: string; coordinates: any }): Position[] => {
  const positions: Position[] = [];
  const visit = (value: any) => {
    if (!Array.isArray(value)) return;
    if (typeof value[0] === "number" && typeof value[1] === "number") {
      positions.push([value[0], value[1]]);
      return;
    }
    value.forEach(visit);
  };
  visit(geometry.coordinates);
  return positions;
};

const buildGeometryPath = (
  geometry: { type: string; coordinates: any },
  project: (position: Position) => [number, number]
) => {
  const polygonGroups =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];

  return polygonGroups
    .flatMap((polygon: any) =>
      polygon.map((ring: any) => {
        const commands = ring.map((position: Position, index: number) => {
          const [x, y] = project(position);
          return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
        });
        return `${commands.join(" ")} Z`;
      })
    )
    .join(" ");
};

export const buildMapGeometry = (): MapGeometryFeature[] => {
  const filePath = path.join(process.cwd(), "data", "raw", "external", "alcaldias.geojson");
  if (!fs.existsSync(filePath)) return [];

  const geojson = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    features: Array<{ properties: Record<string, string>; geometry: { type: string; coordinates: any } }>;
  };

  const allPositions = geojson.features.flatMap((feature) => getGeometryCoordinates(feature.geometry));
  if (allPositions.length === 0) return [];

  const lons = allPositions.map((position) => position[0]);
  const lats = allPositions.map((position) => position[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const width = 900;
  const height = 660;
  const padding = 24;

  const project = ([lon, lat]: Position): [number, number] => {
    const x = padding + ((lon - minLon) / (maxLon - minLon)) * (width - padding * 2);
    const y = padding + ((maxLat - lat) / (maxLat - minLat)) * (height - padding * 2);
    return [x, y];
  };

  return geojson.features.map((feature) => {
    const normalized = normalizeAlcaldia(feature.properties.NOMGEO);
    return {
      geoKey: normalized.geoKey,
      alcaldia: normalized.alcaldia,
      path: buildGeometryPath(feature.geometry, project)
    };
  });
};
