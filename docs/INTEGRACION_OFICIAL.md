# Integración oficial de infraestructura

## Estado al 2026-08-07

El Dashboard Institucional integra hoy tres grupos de capas:

1. Infraestructura nominal real
2. Oferta programada agregada
3. Capas preparadas o parciales pendientes de validación adicional

Desde el Sprint D1.3 se agrega además una capa separada de:

4. Espacio público y áreas verdes documentadas

## Fuentes conectadas

- PILARES
  - CSV oficial descargado en `data/raw/external/pilares.csv`
  - Configuración en `data/models/integration/official-source-config.ts`
- Deportivos públicos
  - CSV oficial descargado en `data/raw/external/deportivos_publicos.csv`
  - Configuración en `data/models/integration/official-source-config.ts`
- Geometría de alcaldías
  - GeoJSON oficial descargado en `data/raw/external/alcaldias.geojson`
  - Conversión a SVG path en `data/models/integration/build-map-geometry.ts`
  - Conectado al dashboard mediante `geoKey`
- Áreas verdes
  - GeoJSON oficial descargado en `data/raw/external/green_areas_cdmx.geojson`
  - Diccionario descargado en `data/raw/external/green_areas_cdmx_dictionary.csv`
  - Builder dedicado: `data/models/integration/build-public-space-layer.ts`
  - Dataset procesado: `data/processed/infrastructure/public-space.json`
  - Estatus: `real`, separado de infraestructura deportiva
- Espacio público
  - ZIP oficial descargado en `data/raw/external/public_space_cdmx.zip`
  - Diccionario descargado en `data/raw/external/public_space_cdmx_dictionary.csv`
  - Builder dedicado: `data/models/integration/build-public-space-layer.ts`
  - Estatus: `conectado, no integrado`
  - Regla crítica:
    - no entra al dashboard nominal mientras el recurso descargable no exponga atributos defendibles por registro
- UTOPÍAs
  - Catálogo base manual: `data/raw/manual/utopias-base-catalog.json`
  - Evidencia oficial manual: `data/raw/manual/utopias-evidencias-oficiales.json`
  - Builder dedicado: `data/models/integration/build-utopias-layer.ts`
  - Dataset procesado: `data/processed/infrastructure/utopias.json`
  - Dataset público UI: `public/data/utopias.json`
  - Estatus: `real`
  - Reglas críticas:
    - separar `projectStatus`, `openingStatus` y `operationalStatus`
    - no contar proyectos anunciados o en construcción como infraestructura actual disponible
    - no inferir amenidades ni disciplinas sin evidencia oficial explícita
    - conservar aliases, historial y evidencia por sede

## Oferta programada agregada conectada

- PILARES
  - Fuente canónica: `docs/fuentes-operativas/ACUMULADA PILARES ABRIL 26 GDE.xlsx`
  - Hoja integrada para dashboard: `abril`
  - Uso en dashboard: oferta programada agregada por alcaldía, disciplina, día y canal
  - Estatus: `real`

- Ponte Pila
  - Fuente canónica: `docs/fuentes-operativas/MALLA-HORARIA-DPP-PPP-JUL2026 SPPA.xlsx`
  - Hojas integradas para dashboard:
    - `MALLA HORARIA PUNTOS PONTE PILA`
    - `MALLA HORARIA GENERAL ESCUELAS`
  - Uso en dashboard: oferta programada agregada por alcaldía, disciplina, día y canal
  - Estatus: `real`

Regla metodológica:
- estas mallas solo alimentan **oferta programada**
- no alimentan participación observada
- no alimentan preferencias declaradas
- no alimentan demanda revelada

## Fuentes preparadas o parcialmente integradas

- DENUE / SCIAN
  - Configuración y descarga listas en `data/models/integration/official-source-config.ts`
  - Archivo local: `data/raw/external/denue_cdmx.geojson`
  - Códigos objetivo:
    - `713941` clubes deportivos del sector privado
    - `713942` clubes deportivos del sector público o mixto
    - `713943` centros de acondicionamiento físico del sector privado
    - `713944` balnearios o infraestructura acuática del sector público o mixto
    - `611621` escuelas de deporte del sector privado
    - `611622` escuelas de deporte del sector público o mixto
  - El corte local actual se clasifica como `preparado` porque el export descargado no expone SCIAN verificable en la salida usada por el proyecto.
  - Regla crítica:
    - no presentar esta capa como conteo privado definitivo
    - no clasificar por nombre comercial, actividad textual o NLP
    - no inferir disciplinas concretas solo desde SCIAN

## Capa operativa documental de Canchas

- Fuente administrativa principal:
  - `docs/fuentes-operativas/13-03-2026-Proyecto_500_canchas_PILARES_ASIGNADO 315 mallas arquitecto.xlsx`
- Evidencia oficial complementaria:
  - `data/raw/manual/canchas-evidencias-oficiales.json`
- Salida procesada:
  - `data/processed/canchas/canchas-operativas.json`

Reglas vigentes:
- el Excel sigue siendo el padrón administrativo principal;
- la apertura, entrega u obra no se confirman por fecha del Excel ni por comunicados agregados;
- solo se publican como confirmadas cuando existe evidencia oficial conciliada individualmente;
- si no hay match individual, el registro queda como `sin_confirmacion_publica` o `sin_confirmacion`;
- los anuncios agregados del programa sirven como contexto documental, no como validación masiva de las 315 filas.

## ETL mínimo reproducible

1. Descargar fuentes:
   - `node --import tsx scripts/etl/fetch-official-sources.ts`
2. Generar capa processed y dashboard:
   - `npm run data:build`

## Salidas generadas

- `data/processed/infrastructure/official-infrastructure.json`
- `data/processed/infrastructure/utopias.json`
- `data/processed/operacion/operacion-asistencia.json`
- `public/data/dashboard.json`

## Notas metodológicas

- Si la fuente oficial no trae alcaldía limpia, se normaliza con `normalize-alcaldia.ts`.
- Si la fuente no publica aforo/capacidad, el sistema deja `capacityType = estimada`.
- PILARES y Deportivos Públicos entran hoy como integración nominal real.
- La geometría oficial ya entra al mapa institucional sin depender de APIs externas.
- DENUE ya entra al processed, pero debe seguir marcado como `preparado` hasta validar un extracto con SCIAN verificable.
- UTOPÍAs ya cuentan con una capa nominal versionada por sede; el dashboard territorial solo suma como infraestructura actual las sedes con apertura u operación físicamente verificable al viernes 7 de agosto de 2026.
- La oferta programada se deriva de mallas operativas reales, pero solo se publica en forma agregada dentro del dashboard institucional.
- El dashboard no expone nombres de personal ni otras columnas nominales de Operación para esta capa.
- La capa de áreas verdes no se suma a totales administrativos de infraestructura deportiva.
- El espacio público y las áreas verdes solo publican categorías explícitas de la fuente; no infieren canchas, amenidades ni práctica física.
