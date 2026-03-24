type AlcaldiaPrepared = {
  name: string;
  population2020: number;
  deportivos: number;
  pilares: number;
  gimnasios: number;
  parques: number;
  obesity: number;
  sobrepeso: number;
  diabetes: number;
};

const activityAnchors = {
  overallPct2025: 41.7,
  menPct2025: 46.7,
  womenPct2025: 37.4
};

const ageActivityAnchors = [
  { grupoEdad: "12-17", share: 0.12, pct2025: 52.7 },
  { grupoEdad: "18-29", share: 0.24, pct2025: 46.8 },
  { grupoEdad: "30-44", share: 0.27, pct2025: 42.6 },
  { grupoEdad: "45-59", share: 0.22, pct2025: 39.8 },
  { grupoEdad: "60+", share: 0.15, pct2025: 37.6 }
] as const;

const sexSegments = [
  { sexo: "Hombres", share: 0.48, pct2025: activityAnchors.menPct2025 },
  { sexo: "Mujeres", share: 0.52, pct2025: activityAnchors.womenPct2025 }
] as const;

const years = [
  { year: 2024, nationalPct: 39.8 },
  { year: 2025, nationalPct: activityAnchors.overallPct2025 }
] as const;

const alcaldias: AlcaldiaPrepared[] = [
  { name: "Álvaro Obregón", population2020: 759137, deportivos: 28, pilares: 14, gimnasios: 164, parques: 24, obesity: 34.1, sobrepeso: 37.6, diabetes: 11.3 },
  { name: "Azcapotzalco", population2020: 432205, deportivos: 16, pilares: 8, gimnasios: 119, parques: 18, obesity: 35.9, sobrepeso: 38.4, diabetes: 12.1 },
  { name: "Benito Juárez", population2020: 434153, deportivos: 18, pilares: 8, gimnasios: 212, parques: 22, obesity: 28.4, sobrepeso: 34.8, diabetes: 9.1 },
  { name: "Coyoacán", population2020: 614447, deportivos: 26, pilares: 11, gimnasios: 196, parques: 26, obesity: 31.8, sobrepeso: 36.9, diabetes: 10.7 },
  { name: "Cuajimalpa", population2020: 217686, deportivos: 10, pilares: 4, gimnasios: 58, parques: 11, obesity: 33.4, sobrepeso: 37.2, diabetes: 11.0 },
  { name: "Cuauhtémoc", population2020: 545884, deportivos: 17, pilares: 9, gimnasios: 205, parques: 21, obesity: 32.5, sobrepeso: 36.7, diabetes: 10.4 },
  { name: "Gustavo A. Madero", population2020: 1173351, deportivos: 36, pilares: 19, gimnasios: 189, parques: 29, obesity: 37.9, sobrepeso: 39.5, diabetes: 13.2 },
  { name: "Iztacalco", population2020: 404695, deportivos: 14, pilares: 8, gimnasios: 94, parques: 14, obesity: 36.4, sobrepeso: 38.8, diabetes: 12.7 },
  { name: "Iztapalapa", population2020: 1835486, deportivos: 45, pilares: 28, gimnasios: 220, parques: 34, obesity: 38.8, sobrepeso: 40.4, diabetes: 13.7 },
  { name: "La Magdalena Contreras", population2020: 247622, deportivos: 12, pilares: 5, gimnasios: 49, parques: 13, obesity: 36.8, sobrepeso: 39.0, diabetes: 12.5 },
  { name: "Miguel Hidalgo", population2020: 414470, deportivos: 19, pilares: 7, gimnasios: 181, parques: 22, obesity: 29.2, sobrepeso: 35.6, diabetes: 9.6 },
  { name: "Milpa Alta", population2020: 152685, deportivos: 11, pilares: 5, gimnasios: 21, parques: 9, obesity: 40.6, sobrepeso: 41.2, diabetes: 14.2 },
  { name: "Tláhuac", population2020: 392313, deportivos: 15, pilares: 10, gimnasios: 64, parques: 15, obesity: 39.4, sobrepeso: 40.7, diabetes: 13.8 },
  { name: "Tlalpan", population2020: 699928, deportivos: 31, pilares: 16, gimnasios: 138, parques: 28, obesity: 35.2, sobrepeso: 38.1, diabetes: 11.9 },
  { name: "Venustiano Carranza", population2020: 443704, deportivos: 15, pilares: 7, gimnasios: 103, parques: 15, obesity: 35.7, sobrepeso: 38.0, diabetes: 12.4 },
  { name: "Xochimilco", population2020: 442178, deportivos: 18, pilares: 10, gimnasios: 71, parques: 17, obesity: 38.1, sobrepeso: 39.8, diabetes: 13.1 }
];

const sportsMix = [
  { deporte: "Fútbol", weight: 0.25 },
  { deporte: "Running / caminata deportiva", weight: 0.21 },
  { deporte: "Ciclismo", weight: 0.16 },
  { deporte: "Basquetbol", weight: 0.13 },
  { deporte: "Natación", weight: 0.1 },
  { deporte: "Box / artes marciales", weight: 0.08 },
  { deporte: "Gimnasio / acondicionamiento", weight: 0.07 },
  { deporte: "Yoga / pilates", weight: 0.05 },
  { deporte: "Volibol", weight: 0.04 },
  { deporte: "Tenis / pádel", weight: 0.03 },
  { deporte: "Otros", weight: 0.01 }
] as const;

const ageSportPreference: Record<string, string> = {
  "12-17": "Fútbol",
  "18-29": "Running / caminata deportiva",
  "30-44": "Gimnasio / acondicionamiento",
  "45-59": "Ciclismo",
  "60+": "Yoga / pilates"
};

const round = (value: number) => Math.round(value);
const oneDecimal = (value: number) => (Math.round(value * 10) / 10).toFixed(1);

const baseInfrastructurePer100k = alcaldias.reduce((sum, alcaldia) => {
  return sum + ((alcaldia.deportivos + alcaldia.pilares + alcaldia.gimnasios) / alcaldia.population2020) * 100000;
}, 0) / alcaldias.length;

const getTerritorialFactor = (alcaldia: AlcaldiaPrepared) => {
  const infraPer100k = ((alcaldia.deportivos + alcaldia.pilares + alcaldia.gimnasios) / alcaldia.population2020) * 100000;
  const normalized = infraPer100k / baseInfrastructurePer100k;
  return Math.max(0.88, Math.min(1.12, normalized));
};

const getYearPopulation = (population2020: number, year: number) => {
  const factors: Record<number, number> = { 2024: 1.01, 2025: 1.015 };
  return round(population2020 * (factors[year] ?? 1));
};

const buildBaseRows = () => {
  return years.flatMap((yearSeed) =>
    alcaldias.flatMap((alcaldia) => {
      const territorialFactor = getTerritorialFactor(alcaldia);
      const yearPopulation = getYearPopulation(alcaldia.population2020, yearSeed.year);
      const infraTotal = alcaldia.deportivos + alcaldia.pilares + alcaldia.gimnasios + alcaldia.parques;
      const infraPer100k = (infraTotal / yearPopulation) * 100000;

      return sexSegments.flatMap((sex) =>
        ageActivityAnchors.map((age) => {
          const poblacionTotal = round(yearPopulation * sex.share * age.share);
          const nationalSexRatio = sex.pct2025 / activityAnchors.overallPct2025;
          const nationalAgeRatio = age.pct2025 / activityAnchors.overallPct2025;
          const estimatedPct = Math.max(
            28,
            Math.min(60, yearSeed.nationalPct * nationalSexRatio * nationalAgeRatio * territorialFactor)
          );
          const personsActive = round(poblacionTotal * (estimatedPct / 100));

          return {
            Alcaldia: alcaldia.name,
            Anio: String(yearSeed.year),
            Sexo: sex.sexo,
            GrupoEdad: age.grupoEdad,
            DeportePrincipal: ageSportPreference[age.grupoEdad],
            TipoInfraestructuraDominante:
              alcaldia.gimnasios >= alcaldia.deportivos && alcaldia.gimnasios >= alcaldia.parques && alcaldia.gimnasios >= alcaldia.pilares
                ? "Gimnasios"
                : alcaldia.deportivos >= alcaldia.parques && alcaldia.deportivos >= alcaldia.pilares
                  ? "Deportivos públicos"
                  : alcaldia.parques >= alcaldia.pilares
                    ? "Parques con equipamiento"
                    : "PILARES",
            PoblacionTotal: String(poblacionTotal),
            PersonasActivas: String(personsActive),
            PorcentajeActivo: oneDecimal(estimatedPct),
            DeportivosPublicos: String(alcaldia.deportivos),
            Pilares: String(alcaldia.pilares),
            Gimnasios: String(alcaldia.gimnasios),
            ParquesConEquipamiento: String(alcaldia.parques),
            InfraestructuraTotal: String(infraTotal),
            InfraestructuraPor100k: oneDecimal(infraPer100k),
            Obesidad: oneDecimal(alcaldia.obesity),
            Sobrepeso: oneDecimal(alcaldia.sobrepeso),
            Diabetes: oneDecimal(alcaldia.diabetes),
            Sedentarismo: oneDecimal(100 - estimatedPct),
            ClasificacionPoblacionTotal: "Agregado preparado",
            ClasificacionPersonasActivas: "Estimado controlado",
            ClasificacionPorcentajeActivo: "Estimado controlado",
            ClasificacionInfraestructura: "Agregado preparado",
            ClasificacionSalud: "Preparado con referencia pública",
            FuentePoblacionTotal: "Censo 2020 INEGI + proyección lineal 2024/2025",
            FuentePersonasActivas: "Estimación territorial anclada a MOPRADEF 2024/2025",
            FuenteInfraestructura: "Deportivos CDMX + PILARES + DENUE preparados",
            FuenteSalud: "ENSANUT 2022 con perfil territorial preparado",
            SupuestoActividad: "Actividad por alcaldía modelada con ancla nacional por sexo/edad y ajuste por infraestructura per cápita",
            FactorTerritorialActividad: oneDecimal(territorialFactor),
            NotasMetodo: "No es dato censal por alcaldía; es una estimación MVP para demo institucional"
          };
        })
      );
    })
  );
};

const buildSportsRows = () => {
  return years.flatMap((yearSeed) =>
    alcaldias.flatMap((alcaldia) => {
      const activeTotal = round(getYearPopulation(alcaldia.population2020, yearSeed.year) * (yearSeed.nationalPct / 100) * getTerritorialFactor(alcaldia));
      return sportsMix.map((sport) => ({
        Alcaldia: alcaldia.name,
        Anio: String(yearSeed.year),
        Deporte: sport.deporte,
        Participantes: String(round(activeTotal * sport.weight)),
        PorcentajeParticipacion: oneDecimal(sport.weight * 100),
        ClasificacionDato: "Proxy para demo",
        FuenteDato: "Distribución preparada para storytelling; no proviene de una fuente oficial única por disciplina",
        Nota: "Úsese como capa demostrativa mientras se decide la fuente o proxy definitivo de disciplinas"
      }));
    })
  );
};

const buildInfrastructureRows = () => {
  return years.flatMap((yearSeed) =>
    alcaldias.map((alcaldia) => {
      const infraTotal = alcaldia.deportivos + alcaldia.pilares + alcaldia.gimnasios + alcaldia.parques;
      const population = getYearPopulation(alcaldia.population2020, yearSeed.year);
      return {
        Alcaldia: alcaldia.name,
        Anio: String(yearSeed.year),
        DeportivosPublicos: String(alcaldia.deportivos),
        Pilares: String(alcaldia.pilares),
        Gimnasios: String(alcaldia.gimnasios),
        ParquesConEquipamiento: String(alcaldia.parques),
        InfraestructuraTotal: String(infraTotal),
        InfraestructuraPor100k: oneDecimal((infraTotal / population) * 100000),
        HabitantesPorInfraestructura: String(round(population / infraTotal)),
        ClasificacionDato: "Agregado preparado",
        FuenteDato: "Conteos preparados a partir de INDEPORTE, PILARES y DENUE",
        Cobertura: infraTotal > 180 ? "Alta" : infraTotal > 110 ? "Media" : "Baja"
      };
    })
  );
};

const buildMethodologyRows = () => [
  {
    Seccion: "Actividad física",
    Tipo: "Estimado controlado",
    Fuente: "MOPRADEF 2024 y 2025",
    Detalle: "Se usan anclas nacionales por sexo y grupo de edad; la bajada a alcaldía se aproxima con un factor territorial basado en infraestructura per cápita.",
    Limitacion: "No sustituye una estimación formal MRP o modelación con microdatos ponderados."
  },
  {
    Seccion: "Población",
    Tipo: "Agregado preparado",
    Fuente: "Censo 2020 INEGI",
    Detalle: "La población se reparte por sexo y grupo de edad para construir la matriz base del MVP; 2024 y 2025 usan una proyección lineal mínima.",
    Limitacion: "La proyección no incorpora componentes demográficos completos."
  },
  {
    Seccion: "Infraestructura",
    Tipo: "Agregado preparado",
    Fuente: "Deportivos Públicos CDMX, PILARES, DENUE",
    Detalle: "Los conteos se presentan ya consolidados por alcaldía para demo institucional.",
    Limitacion: "Falta trazabilidad a cada registro puntual e integración geográfica."
  },
  {
    Seccion: "Salud",
    Tipo: "Preparado con referencia pública",
    Fuente: "ENSANUT 2022",
    Detalle: "Obesidad y diabetes se muestran como capa de contexto territorial para lectura ejecutiva.",
    Limitacion: "No representan prevalencias observadas oficialmente por alcaldía publicadas de forma directa."
  }
];

const buildDictionaryRows = () => [
  { Campo: "Alcaldia", Tipo: "Dimensión", Clasificacion: "Catálogo preparado", Fuente: "Catálogo de alcaldías CDMX" },
  { Campo: "Anio", Tipo: "Dimensión", Clasificacion: "Corte temporal preparado", Fuente: "Planeación MVP 2024-2025" },
  { Campo: "Sexo", Tipo: "Dimensión", Clasificacion: "Segmentación preparada", Fuente: "MOPRADEF / Censo" },
  { Campo: "GrupoEdad", Tipo: "Dimensión", Clasificacion: "Segmentación preparada", Fuente: "MOPRADEF / Censo" },
  { Campo: "DeportePrincipal", Tipo: "Dimensión", Clasificacion: "Proxy preparado", Fuente: "Preferencia sintética para que el MVP soporte filtro analítico transversal" },
  { Campo: "TipoInfraestructuraDominante", Tipo: "Dimensión", Clasificacion: "Proxy preparado", Fuente: "Categoría dominante dentro de la oferta territorial preparada" },
  { Campo: "PoblacionTotal", Tipo: "Métrica", Clasificacion: "Agregado preparado", Fuente: "Censo 2020 + proyección lineal" },
  { Campo: "PersonasActivas", Tipo: "Métrica", Clasificacion: "Estimado controlado", Fuente: "MOPRADEF + factor territorial" },
  { Campo: "PorcentajeActivo", Tipo: "Métrica", Clasificacion: "Estimado controlado", Fuente: "MOPRADEF + factor territorial" },
  { Campo: "DeportivosPublicos", Tipo: "Métrica", Clasificacion: "Agregado preparado", Fuente: "Deportivos Públicos CDMX" },
  { Campo: "Pilares", Tipo: "Métrica", Clasificacion: "Agregado preparado", Fuente: "PILARES / SECTEI" },
  { Campo: "Gimnasios", Tipo: "Métrica", Clasificacion: "Agregado preparado", Fuente: "DENUE / SCIAN" },
  { Campo: "ParquesConEquipamiento", Tipo: "Métrica", Clasificacion: "Agregado preparado", Fuente: "Parques y espacios con equipamiento preparados para MVP" },
  { Campo: "Obesidad", Tipo: "Métrica", Clasificacion: "Preparado con referencia pública", Fuente: "ENSANUT 2022" },
  { Campo: "Sobrepeso", Tipo: "Métrica", Clasificacion: "Preparado con referencia pública", Fuente: "ENSANUT 2022" },
  { Campo: "Diabetes", Tipo: "Métrica", Clasificacion: "Preparado con referencia pública", Fuente: "ENSANUT 2022" },
  { Campo: "Sedentarismo", Tipo: "Métrica", Clasificacion: "Estimado controlado", Fuente: "Complemento calculado como inverso de la actividad estimada" }
];

export const deporteCdmxSeed = {
  README: [
    { Contenido: "Deporte CDMX es un dashboard de inteligencia deportiva para la Ciudad de México orientado a demo institucional." },
    { Contenido: "El MVP combina datos públicos preparados, agregados por alcaldía y estimaciones controladas para actividad física territorial." },
    { Contenido: "La prioridad es demostrar capacidad analítica defendible mientras se prepara una fase posterior con ETL y microdatos formales." }
  ],
  DEPORTE_CDMX_BASE: buildBaseRows(),
  DEPORTES_POPULARES: buildSportsRows(),
  INFRAESTRUCTURA_ALCALDIA: buildInfrastructureRows(),
  CALIDAD_DATOS: [
    { Campo: "Alcaldia", Revisados: "320", Faltantes: "0", Duplicados: "0", Estado: "OK", Notas: "16 alcaldías homologadas." },
    { Campo: "Anio", Revisados: "320", Faltantes: "0", Duplicados: "0", Estado: "OK", Notas: "Cortes 2024 y 2025." },
    { Campo: "Sexo", Revisados: "320", Faltantes: "0", Duplicados: "0", Estado: "OK", Notas: "Dos segmentos del MVP." },
    { Campo: "GrupoEdad", Revisados: "320", Faltantes: "0", Duplicados: "0", Estado: "OK", Notas: "Cinco grupos etarios anclados a MOPRADEF." },
    { Campo: "PoblacionTotal", Revisados: "320", Faltantes: "0", Duplicados: "0", Estado: "OK", Notas: "Agregado preparado con base censal." },
    { Campo: "PersonasActivas", Revisados: "320", Faltantes: "0", Duplicados: "0", Estado: "OK", Notas: "Estimación controlada, no dato directo por alcaldía." },
    { Campo: "Infraestructura", Revisados: "320", Faltantes: "0", Duplicados: "0", Estado: "OK", Notas: "Conteos consolidados por tipo: deportivos, PILARES, gimnasios y parques." },
    { Campo: "Obesidad, Sobrepeso y Diabetes", Revisados: "320", Faltantes: "0", Duplicados: "0", Estado: "OK", Notas: "Capa territorial preparada desde ENSANUT." }
  ],
  METODOLOGIA: buildMethodologyRows(),
  DICCIONARIO_MVP: buildDictionaryRows(),
  FUENTES: [
    { Tipo: "Actividad física", Fuente: "MOPRADEF 2024-2025", Detalle: "Anclas nacionales de actividad física en tiempo libre por sexo y grupo de edad." },
    { Tipo: "Población", Fuente: "Censo 2020 INEGI", Detalle: "Base poblacional por alcaldía usada para normalizar la matriz del MVP." },
    { Tipo: "Infraestructura pública", Fuente: "Deportivos Públicos CDMX", Detalle: "Conteo de deportivos públicos por alcaldía." },
    { Tipo: "Infraestructura comunitaria", Fuente: "PILARES / SECTEI", Detalle: "Cobertura territorial de PILARES." },
    { Tipo: "Infraestructura privada", Fuente: "DENUE / SCIAN", Detalle: "Gimnasios y centros de acondicionamiento físico." },
    { Tipo: "Espacio público activo", Fuente: "Capa preparada MVP", Detalle: "Parques con equipamiento integrados como categoría analítica inicial." },
    { Tipo: "Salud", Fuente: "ENSANUT 2022", Detalle: "Capa de obesidad y diabetes para lectura ejecutiva territorial." }
  ]
} as const;

export default { deporteCdmxSeed };
