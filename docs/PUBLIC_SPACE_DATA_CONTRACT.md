# Public Space Data Contract

## Estado
- Fecha de actualización: 2026-08-06
- Sprint: D1.3
- Dominio: espacio público y áreas verdes

## Objetivo
Definir el contrato técnico y metodológico para integrar capas oficiales de espacio público y áreas verdes sin mezclarlas con infraestructura deportiva, oferta programada o práctica física observada.

## Fuentes conectadas

### 1. Inventario de Áreas Verdes
- Fuente oficial: Portal de Datos Abiertos CDMX
- Institución reportada: Instituto de Planeación Democrática y Prospectiva
- Dataset: `Inventario de Áreas Verdes`
- Recurso integrado: `data/raw/external/green_areas_cdmx.geojson`
- Diccionario descargado: `data/raw/external/green_areas_cdmx_dictionary.csv`
- Fecha de publicación del dataset visible en la fuente: 2023-02-15
- Fecha de descarga auditada en el proyecto: 2026-08-06
- Estado: `integrada`

### 2. Espacio público de la Ciudad de México
- Fuente oficial: Portal de Datos Abiertos CDMX
- Institución reportada: Instituto de Planeación Democrática y Prospectiva
- Dataset: `Espacio público de la Ciudad de México`
- Recurso descargado: `data/raw/external/public_space_cdmx.zip`
- Diccionario descargado: `data/raw/external/public_space_cdmx_dictionary.csv`
- Fecha de publicación del dataset visible en la fuente: 2023-03-30
- Fecha de descarga auditada en el proyecto: 2026-08-06
- Estado: `conectada, no integrada`

## Unidad de observación

### Green areas
- Unidad principal: `greenAreaRecord`
- Naturaleza: polígono o geometría oficial de área verde
- No equivale a:
  - infraestructura deportiva;
  - amenidades;
  - acceso público efectivo;
  - uso;
  - mantenimiento;
  - práctica física observada.

### Public space
- Unidad prevista: `publicSpaceRecord`
- Naturaleza esperada: registro geoespacial oficial de espacio público
- Estado actual:
  - el recurso descargable auditado el 2026-08-06 no expone atributos nominales suficientes en el corte disponible para integrarlo con trazabilidad equivalente a la capa de áreas verdes.

## Campos obligatorios por registro
- `id`
- `sourceLayer`
- `sourceId`
- `originalName`
- `normalizedName`
- `originalCategory`
- `normalizedCategory`
- `originalSubcategory`
- `geometryType`
- `geometry`
- `centroid`
- `alcaldia`
- `colonia`
- `areaSquareMeters`
- `sourceInstitution`
- `sourceDataset`
- `sourceDate`
- `publicationDate`
- `version`
- `license`
- `dataType`
- `qualityGrade`
- `coverageLevel`
- `methodology`
- `provenance`
- `verificationStatus`
- `deduplicationStatus`
- `duplicateGroupId`
- `spatialOverlapRatio`
- `reconciliationNotes`

## Categorización permitida
La normalización solo puede salir de categorías explícitas de la fuente.

### Categorías normalizadas activas en el sprint D1.3
- `camellón`
- `área verde`
- `parque`
- `plaza`
- `instalación recreativa o deportiva`
- `otro espacio público`

## Reglas metodológicas no negociables
- No inferir que un parque implica infraestructura deportiva.
- No inferir running, caminata, ciclismo, recreación o seguridad a partir de la geometría.
- No inferir amenidades, canchas, equipamiento, horarios, capacidad ni usuarios.
- No presentar centroides derivados como punto exacto de acceso.
- No sumar polígonos de áreas verdes a totales administrativos de sedes, instalaciones o establecimientos.
- No mezclar `greenAreaRecord` con `publicSpaceRecord` como si fueran la misma unidad.

## Deduplificación y conciliación
- La deduplicación es conservadora.
- Solo se marca `nombre_repetido` cuando existe nombre normalizado comparable dentro de la misma alcaldía y categoría.
- El sistema no elimina automáticamente registros repetidos.
- `spatialOverlapRatio` queda preparado para conciliación futura y hoy puede ser `null`.

## Calidad y cobertura

### Green areas
- `dataType`: `real`
- `qualityGrade`: `B`
- `coverageLevel`: `parcial`
- Justificación:
  - la geometría y los registros son oficiales;
  - la alcaldía se deriva por centroide y contención espacial cuando la fuente no la publica limpia;
  - no existe todavía conciliación nominal contra otras capas de espacio público.

### Public space
- `dataType`: `preparado`
- `qualityGrade`: `D`
- `coverageLevel`: `no_disponible`
- Justificación:
  - el recurso descargable auditado no expone atributos suficientes en el corte disponible para integración nominal defendible.

## KPIs permitidos
- total de registros de áreas verdes integrados;
- superficie total documentada;
- distribución por alcaldía;
- distribución por categoría normalizada;
- estado de integración por fuente;
- calidad y fecha de corte.

## KPIs prohibidos en esta capa
- usuarios;
- visitas;
- aforo;
- participación;
- demanda;
- seguridad;
- mantenimiento;
- capacidad deportiva;
- número de canchas o amenidades no documentadas.

## Salidas del sprint D1.3
- `data/processed/infrastructure/public-space.json`
- `public/data/public-space.json`
- `public/data/dashboard.json` con `publicSpaceSummary`

## Nota institucional obligatoria
“Esta capa representa registros y polígonos de espacio público o áreas verdes documentados por fuentes oficiales. No acredita por sí sola infraestructura deportiva, amenidades, acceso, uso, mantenimiento ni práctica física.”
