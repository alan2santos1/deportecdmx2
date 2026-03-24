import fs from "fs";
import path from "path";
import https from "https";
import { officialSourceConfig } from "../../data/models/integration/official-source-config";

const ensureDir = (filePath: string) => {
  fs.mkdirSync(path.dirname(path.join(process.cwd(), filePath)), { recursive: true });
};

const download = (url: string, destination: string) =>
  new Promise<void>((resolve, reject) => {
    const absolute = path.join(process.cwd(), destination);
    ensureDir(destination);
    const file = fs.createWriteStream(absolute);
    https
      .get(url, (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", reject);
  });

const run = async () => {
  await download(officialSourceConfig.pilares.url, officialSourceConfig.pilares.localPath);
  await download(officialSourceConfig.publicSports.url, officialSourceConfig.publicSports.localPath);
  console.log("Descargadas fuentes oficiales locales para PILARES y deportivos públicos.");
  console.log("DENUE y geometría se mantienen preparados por configuración:");
  console.log(JSON.stringify({ denue: officialSourceConfig.denue, geometry: officialSourceConfig.geometry }, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
