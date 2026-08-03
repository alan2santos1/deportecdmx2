import { officialSourceConfig } from "../official-source-config";
import type { InfrastructureLayerDescriptor } from "./types";

const sourceConfig = officialSourceConfig;

export const infrastructureLayerRegistry: InfrastructureLayerDescriptor[] = [
  {
    key: "pilares",
    label: "PILARES",
    version: "infra-v1-2026-08-03",
    enabledByDefault: true,
    status: "activa",
    dataType: "real",
    qualityGrade: "B",
    layerKind: "infraestructura_comunitaria",
    coverageLevel: "nominal_cdmx",
    methodology: "Integración nominal por sede desde CSV oficial histórico; no infiere amenidades ni operación vigente por sede.",
    provenance: {
      institution: "Gobierno de la Ciudad de México / Datos Abiertos CDMX",
      sourceType: "dataset_oficial",
      sourceUrl: sourceConfig.pilares.url,
      localPath: sourceConfig.pilares.localPath,
      sourceDate: "2021-11-08",
      asOfDate: "2021-11-08",
      referencePeriod: "Corte histórico publicado en 2021",
      methodology: "Conteo nominal por sede con georreferencia y estatus histórico.",
      coverage: "CDMX nominal por sede",
      provenanceNote: "Se integra como línea base histórica útil, no como inventario operativo vigente 2026."
    }
  },
  {
    key: "utopias",
    label: "UTOPÍAs",
    version: "infra-v1-2026-08-03",
    enabledByDefault: true,
    status: "activa",
    dataType: "real",
    qualityGrade: "B",
    layerKind: "infraestructura_publica",
    coverageLevel: "parcial_cdmx",
    methodology: "Inventario institucional curado por sede y estatus, sin inferir amenidades ni disciplinas internas.",
    provenance: {
      institution: "Investigación institucional Deporte CDMX",
      sourceType: "investigacion_curada",
      localPath: "data/processed/infrastructure/utopias.json",
      sourceDate: "2026-08-02",
      asOfDate: "2026-08-03",
      referencePeriod: "Verificación documental 2026",
      methodology: "Consolidación curada de sedes defendibles con alias y estatus institucional.",
      coverage: "Bloque institucional parcial por sede",
      provenanceNote: "Capa real institucional por sede documentada, todavía no respaldada por un dataset abierto único canónico."
    }
  },
  {
    key: "publicSports",
    label: "Deportivos Públicos",
    version: "infra-v1-2026-08-03",
    enabledByDefault: true,
    status: "activa",
    dataType: "real",
    qualityGrade: "B",
    layerKind: "infraestructura_publica",
    coverageLevel: "nominal_cdmx",
    methodology: "Integración nominal por instalación desde dataset oficial; no resuelve amenidades exhaustivas ni condición operativa.",
    provenance: {
      institution: "INDEPORTE / Datos Abiertos CDMX",
      sourceType: "dataset_oficial",
      sourceUrl: sourceConfig.publicSports.url,
      localPath: sourceConfig.publicSports.localPath,
      sourceDate: "2021-09-25",
      asOfDate: "2021-09-25",
      referencePeriod: "Corte operativo publicado en 2021",
      methodology: "Conteo nominal por instalación y alcaldía normalizada.",
      coverage: "CDMX nominal por instalación",
      provenanceNote: "Es una fuente oficial útil, pero parcial y antigua para lectura operativa vigente."
    }
  },
  {
    key: "parks",
    label: "Parques",
    version: "infra-v1-2026-08-03",
    enabledByDefault: false,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "C",
    layerKind: "espacio_publico",
    coverageLevel: "pendiente_integracion",
    methodology: "Pendiente integrar inventario nominal trazable de parques y áreas verdes.",
    provenance: {
      institution: "IPDP / SEDEMA / Datos Abiertos CDMX",
      sourceType: "placeholder_arquitectonico",
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Pendiente",
      methodology: "La arquitectura queda lista para capas nominales o geográficas de espacio público.",
      coverage: "Pendiente",
      provenanceNote: "No integra datos todavía; prepara la capa desacoplada para futura conexión oficial."
    }
  },
  {
    key: "bosques",
    label: "Bosques",
    version: "infra-v1-2026-08-03",
    enabledByDefault: false,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "C",
    layerKind: "espacio_publico",
    coverageLevel: "pendiente_integracion",
    methodology: "Pendiente fuente nominal o geográfica defendible por polígono, acceso y uso potencial.",
    provenance: {
      institution: "SEDEMA / Gobierno CDMX",
      sourceType: "placeholder_arquitectonico",
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Pendiente",
      methodology: "Reservado para capa territorial de bosques y áreas naturales accesibles.",
      coverage: "Pendiente",
      provenanceNote: "No integra datos todavía."
    }
  },
  {
    key: "ciclovias",
    label: "Ciclovías",
    version: "infra-v1-2026-08-03",
    enabledByDefault: false,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "B",
    layerKind: "movilidad_activa",
    coverageLevel: "pendiente_integracion",
    methodology: "Preparada para integrar segmentos, longitud, estado y accesibilidad territorial sin inferir práctica deportiva.",
    provenance: {
      institution: "SEMOVI / Datos Abiertos CDMX",
      sourceType: "placeholder_arquitectonico",
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Pendiente",
      methodology: "La capa debe integrarse como movilidad activa observada, no como deporte practicado.",
      coverage: "Pendiente",
      provenanceNote: "Preparada para futura ingestión desacoplada."
    }
  },
  {
    key: "ecobici",
    label: "Ecobici",
    version: "infra-v1-2026-08-03",
    enabledByDefault: false,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "B",
    layerKind: "movilidad_activa",
    coverageLevel: "pendiente_integracion",
    methodology: "Preparada para integrar estaciones, bicicletas y cobertura operativa del sistema, sin extrapolar a todo el ciclismo de CDMX.",
    provenance: {
      institution: "SEMOVI / Ecobici",
      sourceType: "placeholder_arquitectonico",
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Pendiente",
      methodology: "La capa debe conservar unidad de observación propia: estación, viaje o sistema.",
      coverage: "Pendiente",
      provenanceNote: "Preparada para integración futura sin contaminar otras capas."
    }
  },
  {
    key: "trotapistas",
    label: "Trotapistas",
    version: "infra-v1-2026-08-03",
    enabledByDefault: false,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "C",
    layerKind: "espacio_publico",
    coverageLevel: "pendiente_integracion",
    methodology: "Pendiente inventario defendible por instalación o trazo.",
    provenance: {
      institution: "Fuente oficial por definir",
      sourceType: "placeholder_arquitectonico",
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Pendiente",
      methodology: "Se integra como capa deportiva específica solo cuando exista evidencia nominal o geográfica suficiente.",
      coverage: "Pendiente",
      provenanceNote: "No integra datos todavía."
    }
  },
  {
    key: "skateparks",
    label: "Skateparks",
    version: "infra-v1-2026-08-03",
    enabledByDefault: false,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "C",
    layerKind: "infraestructura_publica",
    coverageLevel: "pendiente_integracion",
    methodology: "Pendiente capa nominal o geográfica específica sin inferir práctica espontánea.",
    provenance: {
      institution: "Fuente oficial por definir",
      sourceType: "placeholder_arquitectonico",
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Pendiente",
      methodology: "La unidad de observación debe ser activo físico o amenidad documentada.",
      coverage: "Pendiente",
      provenanceNote: "No integra datos todavía."
    }
  },
  {
    key: "privateClubs",
    label: "Clubes privados",
    version: "infra-v1-2026-08-03",
    enabledByDefault: false,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "D",
    layerKind: "infraestructura_privada",
    coverageLevel: "pendiente_integracion",
    methodology: "Se poblará desde DENUE o directorios verificables cuando el extracto preserve SCIAN defendible.",
    provenance: {
      institution: "INEGI / DENUE",
      sourceType: "placeholder_arquitectonico",
      sourceUrl: sourceConfig.denue.url,
      localPath: sourceConfig.denue.localPath,
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Pendiente extracto verificable",
      methodology: "Debe distinguir registros verificados por SCIAN de candidatos textuales.",
      coverage: "Pendiente",
      provenanceNote: "No integra nuevos datos; prepara la capa privada desacoplada."
    }
  },
  {
    key: "universities",
    label: "Universidades",
    version: "infra-v1-2026-08-03",
    enabledByDefault: false,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "C",
    layerKind: "academica",
    coverageLevel: "pendiente_integracion",
    methodology: "Reservada para infraestructura deportiva universitaria con reglas explícitas de acceso, cobertura y elegibilidad.",
    provenance: {
      institution: "Instituciones educativas / fuente oficial por definir",
      sourceType: "placeholder_arquitectonico",
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Pendiente",
      methodology: "No debe mezclarse con infraestructura pública abierta sin un campo de acceso y universo.",
      coverage: "Pendiente",
      provenanceNote: "No integra datos todavía."
    }
  },
  {
    key: "denue",
    label: "Infraestructura privada DENUE",
    version: "infra-v1-2026-08-03",
    enabledByDefault: true,
    status: "preparada",
    dataType: "preparado",
    qualityGrade: "D",
    layerKind: "infraestructura_privada",
    coverageLevel: "parcial_cdmx",
    methodology: "Clasificación por SCIAN verificable cuando exista; mientras tanto, solo como capa preparada y candidata.",
    provenance: {
      institution: "INEGI / DENUE CDMX",
      sourceType: "dataset_oficial",
      sourceUrl: sourceConfig.denue.url,
      localPath: sourceConfig.denue.localPath,
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Extracto local descargado",
      methodology: "Debe distinguir registros con SCIAN verificable de clasificaciones textuales auxiliares.",
      coverage: "CDMX por establecimiento, sujeto a calidad del extracto local",
      provenanceNote: "Con el corte local actual la capa no debe presentarse como universo privado definitivo."
    }
  },
  {
    key: "geometry",
    label: "Geometría de alcaldías",
    version: "infra-v1-2026-08-03",
    enabledByDefault: true,
    status: "activa",
    dataType: "real",
    qualityGrade: "A",
    layerKind: "territorial",
    coverageLevel: "nominal_cdmx",
    methodology: "Capa territorial canónica para `geoKey` y render local de mapa.",
    provenance: {
      institution: "Datos Abiertos CDMX / geometría oficial",
      sourceType: "dataset_oficial",
      localPath: sourceConfig.geometry.localPath,
      sourceDate: "2026-08-03",
      asOfDate: "2026-08-03",
      referencePeriod: "Geometría oficial local integrada",
      methodology: "Usa claves territoriales canónicas y no nombres textuales como fuente de verdad.",
      coverage: "16 alcaldías",
      provenanceNote: "No es una capa de infraestructura, pero sí un activo base del dominio territorial."
    }
  }
];

export const getInfrastructureLayerDescriptor = (key: string) =>
  infrastructureLayerRegistry.find((layer) => layer.key === key) ?? null;
