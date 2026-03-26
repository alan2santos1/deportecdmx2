const geoKeyMap: Record<string, string> = {
  "alvaro obregon": "alvaro-obregon",
  "azcapotzalco": "azcapotzalco",
  "benito juarez": "benito-juarez",
  "coyoacan": "coyoacan",
  "cuajimalpa de morelos": "cuajimalpa",
  "cuajimalpa": "cuajimalpa",
  "cuauhtemoc": "cuauhtemoc",
  "gustavo a madero": "gustavo-a-madero",
  "iztacalco": "iztacalco",
  "iztapalapa": "iztapalapa",
  "la magdalena contreras": "la-magdalena-contreras",
  "magdalena contreras": "la-magdalena-contreras",
  "m contreras": "la-magdalena-contreras",
  "miguel hidalgo": "miguel-hidalgo",
  "milpa alta": "milpa-alta",
  "tlahuac": "tlahuac",
  "tlalpan": "tlalpan",
  "venustiano carranza": "venustiano-carranza",
  "v carranza": "venustiano-carranza",
  "xochimilco": "xochimilco"
};

const displayNameMap: Record<string, string> = {
  "alvaro obregon": "Álvaro Obregón",
  "azcapotzalco": "Azcapotzalco",
  "benito juarez": "Benito Juárez",
  "coyoacan": "Coyoacán",
  "cuajimalpa de morelos": "Cuajimalpa",
  "cuajimalpa": "Cuajimalpa",
  "cuauhtemoc": "Cuauhtémoc",
  "gustavo a madero": "Gustavo A. Madero",
  "iztacalco": "Iztacalco",
  "iztapalapa": "Iztapalapa",
  "la magdalena contreras": "La Magdalena Contreras",
  "magdalena contreras": "La Magdalena Contreras",
  "m contreras": "La Magdalena Contreras",
  "miguel hidalgo": "Miguel Hidalgo",
  "milpa alta": "Milpa Alta",
  "tlahuac": "Tláhuac",
  "tlalpan": "Tlalpan",
  "venustiano carranza": "Venustiano Carranza",
  "v carranza": "Venustiano Carranza",
  "xochimilco": "Xochimilco"
};

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const normalizeAlcaldia = (value: string | null | undefined) => {
  const original = (value ?? "").trim();
  const key = normalizeKey(original);
  const alcaldia = displayNameMap[key] ?? original;
  const geoKey = geoKeyMap[key] ?? normalizeKey(alcaldia).replace(/\s+/g, "-");
  return {
    original,
    alcaldia,
    geoKey,
    matched: Boolean(displayNameMap[key])
  };
};
