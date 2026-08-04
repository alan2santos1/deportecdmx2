export type DenueOwnershipScope = "privado" | "publico_mixto";

export type DenueTargetCategory =
  | "gimnasio_privado"
  | "club_deportivo_privado"
  | "escuela_deportiva_privada"
  | "club_deportivo_mixto"
  | "infraestructura_acuatica"
  | "escuela_deportiva_mixta"
  | "otros_deportivos";

export type DenueDashboardCategory =
  | "Gimnasio privado"
  | "Club deportivo privado"
  | "Academia deportiva privada"
  | "Otros deportivos";

export type DenueNormalizedRecord = {
  id: string;
  nombre: string;
  alcaldia: string | null;
  geoKey: string | null;
  scianCode: string;
  scianLabel: string;
  category: DenueTargetCategory;
  dashboardCategory: DenueDashboardCategory | null;
  ownershipScope: DenueOwnershipScope;
  source: "DENUE";
  dataType: "real";
  methodologicalNote: string;
};

type DenueScianDefinition = {
  category: DenueTargetCategory;
  label: string;
  ownershipScope: DenueOwnershipScope;
  dashboardCategory: DenueDashboardCategory | null;
};

const scianCategoryMap: Record<string, DenueScianDefinition> = {
  "713941": {
    category: "club_deportivo_privado",
    label: "Clubes deportivos del sector privado",
    ownershipScope: "privado",
    dashboardCategory: "Club deportivo privado"
  },
  "713942": {
    category: "club_deportivo_mixto",
    label: "Clubes deportivos del sector público o mixto",
    ownershipScope: "publico_mixto",
    dashboardCategory: null
  },
  "713943": {
    category: "gimnasio_privado",
    label: "Centros de acondicionamiento físico del sector privado",
    ownershipScope: "privado",
    dashboardCategory: "Gimnasio privado"
  },
  "713944": {
    category: "infraestructura_acuatica",
    label: "Infraestructura acuática o balnearios del sector público o mixto",
    ownershipScope: "publico_mixto",
    dashboardCategory: null
  },
  "611621": {
    category: "escuela_deportiva_privada",
    label: "Escuelas de deporte del sector privado",
    ownershipScope: "privado",
    dashboardCategory: "Academia deportiva privada"
  },
  "611622": {
    category: "escuela_deportiva_mixta",
    label: "Escuelas de deporte del sector público o mixto",
    ownershipScope: "publico_mixto",
    dashboardCategory: null
  }
};

export const denueScianFieldCandidates = [
  "codigo_act",
  "codigo_actividad",
  "codigo_scian",
  "scian",
  "cod_scian",
  "codigo"
] as const;

const normalizeGeoKey = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || null;

export const supportedDenueScianCodes = Object.keys(scianCategoryMap);

export const extractDenueScianCode = (properties: Record<string, string | null | undefined>) => {
  for (const field of denueScianFieldCandidates) {
    const value = properties[field];
    if (value && supportedDenueScianCodes.includes(value.trim())) {
      return value.trim();
    }
  }
  return null;
};

export const getDenueScianDefinition = (scianCode: string) => {
  return scianCategoryMap[scianCode] ?? null;
};

export const getDashboardCategoryFromScian = (scianCode: string) => {
  return getDenueScianDefinition(scianCode)?.dashboardCategory ?? null;
};

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
    scianLabel: match.label,
    category: match.category,
    dashboardCategory: match.dashboardCategory,
    ownershipScope: match.ownershipScope,
    source: "DENUE",
    dataType: "real",
    methodologicalNote: `Registro DENUE clasificado únicamente por SCIAN ${scianCode} (${match.label}). No se infieren disciplinas, amenidades, capacidad ni usuarios.`
  };
};
