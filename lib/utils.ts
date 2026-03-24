export const normalizeKey = (value: string) => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
};

export const normalizeText = (value: string) => value.toString().trim();

export const isEmptyValue = (value: unknown) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
};

export const toNumber = (value: unknown) => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[%,$]/g, "").trim();
    if (cleaned === "") return null;
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

export const uniq = <T,>(items: T[]) => Array.from(new Set(items));

export const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const formatNumber = (value: number) => value.toLocaleString("en-US");

export const truthyValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["1", "true", "si", "yes", "y", "aplica"].includes(normalized);
  }
  return false;
};
