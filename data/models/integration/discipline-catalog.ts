const normalizeKey = (value: string | null | undefined) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

type DisciplineDictionaryEntry = {
  canonical: string;
  category: string;
  subcategory?: string;
  aliases: string[];
};

const disciplineDictionary: DisciplineDictionaryEntry[] = [
  {
    canonical: "Acondicionamiento físico",
    category: "Acondicionamiento / bienestar",
    aliases: ["acondicionamiento fisico", "acondicionamiento físico", "fitness", "gimnasio", "calistenia"]
  },
  {
    canonical: "Activación física",
    category: "Activación / bienestar",
    aliases: ["activacion fisica", "activación física"]
  },
  {
    canonical: "Aerobics",
    category: "Aeróbicos y cardio grupal",
    aliases: ["aerobics", "aeróbics", "aerobicos", "aeróbicos"]
  },
  {
    canonical: "Aerobics con step",
    category: "Aeróbicos y cardio grupal",
    aliases: ["aerobics step", "aerobics (step)", "aerobics (step, baquetas, barra, gap, etc)"]
  },
  {
    canonical: "Baile aeróbico",
    category: "Aeróbicos y cardio grupal",
    aliases: ["baile aerobico", "baile aeróbico"]
  },
  {
    canonical: "Atletismo",
    category: "Atletismo",
    aliases: ["atletismo"]
  },
  {
    canonical: "Atletismo — carrera",
    category: "Atletismo",
    subcategory: "Carrera",
    aliases: ["atletismo (carrera)", "atletismo(carrera)"]
  },
  {
    canonical: "Básquetbol",
    category: "Deportes con pelota",
    aliases: ["basquet", "básquet", "basket", "basquetbol", "básquetbol"]
  },
  {
    canonical: "Box",
    category: "Combate",
    aliases: ["box", "boxeo"]
  },
  {
    canonical: "Ciclismo",
    category: "Resistencia y rueda",
    aliases: ["ciclismo"]
  },
  {
    canonical: "Fútbol",
    category: "Deportes con pelota",
    aliases: ["futbol", "fútbol"]
  },
  {
    canonical: "Natación",
    category: "Acuáticos",
    aliases: ["natacion", "natación"]
  },
  {
    canonical: "Running / carrera recreativa",
    category: "Resistencia y movilidad",
    aliases: ["running", "carrera recreativa", "trote", "jogging"]
  },
  {
    canonical: "Caminata",
    category: "Resistencia y movilidad",
    aliases: ["caminata"]
  },
  {
    canonical: "Tae Kwon Do",
    category: "Combate",
    aliases: ["tae kwon do", "taekwondo"]
  },
  {
    canonical: "Voleibol",
    category: "Deportes con pelota",
    aliases: ["voleibol", "volibol", "volleyball"]
  },
  {
    canonical: "Yoga / pilates",
    category: "Acondicionamiento / bienestar",
    aliases: ["yoga", "pilates"]
  }
];

const aliasLookup = new Map<string, DisciplineDictionaryEntry>();

disciplineDictionary.forEach((entry) => {
  aliasLookup.set(normalizeKey(entry.canonical), entry);
  entry.aliases.forEach((alias) => aliasLookup.set(normalizeKey(alias), entry));
});

export type NormalizedDiscipline = {
  original: string | null;
  normalized: string | null;
  category: string | null;
  subcategory: string | null;
  normalizationTrace: string;
};

export const normalizeDiscipline = (value: string | null | undefined): NormalizedDiscipline => {
  const original = value?.trim() || null;
  const key = normalizeKey(value);
  if (!key) {
    return {
      original,
      normalized: null,
      category: null,
      subcategory: null,
      normalizationTrace: "sin_valor"
    };
  }

  const direct = aliasLookup.get(key);
  if (direct) {
    return {
      original,
      normalized: direct.canonical,
      category: direct.category,
      subcategory: direct.subcategory ?? null,
      normalizationTrace: `diccionario:${key}->${normalizeKey(direct.canonical)}`
    };
  }

  return {
    original,
    normalized: original,
    category: "No clasificada",
    subcategory: null,
    normalizationTrace: "sin_homologacion"
  };
};

export const getDisciplineCatalog = () =>
  disciplineDictionary.map((entry) => ({
    id: normalizeKey(entry.canonical).replace(/\s+/g, "-"),
    canonical: entry.canonical,
    category: entry.category,
    subcategory: entry.subcategory ?? null,
    aliases: entry.aliases
  }));
