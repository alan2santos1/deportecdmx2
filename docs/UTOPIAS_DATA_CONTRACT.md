# UTOPIAS Data Contract

## Estado del documento
- Tipo: contrato técnico y metodológico de la capa UTOPÍAs
- Fecha de actualización: 2026-08-07
- Fuente de autoridad: evidencia oficial institucional conciliada por sede

## Unidad de observación
- La unidad de observación es la **sede / proyecto UTOPÍA**.
- No es una amenidad.
- No es una disciplina.
- No es una actividad.
- No es un polígono de espacio público.

## Estructura mínima por sede
Cada registro debe conservar como mínimo:
- `utopiaId`
- `canonicalName`
- `sourceName`
- `alcaldia`
- `address`
- `coordinates`
- `coordinateStatus`
- `utopiaType`
- `surfaceM2`
- `operator`
- `projectStatus`
- `openingStatus`
- `operationalStatus`
- `openingDate`
- `lastVerifiedAt`
- `sourceDate`
- `sourceInstitution`
- `evidenceIds`
- `qualityGrade`
- `coverageLevel`
- `verificationStatus`
- `originalSourceFields`

## Jerarquía de estatus

### 1. `projectStatus`
- `anunciada`
- `planeacion`
- `construccion`
- `terminacion`
- `terminada`
- `sin_documentar`

### 2. `openingStatus`
- `no_inaugurada`
- `inaugurada_confirmada`
- `fecha_anunciada`
- `sin_confirmacion`
- `contradiccion`

### 3. `operationalStatus`
- `operando_confirmado`
- `operacion_no_documentada`
- `temporalmente_cerrada`
- `cierre_confirmado`
- `desconocido`

## Tipología estructural
- `territorial`
- `historica_iztapalapa`
- `espacio_publico_elevado`
- `proyecto_multisitio`
- `otro_documentado`

Reglas:
- `espacio_publico_elevado` se documenta en catálogo y puede aparecer en lectura territorial cualitativa, pero no entra automáticamente al KPI principal de UTOPÍAs territoriales.
- `historica_iztapalapa` conserva el bloque legacy de Iztapalapa separado de la nueva generación.
- `proyecto_multisitio` evita tratar como sede única un anuncio distribuido en varios predios.

## Reglas críticas de conciliación
- `terminada` no implica `inaugurada_confirmada`.
- `inaugurada_confirmada` no implica `operando_confirmado`.
- Un proyecto anunciado no entra al total de infraestructura actual.
- Una UTOPÍA en construcción no entra al total de infraestructura actual.
- La capa territorial del dashboard solo cuenta como infraestructura actual las sedes con evidencia física defendible de apertura u operación.

## Evidencia

### Archivo canónico
- `data/raw/manual/utopias-evidencias-oficiales.json`

### Campos mínimos por evidencia
- `evidenceId`
- `utopiaId`
- `utopiaName`
- `sourceInstitution`
- `title`
- `sourceUrl`
- `publicationDate`
- `effectiveDate`
- `evidenceType`
- `statusSupported`
- `amenityClaims`
- `activityClaims`
- `coordinates`
- `surfaceM2`
- `notes`
- `capturedAt`

### Fuentes permitidas
- Jefatura de Gobierno CDMX
- SOBSE CDMX
- Capital 21 CDMX
- Cine en la Ciudad CDMX
- otros operadores institucionales documentados en la investigación vigente

## Amenidades

### Regla
- Una amenidad solo existe si una fuente oficial la documenta explícitamente.
- La amenidad se guarda separada de la sede.
- La amenidad no crea por sí sola una disciplina.

### Campos
- `amenityId`
- `utopiaId`
- `originalLabel`
- `normalizedAmenity`
- `category`
- `evidenceId`
- `verificationStatus`
- `sourceDate`

## Actividades y disciplinas

### Regla
- Una disciplina o actividad solo existe si la fuente la nombra explícitamente.
- No se infiere disciplina desde canchas, albercas, gimnasios o pistas.
- No se mezcla esta capa con mallas PILARES / Ponte Pila.

### Campos
- `activityId`
- `utopiaId`
- `originalLabel`
- `normalizedDiscipline`
- `context`
- `evidenceId`
- `sourceDate`

## Quality grades
- `A`: sede con evidencia oficial reciente, estatus defendible y amenidades o superficie documentadas.
- `B`: sede con evidencia oficial suficiente para nombre, alcaldía y estatus principal.
- `C`: sede con evidencia institucional parcial o solo de anuncio/planeación.
- `D`: sede sin soporte suficiente para publicarse como capa vigente.

## Cobertura
- La capa es institucional y parcial.
- No existe todavía un dataset abierto único, canónico y completo de UTOPÍAs para toda la ciudad.
- La capa se mantiene mediante conciliación manual reproducible con evidencia oficial.

## Actualización
- El builder canónico es `data/models/integration/build-utopias-layer.ts`.
- La salida procesada es `data/processed/infrastructure/utopias.json`.
- La salida pública para UI es `public/data/utopias.json`.
- Toda actualización debe conservar aliases, historial de cambios y evidencia por sede.

## Limitaciones
- La capa no publica usuarios, aforo, asistencia, capacidad real ni uso observado.
- La mayoría de sedes no tiene coordenadas oficiales verificadas en esta iteración.
- Las amenidades verificadas siguen siendo parciales y concentradas en boletines de inauguración 2026.
- El directorio institucional prueba operación vigente de ciertas sedes, pero no su inventario completo de amenidades.
