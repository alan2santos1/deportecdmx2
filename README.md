# Deporte CDMX

Dashboard de inteligencia deportiva para la Ciudad de México construido con Next.js 14, TypeScript, Zustand, Recharts y TanStack Table.

## Qué hace

- Carga `public/data/workbook.json` automáticamente.
- Mantiene carga local de `.xlsx` como fallback.
- Muestra KPIs, filtros, comparativos por alcaldía, infraestructura, salud, metodología y exploración de hojas.
- Genera el `workbook.json` desde una capa preparada en `data/deporte-cdmx-seed.ts`.

## Scripts

```bash
npm run data:build
npm run dev
npm run build
```

## Estructura del dataset MVP

La hoja principal es `DEPORTE_CDMX_BASE` y usa este contrato mínimo:

- `Alcaldia`
- `Anio`
- `Sexo`
- `GrupoEdad`
- `PoblacionTotal`
- `PersonasActivas`
- `PorcentajeActivo`
- `DeportivosPublicos`
- `Pilares`
- `Gimnasios`
- `InfraestructuraTotal`
- `InfraestructuraPor100k`
- `Obesidad`
- `Diabetes`

También incluye columnas de trazabilidad:

- `ClasificacionPoblacionTotal`
- `ClasificacionPersonasActivas`
- `ClasificacionPorcentajeActivo`
- `ClasificacionInfraestructura`
- `ClasificacionSalud`
- `FuentePoblacionTotal`
- `FuentePersonasActivas`
- `FuenteInfraestructura`
- `FuenteSalud`
- `SupuestoActividad`
- `FactorTerritorialActividad`
- `NotasMetodo`

## Clasificación metodológica usada en el MVP

- `Agregado preparado`: dato consolidado desde fuente pública o catálogo base.
- `Preparado con referencia pública`: capa derivada para demo usando una fuente oficial como referencia principal.
- `Estimado controlado`: dato modelado para el MVP, marcado explícitamente como estimación.

## Archivos clave

- `data/deporte-cdmx-seed.ts`: capa preparada del MVP.
- `scripts/convert-xlsx-to-json.ts`: convierte la capa preparada al `workbook.json`.
- `public/data/workbook.json`: dataset consumido por la app.

## Cómo actualizarlo con datos reales

1. Sustituir los bloques preparados de `data/deporte-cdmx-seed.ts` por datos consolidados desde ETL.
2. Mantener el contrato de columnas de `DEPORTE_CDMX_BASE`.
3. Cambiar la clasificación de cada campo según corresponda:
   - `Agregado preparado`
   - `Preparado con referencia pública`
   - `Estimado controlado`
   - `Dato oficial directo` cuando ya exista evidencia suficiente.
4. Ejecutar `npm run data:build`.
5. Validar con `npm run build`.

## Integración real recomendada

La siguiente fase debe reemplazar el seed por un pipeline ETL con:

- MOPRADEF
- ENSANUT
- Censo 2020 INEGI
- Deportivos Públicos CDMX
- PILARES
- DENUE
