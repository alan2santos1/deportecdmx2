import fs from "fs";
import path from "path";
import { dashboardSeed } from "../data";
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

const run = () => {
  const officialInfrastructure = buildOfficialInfrastructureLayer();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.dirname(processedInfrastructurePath), { recursive: true });
  fs.writeFileSync(processedInfrastructurePath, JSON.stringify(officialInfrastructure, null, 2), "utf-8");
  fs.writeFileSync(outputPath, JSON.stringify(dashboardSeed, null, 2), "utf-8");
  console.log(`[data:build] Generated ${processedInfrastructurePath}`);
  console.log(`[data:build] Generated ${outputPath}`);
};

run();
