# Canchas Data Contract

## Estado
- Fecha de actualización: 2026-08-03
- Alcance: contrato técnico y metodológico de la capa `Canchas`

## Propósito
Formalizar la capa de Canchas como un padrón **administrativo y documental**.

No es:
- padrón público consolidado de obra;
- padrón nominal oficial abierto de las 500 canchas;
- evidencia suficiente para afirmar por sí sola inauguración individual.

## Fuente primaria
- Excel canónico:
  - `docs/fuentes-operativas/13-03-2026-Proyecto_500_canchas_PILARES_ASIGNADO 315 mallas arquitecto.xlsx`

## Fuente complementaria de evidencia oficial
- `data/raw/manual/canchas-evidencias-oficiales.json`

Regla:
- solo incorpora evidencia oficial ya documentada dentro del proyecto;
- los anuncios agregados del programa no acreditan el estado individual de cada cancha.

## Unidad de observación
- `record`: registro administrativo de cancha dentro del Excel institucional.

Regla crítica:
- el registro administrativo no equivale automáticamente a:
  - obra confirmada;
  - entrega confirmada;
  - inauguración confirmada;
  - operación observada.

## Campos obligatorios del record procesado
- `id`
- `consecutiveNumber`
- `year`
- `alcaldia`
- `geoKey`
- `name`
- `domicilio`
- `tipoCancha`
- `material`
- `origen`
- `latitude`
- `longitude`
- `projectedPoint`
- `geolocationType`
- `geolocationLabel`
- `geolocationSource`
- `mapsLink`
- `pilaresAssigned`
- `assignedPilaresOfficialName`
- `assignedPilaresResponsibleName`
- `assignedPilaresContact`
- `assignedPilaresEmail`
- `assignedPilaresSchedule`
- `assignedPilaresAlcaldia`
- `nearestPilares1`
- `distanceToPilares1`
- `nearestPilares2`
- `distanceToPilares2`
- `territorialStatus`
- `territorialAdvance`
- `territorialSourceSheet`
- `inaugurationDateRaw`
- `inaugurationDateIso`
- `tienePromotorFutbol`
- `mallaHorariaFutbol`
- `schedule`
- `mallaHorariaDisciplinas`
- `disciplinas`
- `activities`
- `promoterCount`
- `observations`

## Cuatro dimensiones obligatorias de estado

### 1. `administrativeStatus`
- `registrada`
- `incompleta`
- `requiere_revision`

Mide:
- consistencia administrativa mínima del expediente.

### 2. `documentationStatus`
- `completa`
- `parcial`
- `minima`

Mide:
- completitud documental del expediente operativo.

No mide:
- inauguración real;
- uso observado;
- operación verificada en campo.

### 3. `workStatus`
- `intervencion_confirmada`
- `lista_confirmada`
- `entregada_confirmada`
- `sin_confirmacion`
- `contradiccion`

Mide:
- evidencia conciliada de obra, lista o entrega.

Regla:
- solo puede quedar confirmada con evidencia oficial individual conciliada.

### 4. `openingStatus`
- `inaugurada_confirmada`
- `probable`
- `sin_confirmacion_publica`
- `contradiccion`

Mide:
- apertura o inauguración pública individual.

Regla:
- `inaugurada_confirmada` requiere match alto o validación manual;
- `probable` solo puede venir de coincidencia media con evidencia;
- si no hay evidencia individual, debe quedar `sin_confirmacion_publica`.

## Conciliación

### Métodos válidos
- `exact_name_address`
- `exact_coordinates`
- `exact_official_number`
- `probable_name_alcaldia`
- `probable_address`
- `manual_confirmed`
- `unmatched`

### Confianza válida
- `alta`
- `media`
- `baja`
- `sin_match`

### Regla de publicación
- `alta` o `manual_confirmed`:
  - puede confirmar `openingStatus` y `workStatus`
- `media`:
  - puede llevar a `probable`
- `baja` o `sin_match`:
  - no confirma apertura ni entrega

## Evidencia oficial
Cada evidencia manual debe incluir:
- `evidenceId`
- `title`
- `sourceInstitution`
- `sourceType`
- `sourceDate`
- `publicationDate`
- `sourceUrl`
- `alcaldia`
- `venueName`
- `addressText`
- `coordinates`
- `officialCourtNumber`
- `reportedStatus`
- `description`
- `sourceReliability`
- `capturedAt`

## Historial reproducible
Cada registro procesado debe incluir `statusHistory` con:
- `statusType`
- `previousValue`
- `newValue`
- `effectiveDate`
- `evidenceId`
- `method`
- `changedAt`
- `calculationVersion`

## KPIs defendibles
Sí:
- total de registros administrativos;
- coordenadas reales;
- ubicación aproximada;
- con promotor;
- con horario;
- con actividades;
- inauguración confirmada individualmente;
- entrega o lista confirmada;
- coincidencia probable;
- sin confirmación pública;
- contradicciones;
- requiere revisión.

No:
- “315 inauguradas”;
- “315 listas”;
- “315 operando”.

## Regla metodológica visible
Texto obligatorio en UI:

> El padrón de Canchas proviene del Excel administrativo institucional. Los estados de inauguración, entrega u obra solo se consideran confirmados cuando existe evidencia oficial conciliada individualmente. Los anuncios agregados del programa no acreditan por sí solos el estado de cada registro.
