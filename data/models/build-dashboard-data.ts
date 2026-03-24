import type {
  DashboardDataset,
  HealthProfileRecord,
  InfrastructureDetailRecord,
  MapAreaRecord,
  SportsRecord,
  TerritorialRecord
} from "../../lib/dashboard-types";
import { alcaldiasSeed } from "../raw/alcaldias";
import { ageSeeds, methodologyBreaks, sexSeeds, sportSeeds, timelineNotes, yearSeeds } from "../raw/official-benchmarks";
import { executiveInsights, methodologyEntries, qualityChecks, sourceRegistry } from "../insights/notes";
import { buildOfficialInfrastructureLayer } from "./integration/build-official-infrastructure";
import { buildMapGeometry } from "./integration/build-map-geometry";
import { projectPopulation } from "../processed/population";

const round = (value: number) => Math.round(value);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const weightedCoveragePer100k = (record: {
  population2020: number;
  publicSportsCenters: number;
  pilares: number;
  privateGyms: number;
  parks: number;
  privateAccessPenalty: number;
}) => {
  const weighted =
    record.publicSportsCenters * 1 +
    record.pilares * 0.45 +
    record.privateGyms * (0.55 / record.privateAccessPenalty) +
    record.parks * 0.65;
  return (weighted / record.population2020) * 100000;
};

const meanCoverage =
  alcaldiasSeed.reduce((sum, item) => sum + weightedCoveragePer100k(item), 0) / alcaldiasSeed.length;

const inferDominantInfraType = (item: typeof alcaldiasSeed[number]): TerritorialRecord["dominantInfraType"] => {
  const maxValue = Math.max(item.publicSportsCenters, item.pilares, item.privateGyms, item.parks);
  if (item.publicSportsCenters === maxValue) return "Deportivos públicos";
  if (item.privateGyms === maxValue) return "Gimnasios";
  if (item.parks === maxValue) return "Parques / áreas verdes";
  return "PILARES";
};

const buildHealthProfileKey = (sex: string, ageGroup: string, year: number) => `${sex}-${ageGroup}-${year}`;

const buildTerritorialRecords = (): TerritorialRecord[] => {
  const officialInfrastructure = buildOfficialInfrastructureLayer();
  return yearSeeds.flatMap((yearSeed) =>
    alcaldiasSeed.flatMap((alcaldia) => {
      const officialSummary = officialInfrastructure.summaryByAlcaldia[alcaldia.name];
      const projectedPopulation = projectPopulation(alcaldia.population2020, yearSeed.year);
      const totalInfrastructure =
        (officialSummary?.publicSportsCenters ?? alcaldia.publicSportsCenters) +
        (officialSummary?.pilares ?? alcaldia.pilares) +
        alcaldia.privateGyms +
        alcaldia.parks;
      const infraPer100k = (totalInfrastructure / projectedPopulation) * 100000;
      const normalizedCoverage =
        weightedCoveragePer100k(alcaldia) / meanCoverage;
      const coverageFactor = clamp(normalizedCoverage * alcaldia.territorialAccessFactor, 0.86, 1.15);

      return sexSeeds.flatMap((sexSeed) =>
        ageSeeds.map((ageSeed) => {
          const population = round(projectedPopulation * sexSeed.share * ageSeed.share);
          const sexRatio = yearSeed.year >= 2025
            ? (sexSeed.sex === "Hombres" ? yearSeed.menRate : yearSeed.womenRate) / yearSeed.overallActivityRate
            : (sexSeed.sex === "Hombres" ? yearSeed.menRate : yearSeed.womenRate) / yearSeed.overallActivityRate;
          const ageRatio = ageSeed.activityRate / 0.445;
          const activeRate = clamp(yearSeed.overallActivityRate * sexRatio * ageRatio * coverageFactor, 0.27, 0.63);
          const activePopulation = round(population * activeRate);
          const obesityRate = clamp(
            (alcaldia.obesityBase / 100) * sexSeed.obesityMultiplier * ageSeed.obesityMultiplier,
            0.17,
            0.5
          );
          const overweightRate = clamp(
            (alcaldia.overweightBase / 100) * sexSeed.overweightMultiplier * ageSeed.overweightMultiplier,
            0.18,
            0.48
          );
          const diabetesRate = clamp(
            (alcaldia.diabetesBase / 100) * sexSeed.diabetesMultiplier * ageSeed.diabetesMultiplier,
            0.015,
            0.38
          );

          const methodologicalBreak =
            yearSeed.year === 2025 || yearSeed.year === 2026
              ? methodologyBreaks[0]
              : undefined;

          return {
            alcaldia: alcaldia.name,
            year: yearSeed.year,
            sex: sexSeed.sex,
            ageGroup: ageSeed.ageGroup,
            sportFocus:
              ageSeed.ageGroup === "12-17"
                ? "Fútbol"
                : ageSeed.ageGroup === "18-29"
                  ? "Running / caminata"
                  : ageSeed.ageGroup === "30-44"
                    ? "Gimnasio / acondicionamiento"
                    : ageSeed.ageGroup === "45-59"
                      ? "Ciclismo"
                      : "Yoga / pilates",
            dominantInfraType: inferDominantInfraType(alcaldia),
            population,
            activePopulation,
            activeRate,
            sedentaryRate: 1 - activeRate,
            obesityRate,
            overweightRate,
            combinedWeightRiskRate: clamp(obesityRate + overweightRate, 0.32, 0.82),
            diabetesRate,
            pilares: officialSummary?.pilares ?? alcaldia.pilares,
            publicSportsCenters: officialSummary?.publicSportsCenters ?? alcaldia.publicSportsCenters,
            privateGyms: alcaldia.privateGyms,
            parks: alcaldia.parks,
            totalInfrastructure,
            infraPer100k,
            activityDataType: yearSeed.type,
            healthDataType: "estimado",
            infrastructureDataType: "real",
            populationDataType: yearSeed.year === 2026 ? "proyectado" : "base_oficial",
            activitySource:
              yearSeed.year === 2022
                ? "Retropolación preparada con base MOPRADEF 2024 y estructura demográfica"
                : yearSeed.year === 2026
                  ? "Proyección 2026 basada en MOPRADEF 2024-2025"
                  : "MOPRADEF 2024-2025",
            healthSource: "ENSANUT Continua 2022",
            infrastructureSource: "PILARES + Deportivos Públicos CDMX + DENUE + áreas verdes",
            populationSource:
              yearSeed.year === 2026
                ? "Censo 2020 INEGI + proyección lineal de planeación"
                : "Censo 2020 INEGI",
            methodologicalNote:
              yearSeed.year === 2022
                ? "2022 funciona como línea base retrospectiva para comparar salud con actividad preparada."
                : yearSeed.year === 2026
                  ? "2026 es escenario de planeación, no observación oficial."
                  : "La lectura por alcaldía es una estimación analítica, no una publicación oficial directa.",
            methodologicalBreak
          };
        })
      );
    })
  );
};

const buildSportsRecords = (territorialRecords: TerritorialRecord[]): SportsRecord[] => {
  return territorialRecords.flatMap((record) => {
    const participantsBase = record.activePopulation;
    const weighted = sportSeeds.map((seed) => {
      const sexBoost = record.sex === "Hombres" ? seed.menBoost : seed.womenBoost;
      const ageBoost = seed.ageBoost[record.ageGroup];
      const localBoost =
        seed.sport === record.sportFocus ? 1.2 : 1;
      return {
        seed,
        weight: seed.weight * sexBoost * ageBoost * localBoost
      };
    });
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0) || 1;

    return weighted.map(({ seed, weight }) => {
      const share = weight / totalWeight;
      return {
        alcaldia: record.alcaldia,
        year: record.year,
        sex: record.sex,
        ageGroup: record.ageGroup,
        sport: seed.sport,
        participants: round(participantsBase * share),
        share,
        dataType: "preparado",
        source: "Preparación analítica basada en hallazgos operativos y mezcla disciplinaria del MVP",
        note: "No es un tabulado oficial por alcaldía; sirve para priorización visual de top deportes."
      };
    });
  });
};

const infrastructureTemplates = [
  {
    infrastructureType: "PILARES" as const,
    tipo_espacio: "pilares",
    source: "Datos Abiertos CDMX / PILARES",
    note: "Cobertura comunitaria con potencial de activación física.",
    sportsAvailable: ["Activación física", "Zumba", "Yoga", "Básquetbol recreativo"],
    capacityFactor: 42,
    operationalFactor: 7,
    administrativeLabel: "Sedes PILARES",
    operationalLabel: "Espacios operativos PILARES"
  },
  {
    infrastructureType: "Deportivos públicos" as const,
    tipo_espacio: "cancha / deportivo",
    source: "Datos Abiertos CDMX / Deportivos públicos",
    note: "Infraestructura pública estructurada para práctica deportiva formal.",
    sportsAvailable: ["Fútbol", "Básquetbol", "Natación", "Atletismo"],
    capacityFactor: 180,
    operationalFactor: 4,
    administrativeLabel: "Instalaciones deportivas públicas",
    operationalLabel: "Espacios operativos deportivos"
  },
  {
    infrastructureType: "Gimnasios" as const,
    tipo_espacio: "gimnasio",
    source: "DENUE / SCIAN",
    note: "Oferta privada con acceso condicionado por costo.",
    sportsAvailable: ["Acondicionamiento", "Spinning", "Pesas", "Clases grupales"],
    capacityFactor: 55,
    operationalFactor: 2,
    administrativeLabel: "Establecimientos privados",
    operationalLabel: "Espacios operativos privados"
  },
  {
    infrastructureType: "Parques / áreas verdes" as const,
    tipo_espacio: "parque",
    source: "Inventario de áreas verdes / espacio público CDMX",
    note: "Espacio abierto para caminata, running y activación de bajo costo.",
    sportsAvailable: ["Running / caminata", "Ciclismo", "Calistenia", "Activación libre"],
    capacityFactor: 120,
    operationalFactor: 3,
    administrativeLabel: "Espacios públicos abiertos",
    operationalLabel: "Zonas operativas estimadas"
  }
];

const buildInfrastructureDetails = (): InfrastructureDetailRecord[] => {
  const officialInfrastructure = buildOfficialInfrastructureLayer();

  return yearSeeds.flatMap((yearSeed) =>
    alcaldiasSeed.flatMap((alcaldia) => {
      const counts = {
        "PILARES": alcaldia.pilares,
        "Deportivos públicos": alcaldia.publicSportsCenters,
        "Gimnasios": alcaldia.privateGyms,
        "Parques / áreas verdes": alcaldia.parks
      } as const;

      return infrastructureTemplates.map((template) => {
        if (yearSeed.year === 2025 && template.infrastructureType !== "Parques / áreas verdes") {
          return null;
        }
        const units =
          template.infrastructureType === "PILARES"
            ? (officialInfrastructure.summaryByAlcaldia[alcaldia.name]?.pilares ?? counts[template.infrastructureType])
            : template.infrastructureType === "Deportivos públicos"
              ? (officialInfrastructure.summaryByAlcaldia[alcaldia.name]?.publicSportsCenters ?? counts[template.infrastructureType])
              : counts[template.infrastructureType];
        const safeUnits =
          template.infrastructureType === "Gimnasios" && yearSeed.year === 2025
            ? officialInfrastructure.summaryByAlcaldia[alcaldia.name]?.privateFacilities ?? counts[template.infrastructureType]
            : template.infrastructureType === "Gimnasios"
              ? counts[template.infrastructureType]
              : units;
        const capacity = round(safeUnits * template.capacityFactor);
        return {
          id: `${yearSeed.year}-${alcaldia.name}-${template.infrastructureType}`,
          spaceName: `${template.infrastructureType} - ${alcaldia.name}`,
          tipo_espacio: template.tipo_espacio,
          infrastructureType: template.infrastructureType,
          alcaldia: alcaldia.name,
          year: yearSeed.year,
          sportsAvailable: template.sportsAvailable,
          administrativeCount: safeUnits,
          administrativeLabel: template.administrativeLabel,
          operationalUnits: safeUnits * template.operationalFactor,
          operationalLabel: template.operationalLabel,
          capacity,
          capacityType: "estimada",
          units: safeUnits,
          geoKey: alcaldia.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
          dataType: template.infrastructureType === "Gimnasios" ? "preparado" : "real",
          source: template.source,
          methodologicalNote:
            yearSeed.year === 2026
              ? `${template.note} La capacidad es estimada y el corte 2026 se usa para planeación.`
              : `${template.note} La capacidad es estimada en ausencia de aforo oficial consolidado.`
        };
      }).filter(Boolean) as InfrastructureDetailRecord[];
    })
  );
};

const buildHealthProfiles = (territorialRecords: TerritorialRecord[]): HealthProfileRecord[] => {
  const map = new Map<string, HealthProfileRecord>();
  territorialRecords.forEach((record) => {
    const key = buildHealthProfileKey(record.sex, record.ageGroup, record.year);
    if (map.has(key)) return;
    map.set(key, {
      year: record.year,
      sex: record.sex,
      ageGroup: record.ageGroup,
      obesityRate: record.obesityRate,
      overweightRate: record.overweightRate,
      diabetesRate: record.diabetesRate,
      sedentaryRate: record.sedentaryRate,
      dataType: record.year === 2026 ? "proyectado" : "estimado",
      source: "ENSANUT Continua 2022 + segmentación sexo/edad",
      methodologicalNote:
        record.year === 2026
          ? "Perfil proyectado para planeación; no corresponde a observación oficial anual."
          : "Perfil segmentado por sexo y edad a partir de ENSANUT 2022."
    });
  });
  return Array.from(map.values()).sort((a, b) => a.year - b.year || a.sex.localeCompare(b.sex) || a.ageGroup.localeCompare(b.ageGroup));
};

const buildMapAreas = (territorialRecords: TerritorialRecord[]): MapAreaRecord[] => {
  const groups = new Map<string, TerritorialRecord[]>();
  territorialRecords.forEach((record) => {
    const key = `${record.alcaldia}-${record.year}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  });

  return Array.from(groups.entries()).map(([key, items]) => {
    const [alcaldia, yearString] = key.split("-");
    const seed = alcaldiasSeed.find((item) => item.name === alcaldia)!;
    const population = items.reduce((sum, item) => sum + item.population, 0) || 1;
    const activityRate = items.reduce((sum, item) => sum + item.activeRate * item.population, 0) / population;
    const obesityRate = items.reduce((sum, item) => sum + item.obesityRate * item.population, 0) / population;
    const sedentaryRate = items.reduce((sum, item) => sum + item.sedentaryRate * item.population, 0) / population;
    const infraPer100k = items[0]?.infraPer100k ?? 0;
    const score = ((1 - activityRate) * 35) + (obesityRate * 30) + (sedentaryRate * 20) + ((1 / Math.max(infraPer100k, 1)) * 150);
    const riskLevel: MapAreaRecord["riskLevel"] = score >= 33 ? "Rojo" : score >= 26 ? "Amarillo" : "Verde";
    return {
      alcaldia,
      year: Number(yearString),
      geoKey: alcaldia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
      centroid: seed.centroid,
      activityRate,
      riskScore: Number(score.toFixed(1)),
      riskLevel,
      infraPer100k,
      dataType: Number(yearString) === 2026 ? "proyectado" : "insight",
      source: "Modelo territorial Deporte CDMX listo para choropleth o heatmap",
      methodologicalNote: "Registro preparado para capa de mapa por alcaldía sin depender aún de geometría externa."
    };
  });
};

export const buildDashboardData = (): DashboardDataset => {
  const officialInfrastructure = buildOfficialInfrastructureLayer();
  const territorialRecords = buildTerritorialRecords();
  const infrastructureDetails = [
    ...officialInfrastructure.details,
    ...buildInfrastructureDetails()
      .filter((item) => item.year !== 2025 || item.infrastructureType === "Parques / áreas verdes")
  ];
  const sportsRecords = buildSportsRecords(territorialRecords);
  const healthProfiles = buildHealthProfiles(territorialRecords);
  const mapAreas = buildMapAreas(territorialRecords);
  const mapGeometry = buildMapGeometry();

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      supportedYears: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
      activityBaseYears: [2024, 2025],
      healthBaseYear: 2022,
      projectionYear: 2026,
      methodologyBreaks,
      projectedYears: [2026],
      timelineNotes
    },
    territorialRecords,
    infrastructureDetails,
    sportsRecords,
    healthProfiles,
    mapAreas,
    mapGeometry,
    methodology: methodologyEntries,
    sourceRegistry,
    qualityChecks,
    insights: executiveInsights
  };
};
