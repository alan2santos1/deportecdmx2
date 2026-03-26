import fs from "fs";
import path from "path";
import { dashboardSeed } from "../data";
import { buildCanchasOperativasLayer } from "../data/models/integration/build-canchas-operativas";
import { buildOfficialInfrastructureLayer } from "../data/models/integration/build-official-infrastructure";

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

const run = () => {
  const officialInfrastructure = buildOfficialInfrastructureLayer();
  const canchasLayer = buildCanchasOperativasLayer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.dirname(processedInfrastructurePath), { recursive: true });
  fs.mkdirSync(path.dirname(processedCanchasPath), { recursive: true });
  fs.writeFileSync(processedInfrastructurePath, JSON.stringify(officialInfrastructure, null, 2), "utf-8");
  fs.writeFileSync(processedCanchasPath, JSON.stringify(canchasLayer, null, 2), "utf-8");
  fs.writeFileSync(outputPath, JSON.stringify(dashboardSeed, null, 2), "utf-8");
  console.log(`[data:build] Generated ${processedInfrastructurePath}`);
  console.log(`[data:build] Generated ${processedCanchasPath}`);
  console.log(`[data:build] Generated ${outputPath}`);
};

run();
