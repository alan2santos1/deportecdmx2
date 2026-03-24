const growthFactors: Record<number, number> = {
  2022: 1,
  2024: 1.01,
  2025: 1.015,
  2026: 1.02
};

export const projectPopulation = (population2020: number, year: number) => {
  return Math.round(population2020 * (growthFactors[year] ?? 1));
};
