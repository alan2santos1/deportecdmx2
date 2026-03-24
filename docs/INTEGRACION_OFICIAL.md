# Integración oficial de infraestructura

## Fuentes conectadas

- PILARES
  - CSV oficial descargado en `data/raw/external/pilares.csv`
  - Configuración en `data/models/integration/official-source-config.ts`
- Deportivos públicos
  - CSV oficial descargado en `data/raw/external/deportivos_publicos.csv`
  - Configuración en `data/models/integration/official-source-config.ts`

## Fuentes preparadas

- DENUE / SCIAN
  - Configuración lista en `data/models/integration/official-source-config.ts`
  - Códigos objetivo:
    - `713943` gimnasios
    - `713941` clubes deportivos
    - `611621` escuelas de deporte
- Geometría de alcaldías
  - Placeholder listo con `geoKey`
  - Falta incorporar `GeoJSON` oficial

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
- DENUE y geometría quedan preparados para integración real posterior.
