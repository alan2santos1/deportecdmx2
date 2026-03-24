# Integración oficial de infraestructura

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

## Fuentes preparadas o parcialmente integradas

- DENUE / SCIAN
  - Configuración y descarga listas en `data/models/integration/official-source-config.ts`
  - Archivo local: `data/raw/external/denue_cdmx.geojson`
  - Códigos objetivo:
    - `713943` gimnasios
    - `713941` clubes deportivos
    - `611621` escuelas de deporte
  - El corte actual se clasifica como `preparado` porque el export usado no expone SCIAN verificable en la salida final y requiere heurística textual.

## ETL mínimo reproducible

1. Descargar fuentes:
   - `node --import tsx scripts/etl/fetch-official-sources.ts`
2. Generar capa processed y dashboard:
   - `npm run data:build`

## Salidas generadas

- `data/processed/infrastructure/official-infrastructure.json`
- `public/data/dashboard.json`

## Notas metodológicas

- Si la fuente oficial no trae alcaldía limpia, se normaliza con `normalize-alcaldia.ts`.
- Si la fuente no publica aforo/capacidad, el sistema deja `capacityType = estimada`.
- PILARES y Deportivos Públicos entran hoy como integración nominal real.
- La geometría oficial ya entra al mapa institucional sin depender de APIs externas.
- DENUE ya entra al processed, pero debe seguir marcado como `preparado` hasta validar un extracto con SCIAN verificable.
