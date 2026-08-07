import type {
  DashboardDataset,
  HealthProfileRecord,
  InfrastructureDetailRecord,
  MapAreaRecord,
  TerritorialRecord
} from "../../lib/dashboard-types";
import { alcaldiasSeed } from "../raw/alcaldias";
import { ageSeeds, methodologyBreaks, sexSeeds, timelineNotes, yearSeeds } from "../raw/official-benchmarks";
import { executiveInsights, methodologyEntries, qualityChecks, sourceRegistry } from "../insights/notes";
import { buildCanchasOperativasLayer } from "./integration/build-canchas-operativas";
import { buildOfficialInfrastructureLayer } from "./integration/build-official-infrastructure";
import { buildProgrammedOfferRecords } from "./integration/build-programmed-offer";
import { buildMapGeometry } from "./integration/build-map-geometry";
import { buildPublicSpaceLayer } from "./integration/build-public-space-layer";
import { canonicalCatalogs } from "./integration/canonical-catalogs";
import { projectPopulation } from "../processed/population";

const round = (value: number) => Math.round(value);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const weightedCoveragePer100k = (record: {
  population2020: number;
  publicSportsCenters: number;
  pilares: number;
  privateGyms: number;
  privateClubs?: number;
  privateSchools?: number;
  utopias?: number;
  parks: number;
  privateAccessPenalty: number;
}) => {
  const weighted =
    record.publicSportsCenters * 1 +
    (record.utopias ?? 0) * 1 +
    record.pilares * 0.45 +
    (record.privateGyms + (record.privateClubs ?? 0) + (record.privateSchools ?? 0)) * (0.55 / record.privateAccessPenalty);
  return (weighted / record.population2020) * 100000;
};

const meanCoverage =
  alcaldiasSeed.reduce((sum, item) => sum + weightedCoveragePer100k(item), 0) / alcaldiasSeed.length;

const inferDominantInfraType = (item: typeof alcaldiasSeed[number]): TerritorialRecord["dominantInfraType"] => {
  const maxValue = Math.max(item.publicSportsCenters, item.pilares);
  if (item.publicSportsCenters === maxValue) return "Deportivos públicos";
  return "PILARES";
};

const buildHealthProfileKey = (sex: string, ageGroup: string, year: number) => `${sex}-${ageGroup}-${year}`;

const buildTerritorialRecords = (): TerritorialRecord[] => {
  const officialInfrastructure = buildOfficialInfrastructureLayer();
  const publicSpaceLayer = buildPublicSpaceLayer();
  const publicSpaceLookup = new Map(
    publicSpaceLayer.summary.byAlcaldia.map((item) => [item.alcaldia, item])
  );
  return yearSeeds.flatMap((yearSeed) =>
    alcaldiasSeed.flatMap((alcaldia) => {
      const officialSummary = officialInfrastructure.summaryByAlcaldia[alcaldia.name];
      const publicSpaceSummary = publicSpaceLookup.get(alcaldia.name);
      const projectedPopulation = projectPopulation(alcaldia.population2020, yearSeed.year);
      const privateGyms = yearSeed.year === 2025 ? (officialSummary?.privateGyms ?? 0) : 0;
      const privateClubs = yearSeed.year === 2025 ? (officialSummary?.privateClubs ?? 0) : 0;
      const privateSchools = yearSeed.year === 2025 ? (officialSummary?.privateSchools ?? 0) : 0;
      const utopias = yearSeed.year === 2025 ? (officialSummary?.utopias ?? 0) : 0;
      const totalInfrastructure =
        (officialSummary?.publicSportsCenters ?? alcaldia.publicSportsCenters) +
        (officialSummary?.pilares ?? alcaldia.pilares) +
        utopias;
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
            utopias,
            publicSportsCenters: officialSummary?.publicSportsCenters ?? alcaldia.publicSportsCenters,
            privateGyms,
            privateClubs,
            privateSchools,
            parks: publicSpaceSummary?.greenAreaRecords ?? 0,
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
            infrastructureSource: "PILARES histórico + UTOPÍAs + Deportivos Públicos CDMX + DENUE preparado; espacio público en capa separada",
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

const infrastructureTemplates = [
  {
    infrastructureType: "PILARES" as const,
    tipo_espacio: "pilares",
    source: "Datos Abiertos CDMX / PILARES",
    note: "Cobertura comunitaria con potencial de activación física.",
    capacityFactor: 42,
    operationalFactor: 7,
    administrativeLabel: "Sedes PILARES",
    operationalLabel: "Espacios operativos PILARES"
  },
  {
    infrastructureType: "UTOPÍAs" as const,
    tipo_espacio: "utopia",
    source: "Investigación actual / bloque institucional UTOPÍAs",
    note: "Capa institucional real por sede documentada. No se infieren disciplinas ni amenidades internas.",
    capacityFactor: 160,
    operationalFactor: 6,
    administrativeLabel: "UTOPÍAs documentadas",
    operationalLabel: "Espacios operativos UTOPÍA"
  },
  {
    infrastructureType: "Deportivos públicos" as const,
    tipo_espacio: "cancha / deportivo",
    source: "Datos Abiertos CDMX / Deportivos públicos",
    note: "Infraestructura pública estructurada para práctica deportiva formal.",
    capacityFactor: 180,
    operationalFactor: 4,
    administrativeLabel: "Instalaciones deportivas públicas",
    operationalLabel: "Espacios operativos deportivos"
  },
  {
    infrastructureType: "Gimnasio privado" as const,
    tipo_espacio: "gimnasio",
    source: "DENUE / SCIAN",
    note: "Oferta privada con acceso condicionado por costo.",
    capacityFactor: 55,
    operationalFactor: 2,
    administrativeLabel: "Gimnasios privados",
    operationalLabel: "Espacios operativos privados"
  },
  {
    infrastructureType: "Club deportivo privado" as const,
    tipo_espacio: "club deportivo",
    source: "DENUE / SCIAN",
    note: "Oferta privada deportiva asociativa o de membresía.",
    capacityFactor: 80,
    operationalFactor: 3,
    administrativeLabel: "Clubes deportivos privados",
    operationalLabel: "Espacios operativos de club"
  },
  {
    infrastructureType: "Academia deportiva privada" as const,
    tipo_espacio: "academia deportiva",
    source: "DENUE / SCIAN",
    note: "Oferta privada orientada a enseñanza, entrenamiento o iniciación deportiva.",
    capacityFactor: 35,
    operationalFactor: 2,
    administrativeLabel: "Academias deportivas privadas",
    operationalLabel: "Espacios operativos de academia"
  }
];

const buildInfrastructureDetails = (): InfrastructureDetailRecord[] => {
  return yearSeeds.flatMap((yearSeed) =>
    alcaldiasSeed.flatMap((alcaldia) => {
      const counts = {
        "PILARES": alcaldia.pilares,
        "UTOPÍAs": 0,
        "Deportivos públicos": alcaldia.publicSportsCenters,
        "Gimnasio privado": 0,
        "Club deportivo privado": 0,
        "Academia deportiva privada": 0
      } as const;

      return infrastructureTemplates.map((template) => {
        if (
          template.infrastructureType === "Gimnasio privado" ||
          template.infrastructureType === "Club deportivo privado" ||
          template.infrastructureType === "Academia deportiva privada"
        ) {
          return null;
        }
        if (yearSeed.year === 2025) {
          return null;
        }
        const safeUnits = counts[template.infrastructureType];
        const capacity = round(safeUnits * template.capacityFactor);
        return {
          id: `${yearSeed.year}-${alcaldia.name}-${template.infrastructureType}`,
          spaceName: `${template.infrastructureType} - ${alcaldia.name}`,
          tipo_espacio: template.tipo_espacio,
          infrastructureType: template.infrastructureType,
          alcaldia: alcaldia.name,
          year: yearSeed.year,
          sportsAvailable: [],
          disciplineStatus: "no_documentado",
          administrativeCount: safeUnits,
          administrativeLabel: template.administrativeLabel,
          operationalUnits: safeUnits * template.operationalFactor,
          operationalLabel: template.operationalLabel,
          capacity,
          capacityType: "estimada",
          units: safeUnits,
          geoKey: alcaldia.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
          dataType: template.infrastructureType.includes("privado") ? "preparado" : "real",
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

const buildMapAreas = (
  territorialRecords: TerritorialRecord[],
  publicSpaceSummary: DashboardDataset["publicSpaceSummary"]
): MapAreaRecord[] => {
  const groups = new Map<string, TerritorialRecord[]>();
  const publicSpaceLookup = new Map(publicSpaceSummary.byAlcaldia.map((item) => [item.alcaldia, item]));
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
    const diabetesRate = items.reduce((sum, item) => sum + item.diabetesRate * item.population, 0) / population;
    const sedentaryRate = items.reduce((sum, item) => sum + item.sedentaryRate * item.population, 0) / population;
    const sample = items[0];
    const publicSpace = publicSpaceLookup.get(alcaldia);
    const publicInfrastructureCount = (sample?.pilares ?? 0) + (sample?.utopias ?? 0) + (sample?.publicSportsCenters ?? 0);
    const privateInfrastructureCount = (sample?.privateGyms ?? 0) + (sample?.privateClubs ?? 0) + (sample?.privateSchools ?? 0);
    const totalInfrastructureCount = publicInfrastructureCount + privateInfrastructureCount;
    const infraPer100k = items[0]?.infraPer100k ?? 0;
    const score = ((1 - activityRate) * 35) + (obesityRate * 30) + (sedentaryRate * 20) + ((1 / Math.max(infraPer100k, 1)) * 150);
    const riskLevel: MapAreaRecord["riskLevel"] = score >= 33 ? "Rojo" : score >= 26 ? "Amarillo" : "Verde";
    return {
      alcaldia,
      year: Number(yearString),
      geoKey: alcaldia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"),
      centroid: seed.centroid,
      activityRate,
      obesityRate,
      diabetesRate,
      sedentaryRate,
      riskScore: Number(score.toFixed(1)),
      riskLevel,
      publicInfrastructureCount,
      privateInfrastructureCount,
      totalInfrastructureCount,
      utopiasCount: sample?.utopias ?? 0,
      greenAreaCount: publicSpace?.greenAreaRecords ?? 0,
      greenAreaSurfaceSqM: publicSpace?.greenAreaSurfaceSqM ?? 0,
      publicSpaceCount: publicSpace?.publicSpaceRecords ?? 0,
      infraPer100k,
      dataType: Number(yearString) === 2026 ? "proyectado" : "insight",
      source: "Modelo territorial Deporte CDMX listo para choropleth o heatmap",
      methodologicalNote:
        "Registro territorial listo para mapa por alcaldía. La geometría es oficial; actividad y salud son modeladas; la infraestructura deportiva pública/comunitaria y la capa de espacio público se leen por separado; la infraestructura privada depende del corte DENUE disponible."
    };
  });
};

export const buildDashboardData = (): DashboardDataset => {
  const officialInfrastructure = buildOfficialInfrastructureLayer();
  const publicSpaceLayer = buildPublicSpaceLayer();
  const canchasLayer = buildCanchasOperativasLayer();
  const programmedOfferRecords = buildProgrammedOfferRecords();
  const territorialRecords = buildTerritorialRecords();
  const infrastructureDetails = [
    ...officialInfrastructure.details,
    ...buildInfrastructureDetails()
  ];
  const sportsRecords: DashboardDataset["sportsRecords"] = [];
  const healthProfiles = buildHealthProfiles(territorialRecords);
  const mapAreas = buildMapAreas(territorialRecords, publicSpaceLayer.summary);
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
      timelineNotes,
      catalogs: {
        alcaldias: [...canonicalCatalogs.alcaldias],
        channels: [...canonicalCatalogs.channels],
        dataTypes: [...canonicalCatalogs.dataTypes],
        qualityGrades: [...canonicalCatalogs.qualityGrades],
        verificationStates: [...canonicalCatalogs.verificationStates],
        sexes: [...canonicalCatalogs.sexes],
        ageGroups: [...canonicalCatalogs.ageGroups],
        disciplineDictionaryVersion: "2026-08-03"
      }
    },
    territorialRecords,
    programmedOfferRecords,
    infrastructureDetails,
    publicSpaceSummary: publicSpaceLayer.summary,
    canchasRecords: canchasLayer.records,
    canchasSummary: canchasLayer.summaryByAlcaldia,
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
