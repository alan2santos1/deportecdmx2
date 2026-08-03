# Integración oficial de infraestructura

## Estado al 2026-08-03

El Dashboard Institucional integra hoy tres grupos de capas:

1. Infraestructura nominal real
2. Oferta programada agregada
3. Capas preparadas o parciales pendientes de validación adicional

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
  - El corte local actual se clasifica como `preparado` porque el export descargado no expone SCIAN verificable en la salida usada por el proyecto y obliga a una clasificación textual auxiliar.
  - Regla crítica:
    - no presentar esta capa como conteo privado definitivo
    - no inferir disciplinas concretas solo desde SCIAN

## ETL mínimo reproducible

1. Descargar fuentes:
   - `node --import tsx scripts/etl/fetch-official-sources.ts`
2. Generar capa processed y dashboard:
   - `npm run data:build`

## Salidas generadas

- `data/processed/infrastructure/official-infrastructure.json`
- `data/processed/operacion/operacion-asistencia.json`
- `public/data/dashboard.json`

## Notas metodológicas

- Si la fuente oficial no trae alcaldía limpia, se normaliza con `normalize-alcaldia.ts`.
- Si la fuente no publica aforo/capacidad, el sistema deja `capacityType = estimada`.
- PILARES y Deportivos Públicos entran hoy como integración nominal real.
- La geometría oficial ya entra al mapa institucional sin depender de APIs externas.
- DENUE ya entra al processed, pero debe seguir marcado como `preparado` hasta validar un extracto con SCIAN verificable.
- La oferta programada se deriva de mallas operativas reales, pero solo se publica en forma agregada dentro del dashboard institucional.
- El dashboard no expone nombres de personal ni otras columnas nominales de Operación para esta capa.
