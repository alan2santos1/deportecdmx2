import type { RowRecord, SemanticFields } from "./types";
import { normalizeText } from "./utils";

const normalizeSexoValue = (value: string) => {
  const upper = normalizeText(value).toUpperCase();
  if (["M", "HOMBRE", "MASCULINO", "MALE"].includes(upper)) return "Hombres";
  if (["F", "MUJER", "FEMENINO", "FEMALE"].includes(upper)) return "Mujeres";
  return normalizeText(value);
};

const normalizeAgeGroupValue = (value: string) => {
  const cleaned = normalizeText(value).replace(/\s+/g, " ");
  const key = cleaned.toLowerCase();
  if (["12-17", "12 a 17", "12 a17", "12-17 anos", "12-17 años"].includes(key)) return "12-17";
  if (["18-29", "18 a 29", "18-29 anos", "18-29 años"].includes(key)) return "18-29";
  if (["30-44", "30 a 44", "30-44 anos", "30-44 años"].includes(key)) return "30-44";
  if (["45-59", "45 a 59", "45-59 anos", "45-59 años"].includes(key)) return "45-59";
  if (["60+", "60 y mas", "60 y más", "60 o mas", "60 o más"].includes(key)) return "60+";
  return cleaned;
};

const normalizeAlcaldiaValue = (value: string) => {
  return normalizeText(value)
    .replace(/\s+/g, " ")
    .replace(/\bCdmx\b/i, "CDMX");
};

export const normalizeBaseModelada = (rows: RowRecord[], semantic: SemanticFields) => {
  return rows.map((row) => {
    const next: RowRecord = {};
    Object.entries(row).forEach(([key, value]) => {
      const cleaned = normalizeText(value ?? "");
      if (semantic.sexo && key === semantic.sexo) {
        next[key] = normalizeSexoValue(cleaned);
        return;
      }
      if (semantic.grupoEdad && key === semantic.grupoEdad) {
        next[key] = normalizeAgeGroupValue(cleaned);
        return;
      }
      if (semantic.alcaldia && key === semantic.alcaldia) {
        next[key] = normalizeAlcaldiaValue(cleaned);
        return;
      }
      next[key] = cleaned;
    });
    return next;
  });
};
