# Panorama deportivo por alcaldía

## Estado del documento
- Tipo: documento metodológico operativo del dashboard institucional
- Fecha de actualización: 2026-08-03
- Módulo relacionado: `Panorama` dentro de `/dashboard`

## Propósito
Definir cómo se construye la lectura institucional llamada **Panorama deportivo por alcaldía**, qué fuentes usa, qué unidades de análisis combina y qué límites metodológicos deben permanecer visibles.

## Regla principal
Este módulo integra únicamente dimensiones defendibles:

1. Contexto demográfico
2. Oferta programada
3. Infraestructura documentada
4. Cobertura territorial

No completa con ceros ni inventa mediciones para:
- participación observada;
- demanda revelada;
- preferencias declaradas.

Cuando esas capas no existen, el dashboard debe mostrar:
- `Aún no disponible`
- explicación breve del faltante de datos

## Fuentes integradas

### Demografía
- Censo 2020 INEGI como base poblacional
- Proyección lineal interna solo para 2026, marcada como `proyectado`

### Oferta programada
- `docs/fuentes-operativas/ACUMULADA PILARES ABRIL 26 GDE.xlsx`
  - hoja: `abril`
- `docs/fuentes-operativas/MALLA-HORARIA-DPP-PPP-JUL2026 SPPA.xlsx`
  - hojas:
    - `MALLA HORARIA PUNTOS PONTE PILA`
    - `MALLA HORARIA GENERAL ESCUELAS`

### Infraestructura documentada
- `data/raw/external/pilares.csv`
- `data/raw/external/deportivos_publicos.csv`
- `data/processed/infrastructure/utopias.json`
- `data/raw/external/denue_cdmx.geojson`
- `data/processed/canchas/canchas-operativas.json`

### Geometría
- `data/raw/external/alcaldias.geojson`

## Unidades de análisis

### Contexto demográfico
- `alcaldía × sexo × grupo de edad × año`

### Oferta programada
- sesión programada visible en malla
- dimensiones:
  - canal
  - alcaldía
  - disciplina
  - día de la semana
  - franja horaria
  - corte del archivo

### Infraestructura
- registro nominal por sede, instalación o unidad económica

## Oferta programada

### Qué sí mide
- sedes con programación
- clases o grupos programados
- sesiones semanales programadas
- horas semanales programadas
- disciplinas ofertadas
- diversidad de disciplinas
- cobertura programática por 10 mil habitantes
- horas programadas por 10 mil habitantes

### Qué no mide
- participación real
- alumnos inscritos
- asistencia observada
- preferencia
- demanda

## Infraestructura

El panorama usa solo conteos administrativos defendibles y distingue:
- infraestructura pública
- infraestructura comunitaria
- infraestructura privada formal
- UTOPÍAs
- Canchas

No suma como equivalentes:
- sedes
- amenidades
- espacios operativos estimados
- capacidad estimada

## Demografía

### Variables activas
- población total
- distribución por sexo
- grupos de edad disponibles en el modelo territorial
- densidad y contexto territorial desde seeds institucionales actuales

### Regla temporal
La población base censal conserva su año original.
La proyección 2026 debe mostrarse siempre como `proyectado`.

## Indicadores visibles

Por alcaldía, el panorama puede mostrar:
- población
- porcentaje mujeres / hombres
- sedes programadas
- clases programadas
- sesiones programadas
- horas programadas
- diversidad disciplinaria
- disciplinas con mayor oferta programada
- infraestructura pública documentada
- infraestructura comunitaria
- infraestructura privada formal
- UTOPÍAs
- Canchas
- cobertura programática por 10 mil habitantes
- horas programadas por 10 mil habitantes
- corte visible
- calidad del dato

## Filtros

### Sí aplican
- alcaldía
- año
- sexo
- grupo de edad

### Aplican parcialmente
- disciplina
  - afecta oferta programada
  - afecta infraestructura solo cuando la disciplina está documentada de forma explícita
- tipo de infraestructura
  - afecta módulos de infraestructura
  - no debe vaciar oferta programada ni actividad/ salud

### No aplican de forma directa
- grupo de edad sobre oferta programada
  - las mallas no documentan población objetivo por clase

## Limitaciones

1. PILARES y Ponte Pila tienen cortes distintos:
   - PILARES: abril 2026
   - Ponte Pila: julio 2026
2. DENUE sigue como capa `preparado` mientras no entre un extracto con SCIAN verificable dentro del proyecto.
3. La ausencia de una disciplina visible no implica ausencia real de infraestructura o amenidad.
4. UTOPÍAs sin alcaldía sólida deben permanecer sin territorializar.
5. El panorama no debe usarse como proxy de participación o demanda.

## Campos todavía no disponibles
- participación observada por alcaldía
- demanda revelada por alcaldía
- preferencias declaradas por alcaldía
- infraestructura completa con amenidades verificadas por sede
- clasificación oficial privada cerrada con SCIAN verificable en el extracto local

## Integración futura

### Participación observada
Se integrará cuando exista backend operativo con:
- alumnos
- inscripciones
- asistencia
- cierre diario por clase

### Demanda revelada
Se integrará cuando existan:
- solicitudes
- listas de espera
- intentos de inscripción sin cupo

### Preferencias declaradas
Se integrará solo con:
- encuestas
- formularios
- instrumentos explícitos de preferencia

## Regla de presentación institucional
El módulo debe hablar de:
- `oferta programada`
- `sesiones programadas`
- `horas programadas`
- `cobertura programática`

No debe hablar de:
- deportes favoritos
- deportes más practicados
- demanda deportiva
- participación real

salvo que exista una fuente específica que realmente lo sustente.
