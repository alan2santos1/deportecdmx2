export const yearSeeds = [
  { year: 2020, overallActivityRate: 0.372, womenRate: 0.338, menRate: 0.408, type: "preparado" as const },
  { year: 2021, overallActivityRate: 0.381, womenRate: 0.347, menRate: 0.418, type: "preparado" as const },
  { year: 2022, overallActivityRate: 0.389, womenRate: 0.352, menRate: 0.425, type: "preparado" as const },
  { year: 2023, overallActivityRate: 0.397, womenRate: 0.36, menRate: 0.435, type: "preparado" as const },
  { year: 2024, overallActivityRate: 0.411, womenRate: 0.368, menRate: 0.46, type: "estimado" as const },
  { year: 2025, overallActivityRate: 0.445, womenRate: 0.407, menRate: 0.491, type: "estimado" as const },
  { year: 2026, overallActivityRate: 0.453, womenRate: 0.416, menRate: 0.499, type: "proyectado" as const }
] as const;

export const ageSeeds = [
  { ageGroup: "12-17", share: 0.12, activityRate: 0.527, obesityMultiplier: 0.58, overweightMultiplier: 0.72, diabetesMultiplier: 0.2 },
  { ageGroup: "18-29", share: 0.24, activityRate: 0.468, obesityMultiplier: 0.82, overweightMultiplier: 0.9, diabetesMultiplier: 0.42 },
  { ageGroup: "30-44", share: 0.27, activityRate: 0.426, obesityMultiplier: 1.0, overweightMultiplier: 1.0, diabetesMultiplier: 0.82 },
  { ageGroup: "45-59", share: 0.22, activityRate: 0.398, obesityMultiplier: 1.14, overweightMultiplier: 1.08, diabetesMultiplier: 1.25 },
  { ageGroup: "60+", share: 0.15, activityRate: 0.376, obesityMultiplier: 1.08, overweightMultiplier: 0.96, diabetesMultiplier: 2.02 }
] as const;

export const sexSeeds = [
  { sex: "Hombres" as const, share: 0.48, activityRate2025: 0.491, obesityMultiplier: 0.9, overweightMultiplier: 1.08, diabetesMultiplier: 0.95 },
  { sex: "Mujeres" as const, share: 0.52, activityRate2025: 0.407, obesityMultiplier: 1.1, overweightMultiplier: 0.94, diabetesMultiplier: 1.04 }
] as const;

export const sportSeeds = [
  { sport: "Fútbol", weight: 0.22, menBoost: 1.25, womenBoost: 0.76, ageBoost: { "12-17": 1.25, "18-29": 1.1, "30-44": 0.9, "45-59": 0.72, "60+": 0.45 } },
  { sport: "Running / caminata", weight: 0.18, menBoost: 0.98, womenBoost: 1.02, ageBoost: { "12-17": 0.78, "18-29": 0.94, "30-44": 1.0, "45-59": 1.12, "60+": 1.2 } },
  { sport: "Gimnasio / acondicionamiento", weight: 0.15, menBoost: 0.98, womenBoost: 1.04, ageBoost: { "12-17": 0.58, "18-29": 1.1, "30-44": 1.18, "45-59": 1.0, "60+": 0.66 } },
  { sport: "Ciclismo", weight: 0.11, menBoost: 1.12, womenBoost: 0.88, ageBoost: { "12-17": 0.82, "18-29": 1.08, "30-44": 1.04, "45-59": 1.0, "60+": 0.8 } },
  { sport: "Basquetbol", weight: 0.09, menBoost: 1.16, womenBoost: 0.82, ageBoost: { "12-17": 1.22, "18-29": 1.08, "30-44": 0.82, "45-59": 0.54, "60+": 0.28 } },
  { sport: "Natación", weight: 0.07, menBoost: 0.98, womenBoost: 1.02, ageBoost: { "12-17": 0.88, "18-29": 0.96, "30-44": 1.0, "45-59": 1.06, "60+": 1.12 } },
  { sport: "Clases grupales", weight: 0.07, menBoost: 0.72, womenBoost: 1.26, ageBoost: { "12-17": 0.62, "18-29": 0.9, "30-44": 1.06, "45-59": 1.14, "60+": 1.0 } },
  { sport: "Box / artes marciales", weight: 0.05, menBoost: 1.18, womenBoost: 0.72, ageBoost: { "12-17": 1.1, "18-29": 1.16, "30-44": 0.92, "45-59": 0.62, "60+": 0.24 } },
  { sport: "Yoga / pilates", weight: 0.04, menBoost: 0.52, womenBoost: 1.44, ageBoost: { "12-17": 0.32, "18-29": 0.72, "30-44": 1.0, "45-59": 1.26, "60+": 1.3 } },
  { sport: "Volibol", weight: 0.02, menBoost: 0.92, womenBoost: 1.08, ageBoost: { "12-17": 1.0, "18-29": 1.0, "30-44": 0.88, "45-59": 0.64, "60+": 0.32 } }
] as const;

export const barrierHighlights = [
  { label: "Falta de tiempo", share: 0.521 },
  { label: "Problemas de salud", share: 0.179 },
  { label: "Cansancio por el trabajo", share: 0.152 }
] as const;

export const methodologyBreaks = [
  "MOPRADEF 2025 cambió cobertura y estructura metodológica; la serie 2024 vs 2025 no debe leerse como tendencia pura sin nota de quiebre.",
  "ENSANUT 2022 es la base de salud; cualquier territorialización por alcaldía es estimada y no una publicación oficial directa."
];

export const timelineNotes = [
  "2020-2023 se muestran como preparación retrospectiva para soporte de serie y comparabilidad operativa.",
  "2024-2025 son los años base de actividad física del MVP institucional.",
  "2026 se presenta como proyección de planeación y debe etiquetarse siempre como proyectado."
];
