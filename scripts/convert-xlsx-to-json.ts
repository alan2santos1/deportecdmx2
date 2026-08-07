import fs from "fs";
import path from "path";
import { dashboardSeed } from "../data";
import { buildCanchasOperativasLayer } from "../data/models/integration/build-canchas-operativas";
import { buildDenuePrivateVerifiedLayer } from "../data/models/integration/build-denue-private-verified";
import { buildOfficialInfrastructureLayer } from "../data/models/integration/build-official-infrastructure";
import { buildOperacionAsistenciaLayer } from "../data/models/integration/build-operacion-asistencia";
import { buildPublicSpaceLayer } from "../data/models/integration/build-public-space-layer";
import { buildUtopiasLayer } from "../data/models/integration/build-utopias-layer";

const outputDir = path.join(process.cwd(), "public", "data");
const outputPath = path.join(outputDir, "dashboard.json");
const processedInfrastructurePath = path.join(
  process.cwd(),
  "data",
  "processed",
  "infrastructure",
  "official-infrastructure.json"
);
const processedCanchasPath = path.join(
  process.cwd(),
  "data",
  "processed",
  "canchas",
  "canchas-operativas.json"
);
const processedOperacionPath = path.join(
  process.cwd(),
  "data",
  "processed",
  "operacion",
  "operacion-asistencia.json"
);
const processedDenuePath = path.join(
  process.cwd(),
  "data",
  "processed",
  "infrastructure",
  "denue-private-verified.json"
);
const processedPublicSpacePath = path.join(
  process.cwd(),
  "data",
  "processed",
  "infrastructure",
  "public-space.json"
);
const processedUtopiasPath = path.join(
  process.cwd(),
  "data",
  "processed",
  "infrastructure",
  "utopias.json"
);
const publicOperacionPath = path.join(outputDir, "operacion-asistencia.json");
const publicPublicSpacePath = path.join(outputDir, "public-space.json");
const publicUtopiasPath = path.join(outputDir, "utopias.json");

const run = () => {
  const officialInfrastructure = buildOfficialInfrastructureLayer();
  const canchasLayer = buildCanchasOperativasLayer();
  const operacionLayer = buildOperacionAsistenciaLayer();
  const denuePrivateLayer = buildDenuePrivateVerifiedLayer();
  const publicSpaceLayer = buildPublicSpaceLayer();
  const utopiasLayer = buildUtopiasLayer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.dirname(processedInfrastructurePath), { recursive: true });
  fs.mkdirSync(path.dirname(processedCanchasPath), { recursive: true });
  fs.mkdirSync(path.dirname(processedOperacionPath), { recursive: true });
  fs.writeFileSync(processedInfrastructurePath, JSON.stringify(officialInfrastructure, null, 2), "utf-8");
  fs.writeFileSync(processedCanchasPath, JSON.stringify(canchasLayer, null, 2), "utf-8");
  fs.writeFileSync(processedOperacionPath, JSON.stringify(operacionLayer, null, 2), "utf-8");
  fs.writeFileSync(processedDenuePath, JSON.stringify(denuePrivateLayer, null, 2), "utf-8");
  fs.writeFileSync(processedPublicSpacePath, JSON.stringify(publicSpaceLayer, null, 2), "utf-8");
  fs.writeFileSync(processedUtopiasPath, JSON.stringify(utopiasLayer, null, 2), "utf-8");
  fs.writeFileSync(publicOperacionPath, JSON.stringify(operacionLayer, null, 2), "utf-8");
  fs.writeFileSync(publicPublicSpacePath, JSON.stringify(publicSpaceLayer, null, 2), "utf-8");
  fs.writeFileSync(publicUtopiasPath, JSON.stringify(utopiasLayer, null, 2), "utf-8");
  fs.writeFileSync(outputPath, JSON.stringify(dashboardSeed, null, 2), "utf-8");
  console.log(`[data:build] Generated ${processedInfrastructurePath}`);
  console.log(`[data:build] Generated ${processedCanchasPath}`);
  console.log(`[data:build] Generated ${processedOperacionPath}`);
  console.log(`[data:build] Generated ${processedDenuePath}`);
  console.log(`[data:build] Generated ${processedPublicSpacePath}`);
  console.log(`[data:build] Generated ${processedUtopiasPath}`);
  console.log(`[data:build] Generated ${publicOperacionPath}`);
  console.log(`[data:build] Generated ${publicPublicSpacePath}`);
  console.log(`[data:build] Generated ${publicUtopiasPath}`);
  console.log(`[data:build] Generated ${outputPath}`);
};

run();
