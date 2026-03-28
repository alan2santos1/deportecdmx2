import type { InsightEntry, MethodologyEntry, QualityEntry, SourceRegistryEntry } from "../../lib/dashboard-types";

export const sourceRegistry: SourceRegistryEntry[] = [
  {
    metric: "PILARES",
    layer: "real",
    source: "Datos Abiertos CDMX / Ubicación y estatus de PILARES",
    coverage: "Infraestructura comunitaria observable por sede",
    note: "El conteo real se reporta por sede. Cualquier capa de espacios operativos o capacidad debe leerse como estimación analítica."
  },
  {
    metric: "Deportivos públicos",
    layer: "real",
    source: "Datos Abiertos CDMX / Deportivos públicos",
    coverage: "Instalaciones deportivas públicas observables",
    note: "El registro administrativo se reporta por instalación; la capacidad o espacios operativos se estiman aparte."
  },
  {
    metric: "UTOPÍAs",
    layer: "real",
    source: "docs/investigacion_actual.md",
    coverage: "Bloque institucional real por sede documentada",
    note: "Se integran como capa institucional real. No se infieren amenidades ni disciplinas por sede cuando la investigación vigente no las documenta."
  },
  {
    metric: "Gimnasios y centros privados",
    layer: "preparado",
    source: "DENUE CDMX descargado + clasificación textual compatible con SCIAN objetivo",
    coverage: "Oferta privada preparada por unidad económica y alcaldía",
    note: "Mientras el export no exponga SCIAN verificable, la capa privada debe leerse como preparada y no como conteo oficial definitivo."
  },
  {
    metric: "Clubes y academias privadas",
    layer: "preparado",
    source: "DENUE CDMX descargado + clasificación textual por nombre/actividad",
    coverage: "Subtipos privados compatibles con el dashboard ejecutivo",
    note: "Se distinguen gimnasios, clubes y academias sin mezclarlos con infraestructura pública, pero no equivalen a una clasificación oficial por SCIAN verificada."
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
    layer: "insight",
    source: "Consolidación por tipo desde PILARES, UTOPÍAs, deportivos públicos, DENUE y espacios abiertos",
    coverage: "Detalle por alcaldía y tipo de espacio",
    note: "Combina registros reales, preparados y capacidad estimada cuando no existe aforo oficial. Las disciplinas solo se muestran cuando están documentadas de forma explícita."
  },
  {
    metric: "Mapa territorial",
    layer: "insight",
    source: "GeoJSON oficial de alcaldías + modelo territorial Deporte CDMX",
    coverage: "Actividad, riesgo e infraestructura por alcaldía",
    note: "La geometría ya está integrada; actividad y riesgo siguen dependiendo de capas estimadas o de insight."
  },
  {
    metric: "Canchas / operación territorial",
    layer: "real",
    source: "Excel operativo 500 Canchas PILARES asignado",
    coverage: "Canchas nominales con capa administrativa multi-hoja",
    note: "Es una base operativa real. Los estatus de inauguración y completitud se derivan de la información capturada y no del color visual del archivo."
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
    source: "PILARES, UTOPÍAs, deportivos públicos, DENUE e inventarios de áreas verdes",
    logic: "La gráfica principal consolida conteos administrativos de sedes, instalaciones o establecimientos y los transforma en densidad por 100 mil habitantes.",
    limitation: "No debe mezclarse con espacios operativos o capacidad estimada. La infraestructura privada descargada desde DENUE sigue preparada hasta validar SCIAN y fecha de corte con un extracto más robusto."
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
    layer: "insight",
    source: "Capas de infraestructura pública y privada consolidadas",
    logic: "Se distinguen conteo administrativo real, espacios operativos estimados y capacidad estimada cuando no hay aforo oficial. Las disciplinas solo se marcan si la fuente las documenta explícitamente.",
    limitation: "La mezcla de capas reales y preparadas obliga a conservar visible el tipo de dato en cada lectura. La ausencia de una disciplina no equivale a ausencia real de oferta."
  },
  {
    module: "Mapa",
    metric: "Modelo por alcaldía",
    layer: "insight",
    source: "GeoJSON oficial de alcaldías + dataset territorial Deporte CDMX",
    logic: "Cada alcaldía incluye geometría SVG, `geoKey`, actividad, riesgo e infraestructura para choropleth institucional sin APIs externas.",
    limitation: "La geometría es oficial, pero la métrica visualizada depende de la capa seleccionada: real, preparada, estimada o insight."
  },
  {
    module: "Canchas",
    metric: "Operación territorial de canchas",
    layer: "real",
    source: "Excel operativo 500 Canchas (Base, Alc Dic, AlcFeb, Hoja 2, Hoja 1)",
    logic: "Base prioriza operación administrativa; Alc Dic, AlcFeb y Hoja 2 complementan tipo, material, origen, coordenadas, distancia territorial y avance; Hoja 1 enriquece datos institucionales de PILARES cuando el match es posible.",
    limitation: "No todos los registros tienen coordenadas exactas. El mapa distingue coordenada real, aproximación por PILARES, aproximación por alcaldía y ausencia total de coordenada. Los estatus de inauguración y completitud son derivados por reglas transparentes sobre fecha, figura educativa, teléfono, horario y actividades."
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
  },
  {
    check: "Capa privada DENUE",
    scope: "Infraestructura económica",
    status: "ATENCION",
    note: "La clasificación privada usa heurísticas textuales porque el export descargado no trae SCIAN verificable en la salida usada por este MVP."
  },
  {
    check: "Disciplinas y amenidades",
    scope: "Infraestructura pública, UTOPÍAs y DENUE",
    status: "ATENCION",
    note: "Las disciplinas siguen subrepresentadas cuando la fuente no las explicita. El dashboard ya evita inferencias automáticas y marca esos casos como no documentados o subrepresentados."
  },
  {
    check: "Separación sede vs espacio operativo",
    scope: "PILARES y capas con capacidad analítica",
    status: "OK",
    note: "El dashboard separa conteo administrativo real de espacios operativos estimados para evitar interpretaciones institucionales erróneas."
  },
  {
    check: "Integración operativa Canchas",
    scope: "Base administrativa multi-hoja",
    status: "OK",
    note: "La sección operativa usa el Excel real como fuente principal y deja visible cuándo faltan coordenadas, figura educativa, horario o actividades."
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
