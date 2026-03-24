import type { RowRecord } from "./types";
import { normalizeKey } from "./utils";

export type AgeBucketKey = "18-25" | "26-35" | "36-45" | "46-55" | "56+_SIN_DATO";

export type AgeDistributionBucket = {
  key: AgeBucketKey;
  label: string;
  count: number;
  pctOfAgeApplicable: number;
  bySex: {
    female: { count: number; pctOfAgeApplicable: number };
    male: { count: number; pctOfAgeApplicable: number };
  };
  meta?: {
    breakdown?: {
      count56PlusReal: number;
      countMissingAge: number;
    };
    notes?: string;
  };
};

export type AgeDistributionBlock = {
  filters: Record<string, unknown>;
  totals: { totalFiltered: number };
  applicableDenominators: { ageApplicable: number };
  displayBuckets: AgeDistributionBucket[];
};

const normalizeSex = (value: string) => {
  const key = normalizeKey(value);
  if (["f", "femenino", "mujer", "female"].includes(key)) return "female";
  if (["m", "masculino", "hombre", "male"].includes(key)) return "male";
  return null;
};

const parseAgeValue = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const getAgeBucket = (age: number | null) => {
  if (age === null) return "SIN_DATO_EDAD";
  if (age >= 18 && age <= 25) return "18-25";
  if (age >= 26 && age <= 35) return "26-35";
  if (age >= 36 && age <= 45) return "36-45";
  if (age >= 46 && age <= 55) return "46-55";
  if (age >= 56) return "56+";
  return "SIN_DATO_EDAD";
};

export const buildAgeDistributionBlock = ({
  rows,
  ageColumn,
  sexColumn,
  filters = {}
}: {
  rows: RowRecord[];
  ageColumn: string;
  sexColumn?: string;
  filters?: Record<string, unknown>;
}): AgeDistributionBlock => {
  const totals = {
    totalFiltered: rows.length
  };

  const ageApplicableRows = rows.filter((row) => parseAgeValue(row[ageColumn]) !== null);
  const ageApplicable = ageApplicableRows.length;

  const bucketCounts: Record<string, number> = {
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "56+": 0,
    SIN_DATO_EDAD: 0
  };

  const bySexCounts: Record<string, { female: number; male: number }> = {
    "18-25": { female: 0, male: 0 },
    "26-35": { female: 0, male: 0 },
    "36-45": { female: 0, male: 0 },
    "46-55": { female: 0, male: 0 },
    "56+": { female: 0, male: 0 },
    SIN_DATO_EDAD: { female: 0, male: 0 }
  };

  rows.forEach((row) => {
    const age = parseAgeValue(row[ageColumn]);
    const bucket = getAgeBucket(age);
    bucketCounts[bucket] += 1;

    if (sexColumn) {
      const sex = normalizeSex(row[sexColumn] ?? "");
      if (sex) {
        bySexCounts[bucket][sex] += 1;
      }
    }
  });

  const pct = (count: number) => (ageApplicable > 0 ? count / ageApplicable : 0);

  const bucket56Plus = bucketCounts["56+"];
  const bucketMissing = bucketCounts.SIN_DATO_EDAD;
  const combinedLast = bucket56Plus + bucketMissing;

  const buildBucket = (key: "18-25" | "26-35" | "36-45" | "46-55") => ({
    key,
    label: key,
    count: bucketCounts[key],
    pctOfAgeApplicable: pct(bucketCounts[key]),
    bySex: {
      female: { count: bySexCounts[key].female, pctOfAgeApplicable: pct(bySexCounts[key].female) },
      male: { count: bySexCounts[key].male, pctOfAgeApplicable: pct(bySexCounts[key].male) }
    }
  });

  const lastBucket: AgeDistributionBucket = {
    key: "56+_SIN_DATO",
    label: "56+ / Sin dato de edad",
    count: combinedLast,
    pctOfAgeApplicable: pct(combinedLast),
    bySex: {
      female: {
        count: bySexCounts["56+"].female + bySexCounts.SIN_DATO_EDAD.female,
        pctOfAgeApplicable: pct(bySexCounts["56+"].female + bySexCounts.SIN_DATO_EDAD.female)
      },
      male: {
        count: bySexCounts["56+"].male + bySexCounts.SIN_DATO_EDAD.male,
        pctOfAgeApplicable: pct(bySexCounts["56+"].male + bySexCounts.SIN_DATO_EDAD.male)
      }
    },
    meta: {
      breakdown: {
        count56PlusReal: bucket56Plus,
        countMissingAge: bucketMissing
      },
      notes:
        "El bucket final agrupa 56+ real y registros sin edad capturada. Los porcentajes por edad usan ageApplicable (edad numérica)."
    }
  };

  return {
    filters,
    totals,
    applicableDenominators: { ageApplicable },
    displayBuckets: [
      buildBucket("18-25"),
      buildBucket("26-35"),
      buildBucket("36-45"),
      buildBucket("46-55"),
      lastBucket
    ]
  };
};
