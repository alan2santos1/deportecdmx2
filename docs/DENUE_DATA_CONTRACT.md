# DENUE_DATA_CONTRACT

Fecha de actualización: 2026-08-04

## 1. Propósito

Este contrato regula la integración de infraestructura deportiva privada a partir de DENUE dentro de Deporte CDMX.

La regla central es estricta:

- solo se integran registros con SCIAN 2023 explícito y verificable;
- no se usa NLP;
- no se usa clasificación por nombre comercial;
- no se usa clasificación por actividad textual;
- no se infieren disciplinas, amenidades, capacidad, usuarios ni número de canchas.

## 2. Fuente de origen

- Fuente institucional: INEGI / DENUE CDMX
- Archivo local actual: `data/raw/external/denue_cdmx.geojson`
- URL configurada: `https://datos.cdmx.gob.mx/dataset/b042f288-836d-4e29-9be2-d25e7a311a5c/resource/3ffedf9d-10ad-429c-aa7c-db305b3e7909/download/directorio-de-unidades-econmicas.json`
- Builder principal: `data/models/integration/build-denue-private-verified.ts`
- Normalizador SCIAN: `data/models/integration/denue-normalizer.ts`
- Salida procesada: `data/processed/infrastructure/denue-private-verified.json`

## 3. Unidad de observación

La unidad de observación es:

- establecimiento económico individual registrado en DENUE.

No representa automáticamente:

- sede deportiva comunitaria;
- instalación pública;
- cancha;
- alberca utilizable;
- amenidad;
- disciplina disponible;
- aforo;
- usuarios activos;
- oferta programada.

## 4. Campos obligatorios a conservar

Cada registro integrado debe preservar, cuando la fuente lo entregue:

- `clee`
- `originalId`
- `razonSocial`
- `nombreComercial`
- `domicilio`
- `colonia`
- `alcaldia`
- `originalAlcaldia`
- `geoKey`
- `latitud`
- `longitud`
- `scian`
- `scianDescripcion`
- `fechaDirectorio`
- `fuente`
- `version`
- `metadata`

Si una columna no existe en el extracto, se conserva como `null` y se reporta como limitación del corte.

## 5. SCIAN utilizados

Los códigos objetivo vigentes del proyecto son:

- `713941` clubes deportivos del sector privado
- `713942` clubes deportivos del sector público o mixto
- `713943` centros de acondicionamiento físico del sector privado
- `713944` infraestructura acuática o balnearios del sector público o mixto
- `611621` escuelas de deporte del sector privado
- `611622` escuelas de deporte del sector público o mixto

## 6. Regla de integración al dashboard

Para la capa privada del dashboard institucional solo se integran como infraestructura privada real:

- `713941`
- `713943`
- `611621`

Los códigos:

- `713942`
- `713944`
- `611622`

se preservan como universo SCIAN soportado por pipeline, pero no deben alimentar la lectura de infraestructura privada real mientras su alcance institucional siga siendo público o mixto.

## 7. Categorías finales

Las categorías actualmente defendibles con el SCIAN objetivo son:

- Gimnasios
- Clubes deportivos
- Escuelas deportivas
- Otros deportivos

Categorías solicitadas como:

- albercas privadas
- academias de danza
- artes marciales
- tenis
- pádel
- CrossFit
- yoga
- pilates
- escalada
- centros acuáticos
- centros de acondicionamiento físico

solo podrán separarse cuando exista un SCIAN oficial más granular o un catálogo institucional verificable que lo permita sin inferencia. Mientras eso no exista:

- no se separan por texto;
- no se derivan por nombre comercial;
- deben quedar dentro de la clasificación SCIAN defendible disponible;
- o en `Otros deportivos` si el SCIAN futuro soportado no permite mayor desagregación.

## 8. Metadata obligatoria por registro

Cada registro verificado debe llevar:

- `qualityGrade`
- `coverageLevel`
- `institutionalScope`
- `sourceDate`
- `version`
- `methodology`
- `provenance`

## 9. KPIs permitidos

KPIs defendibles:

- total de establecimientos deportivos privados verificados;
- distribución por alcaldía;
- distribución por SCIAN;
- distribución por categoría defendible.

KPIs no permitidos desde DENUE:

- número de canchas;
- número de albercas operativas;
- usuarios;
- capacidad;
- disciplinas ofrecidas;
- horarios;
- entrenadores;
- amenidades;
- intensidad de uso.

## 10. Quality y coverage

### Estado del corte local auditado el 2026-08-04

Hallazgo principal:

- el archivo local `data/raw/external/denue_cdmx.geojson` contiene 203,273 registros;
- el extracto local no expone un campo SCIAN usable en la forma integrada por el proyecto;
- por tanto, la capa privada verificable arroja `0` establecimientos integrados en este corte.

Calificación vigente del corte local:

- `status`: `preparado`
- `dataType`: `preparado`
- `qualityGrade`: `D`
- `coverageLevel`: `no_disponible`

## 11. Periodicidad

DENUE debe tratarse como directorio versionado por corte.

Reglas:

- cada snapshot debe registrar `sourceDate`;
- cada build debe registrar `version`;
- nunca mezclar dos cortes sin documentar el cambio;
- nunca comparar periodos como si fueran panel longitudinal perfecto.

## 12. Limitaciones metodológicas

- DENUE registra establecimientos económicos, no uso real del espacio.
- DENUE no describe con precisión la infraestructura interna.
- DENUE no permite inferir disciplinas concretas por sede.
- DENUE no mide participación, demanda ni preferencia.
- DENUE no sustituye inventarios nominales de infraestructura pública o comunitaria.

## 13. Contradicciones documentales vigentes

Existe una contradicción interna del repositorio sobre la lectura de `713943` y `713944`.

Fuentes en tensión:

- `docs/investigacion_actual.md` lista `713943` y `713944` como balnearios.
- `docs/investigacion_base.md`, `docs/INTEGRACION_OFICIAL.md` y `data/models/integration/official-source-config.ts` tratan `713943` como acondicionamiento físico y `713944` como infraestructura acuática o balneario.

Precedencia aplicada en este contrato:

- para integración técnica del proyecto prevalecen `docs/INTEGRACION_OFICIAL.md`, `docs/investigacion_base.md` y `official-source-config.ts`;
- la razón es que son las fuentes ya alineadas con la arquitectura operativa actual del repositorio.

Nota crítica:

- esta contradicción no altera el corte vigente porque el extracto local auditado no trae SCIAN verificable y, por tanto, no genera registros clasificados con esos códigos.

## 14. Regla de mapa

La capa DENUE debe poder activarse o desactivarse como capa independiente.

Nunca debe mezclarse administrativamente con:

- PILARES
- UTOPÍAs
- deportivos públicos
- Canchas

## 15. Criterios de validación

Antes de aceptar un corte DENUE como integrado deben cumplirse:

- sin duplicados defendibles;
- sin pérdida de CLEE cuando la fuente lo publique;
- sin pérdida de coordenadas cuando la fuente las publique;
- sin registros huérfanos territoriales;
- sin categorías inventadas;
- sin inferencias por texto;
- sin mezcla con infraestructura pública;
- sin entrar a totales reales cuando el estado siga siendo `preparado`.
