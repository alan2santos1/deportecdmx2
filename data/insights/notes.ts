import type { InsightEntry, MethodologyEntry, QualityEntry, SourceRegistryEntry } from "../../lib/dashboard-types";

export const sourceRegistry: SourceRegistryEntry[] = [
  {
    metric: "PILARES",
    layer: "real",
    source: "Datos Abiertos CDMX / Ubicación y estatus de PILARES",
    coverage: "Infraestructura comunitaria observable por sede",
    note: "Se usa como infraestructura de activación; su peso es menor que deportivos formales."
  },
  {
    metric: "Deportivos públicos",
    layer: "real",
    source: "Datos Abiertos CDMX / Deportivos públicos",
    coverage: "Instalaciones deportivas públicas observables",
    note: "Es la base principal de infraestructura pública estructurada."
  },
  {
    metric: "Gimnasios y centros privados",
    layer: "real",
    source: "DENUE / SCIAN 713943, 713941 y 611621",
    coverage: "Oferta privada observable por unidad económica",
    note: "Se reconoce cobertura real, pero no acceso universal."
  },
  {
    metric: "Parques y áreas verdes",
    layer: "real",
    source: "Inventario de áreas verdes / espacio público CDMX",
    coverage: "Espacio público utilizable para activación física",
    note: "La existencia no garantiza uso; depende de seguridad, iluminación y movilidad."
  },
  {
    metric: "Actividad física",
    layer: "estimado",
    source: "MOPRADEF 2024-2025",
    coverage: "Benchmark oficial agregado; territorialización por alcaldía modelada",
    note: "2025 tiene quiebre metodológico. 2026 se presenta como proyección."
  },
  {
    metric: "Obesidad, sobrepeso y diabetes",
    layer: "estimado",
    source: "ENSANUT Continua 2022",
    coverage: "Base oficial de salud con bajada territorial estimada",
    note: "No existe publicación oficial directa por alcaldía para estas prevalencias."
  },
  {
    metric: "Índice de riesgo físico",
    layer: "insight",
    source: "Derivado del modelo Deporte CDMX",
    coverage: "Score territorial compuesto",
    note: "Combina actividad, carga de salud y cobertura de infraestructura."
  },
  {
    metric: "Infraestructura detallada",
    layer: "real",
    source: "Consolidación por tipo desde PILARES, deportivos públicos, DENUE y espacios abiertos",
    coverage: "Detalle por alcaldía y tipo de espacio",
    note: "Incluye deportes disponibles y capacidad estimada cuando no existe aforo oficial."
  },
  {
    metric: "Mapa territorial",
    layer: "insight",
    source: "Modelo de mapa listo para alcaldías",
    coverage: "Actividad, riesgo e infraestructura por alcaldía",
    note: "Listo para choropleth o heatmap cuando se conecte geometría oficial."
  }
];

export const methodologyEntries: MethodologyEntry[] = [
  {
    module: "Actividad",
    metric: "% población activa",
    layer: "estimado",
    source: "MOPRADEF 2024-2025",
    logic: "Se ancla a benchmarks oficiales por sexo y edad y se ajusta con cobertura territorial ponderada.",
    limitation: "No sustituye una estimación SAE o MRP con microdatos y ponderadores oficiales."
  },
  {
    module: "Infraestructura",
    metric: "Conteo de espacios por tipo",
    layer: "real",
    source: "PILARES, deportivos públicos, DENUE e inventarios de áreas verdes",
    logic: "Se consolida por alcaldía y se transforma en densidad por 100 mil habitantes.",
    limitation: "Falta ETL puntual con georreferencia y fecha de corte por recurso."
  },
  {
    module: "Salud",
    metric: "Obesidad, sobrepeso, diabetes, sedentarismo",
    layer: "estimado",
    source: "ENSANUT 2022 + reglas de segmentación",
    logic: "Se usa ENSANUT 2022 como base oficial y se distribuye por sexo y grupo de edad.",
    limitation: "La territorialización es analítica y no corresponde a una publicación oficial por alcaldía."
  },
  {
    module: "Riesgo",
    metric: "Índice de riesgo físico",
    layer: "insight",
    source: "Modelo compuesto Deporte CDMX",
    logic: "Score = actividad física inversa + obesidad + sedentarismo + infraestructura per cápita inversa.",
    limitation: "Es un indicador de priorización institucional, no un diagnóstico clínico ni epidemiológico."
  },
  {
    module: "Infraestructura detallada",
    metric: "Espacios, deportes disponibles y capacidad",
    layer: "real",
    source: "Capas de infraestructura pública y privada consolidadas",
    logic: "Se resume la oferta por tipo de espacio; la capacidad se estima cuando no hay aforo operativo oficial.",
    limitation: "Falta integración a nivel de sede con inventario nominal definitivo."
  },
  {
    module: "Mapa",
    metric: "Modelo por alcaldía",
    layer: "insight",
    source: "Dataset preparado para mapa institucional",
    logic: "Cada alcaldía incluye `geoKey`, centroide, actividad, riesgo e infraestructura para futura capa espacial.",
    limitation: "No incluye aún geometría oficial embebida ni rendering cartográfico."
  },
  {
    module: "Serie temporal",
    metric: "Comparación 2024, 2025 y 2026",
    layer: "proyectado",
    source: "MOPRADEF 2024-2025 + proyección de continuidad 2026",
    logic: "2026 prolonga el patrón más reciente con supuestos conservadores.",
    limitation: "2026 no es un dato observado; debe leerse solo como escenario de planeación."
  }
];

export const qualityChecks: QualityEntry[] = [
  {
    check: "Homologación territorial",
    scope: "16 alcaldías",
    status: "OK",
    note: "Se usa catálogo único para nombres de alcaldía."
  },
  {
    check: "Separación de capas",
    scope: "Infraestructura, salud, actividad e insights",
    status: "OK",
    note: "Cada bloque declara si el dato es real, estimado, preparado o insight derivado."
  },
  {
    check: "Quiebre metodológico 2025",
    scope: "Serie de actividad física",
    status: "ATENCION",
    note: "La comparación interanual requiere nota visible por cambio metodológico de MOPRADEF."
  },
  {
    check: "Base de salud",
    scope: "ENSANUT 2022",
    status: "ATENCION",
    note: "La salud no debe presentarse como medición oficial directa por alcaldía."
  },
  {
    check: "Timeline ampliado",
    scope: "2020-2026",
    status: "ATENCION",
    note: "2020-2023 y 2026 deben mostrarse como preparados o proyectados según el caso."
  }
];

export const executiveInsights: InsightEntry[] = [
  {
    title: "La brecha de género persiste, pero se estrecha",
    summary: "La actividad física femenina sigue por debajo de la masculina incluso en el mejor escenario del corte 2025.",
    implication: "Conviene priorizar oferta cercana, segura y compatible con tiempos de cuidado y trabajo."
  },
  {
    title: "Más infraestructura no garantiza más actividad por sí sola",
    summary: "La cobertura territorial ayuda, pero el uso depende de accesibilidad, seguridad y hábitos.",
    implication: "La inversión en espacio debe acompañarse de programación, activación y mantenimiento."
  },
  {
    title: "El riesgo territorial se concentra donde coinciden tres rezagos",
    summary: "Menor actividad, mayor carga metabólica y cobertura limitada elevan el score de riesgo físico.",
    implication: "Esas alcaldías deben ser la prioridad de activación comunitaria y mantenimiento deportivo."
  }
];
