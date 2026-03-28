export type DenueTargetCategory =
  | "gimnasio_privado"
  | "club_deportivo_privado"
  | "escuela_deportiva_privada"
  | "club_deportivo_mixto"
  | "infraestructura_acuatica"
  | "escuela_deportiva_mixta";

export type DenueNormalizedRecord = {
  id: string;
  nombre: string;
  alcaldia: string | null;
  geoKey: string | null;
  scianCode: string;
  category: DenueTargetCategory;
  source: "DENUE";
  dataType: "real";
  methodologicalNote: string;
};

const scianCategoryMap: Record<string, { category: DenueTargetCategory; label: string }> = {
  "713941": { category: "club_deportivo_privado", label: "Club deportivo privado" },
  "713942": { category: "club_deportivo_mixto", label: "Club deportivo público o mixto" },
  "713943": { category: "gimnasio_privado", label: "Gimnasio privado" },
  "713944": { category: "infraestructura_acuatica", label: "Instalación acuática o balneario" },
  "611621": { category: "escuela_deportiva_privada", label: "Escuela deportiva privada" },
  "611622": { category: "escuela_deportiva_mixta", label: "Escuela deportiva pública o mixta" }
};

const normalizeGeoKey = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || null;

export const supportedDenueScianCodes = Object.keys(scianCategoryMap);

export const normalizeDenueRecord = (input: {
  id: string;
  nombre: string;
  alcaldia?: string | null;
  scianCode?: string | null;
}): DenueNormalizedRecord | null => {
  const scianCode = (input.scianCode ?? "").trim();
  const match = scianCategoryMap[scianCode];
  if (!match) return null;

  return {
    id: input.id,
    nombre: input.nombre.trim() || input.id,
    alcaldia: input.alcaldia?.trim() || null,
    geoKey: normalizeGeoKey(input.alcaldia),
    scianCode,
    category: match.category,
    source: "DENUE",
    dataType: "real",
    methodologicalNote: `Estructura preparada para integrar DENUE por SCIAN verificable. Este registro se clasifica como ${match.label} sin inferir disciplinas ni amenidades.`
  };
};

