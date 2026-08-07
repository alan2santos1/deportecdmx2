# 01 Project State

## Estado del documento
- Tipo: documento vivo del estado actual del proyecto
- Fecha de actualización: 2026-08-07
- Rama actual auditada: `sprint/denue-utopias`

## Documentos fuente y jerarquía de autoridad
Orden de precedencia recomendado para este repositorio:

1. `docs/00_PROJECT_CHARTER.md`
2. `docs/investigaciones/Actualización verificable del Dashboard Deportivo de la Ciudad de México.pdf`
3. `docs/investigacion_actual.md`
4. `docs/operacion_asistencia.md`
5. `docs/INTEGRACION_OFICIAL.md`
6. `docs/OBJETIVO_NEGOCIO.md`
7. `docs/investigacion_base.md`
8. `docs/investigacion_operativa.md`
9. estado actual del código
10. README y documentos históricos de contexto

## Nota crítica de autoridad
- La investigación profunda del **2 de agosto de 2026** sustituye hechos públicos desactualizados cuando exista contradicción.
- `investigacion_actual.md` permanece como documento de gobernanza y marco metodológico del proyecto, pero no debe prevalecer sobre investigación verificable más reciente cuando los hechos públicos hayan cambiado.
- `investigacion_operativa.md` es narrativa cualitativa. Puede orientar interpretación, pero no debe alimentar estadísticas sin validación adicional.

## Stack actual
- Next.js 14.2.4
- React 18.3.1
- TypeScript 5.5.3
- TailwindCSS 3.4.4
- Zustand 4.5.2
- Recharts 2.12.7
- TanStack React Table 8.20.5
- Framer Motion 11.2.12
- `xlsx` 0.18.5

## Forma de despliegue

### Local
Comandos vigentes:

```bash
npm run data:build
npm run dev
npm run build
```

`npm run dev` ejecuta `data:build` antes de levantar Next.js.

### cPanel / hosting propio
El proyecto está configurado como export estático:
- `output: "export"` en `next.config.js`
- el build genera la carpeta `out/`
- para despliegue en subruta existen:
  - `npm run build:deport`
  - `npm run build:deporte`

## Arquitectura actual
El repositorio contiene dos dominios principales:

### 1. Dashboard Institucional
Dominio de lectura ejecutiva y datos curados.

Responsabilidades actuales:
- indicadores territoriales;
- panorama deportivo por alcaldía;
- oferta programada agregada;
- filtros;
- infraestructura pública y privada;
- UTOPÍAs;
- DENUE preparado;
- canchas;
- riesgo físico;
- salud;
- metodología;
- mapa territorial por alcaldía.

### 2. Operación y Asistencia
Dominio operativo separado en rutas `/operacion`.

Responsabilidades actuales:
- lectura de clases y horarios;
- simulación de acceso por personal;
- captura local de asistencia;
- alumnos mock/manuales;
- evidencia fotográfica local;
- seguimiento administrativo básico.

## Árbol resumido de módulos
- `app/dashboard`
  - página del dashboard institucional
- `app/operacion`
  - `page.tsx`
  - `profesor/page.tsx`
  - `asistencia/page.tsx`
  - `clases/page.tsx`
  - `admin/page.tsx`
- `components/Dashboard.tsx`
- `components/TerritorialMap.tsx`
- `components/CanchasMap.tsx`
- `components/OperacionShell.tsx`
- `lib/dashboard-selectors.ts`
- `lib/useOperationMockState.ts`
- `data/models/*`
- `scripts/convert-xlsx-to-json.ts`

## Rutas activas
- `/`
- `/dashboard`
- `/operacion`
- `/operacion/profesor`
- `/operacion/asistencia`
- `/operacion/clases`
- `/operacion/admin`

## Componentes principales

### Institucional
- `components/Dashboard.tsx`
- `components/TerritorialMap.tsx`
- `components/CanchasMap.tsx`
- `components/Charts.tsx`
- `components/KpiGrid.tsx`

### Operación
- `components/OperacionShell.tsx`
- `components/ui/SearchSelect.tsx`
- `lib/useOperationMockState.ts`
- `lib/operations-types.ts`

## Datasets actuales

### Dashboard
- `public/data/dashboard.json`
- `data/processed/infrastructure/official-infrastructure.json`
- `data/processed/infrastructure/public-space.json`
- `data/processed/infrastructure/utopias.json`
- `data/processed/canchas/canchas-operativas.json`
- `data/processed/operacion/operacion-asistencia.json` como fuente curada para derivar oferta programada agregada sin exponer nominales en el dashboard

### Operación
- `public/data/operacion-asistencia.json`
- `data/processed/operacion/operacion-asistencia.json`

## Scripts ETL
- `scripts/convert-xlsx-to-json.ts`
  - orquesta la generación de datasets procesados
- `data/models/build-dashboard-data.ts`
  - arma el dataset institucional principal
- `data/models/integration/build-official-infrastructure.ts`
  - integra PILARES, deportivos públicos, DENUE preparado y UTOPÍAs
- `data/models/integration/build-public-space-layer.ts`
  - integra áreas verdes oficiales como capa separada
  - mantiene espacio público oficial como fuente conectada, pero no publicada nominalmente mientras el recurso descargable no exponga atributos suficientes
- `data/models/integration/build-utopias-layer.ts`
  - integra inventario nominal UTOPÍAs con evidencia, amenidades y separación entre proyecto, inauguración y operación
- `data/models/integration/build-canchas-operativas.ts`
  - integra el Excel de canchas
  - separa estado administrativo, documental, de obra y de apertura
  - concilia evidencia oficial manual cuando existe
- `data/models/integration/build-operacion-asistencia.ts`
  - integra las mallas de Ponte Pila y PILARES
- `scripts/etl/fetch-official-sources.ts`
  - descarga fuentes oficiales

## Comandos válidos
```bash
npm run data:build
npm run dev
npm run build
npm run build:deport
npm run build:deporte
```

## Fuentes integradas

### Fuentes rectoras
- `docs/OBJETIVO_NEGOCIO.md`
- `docs/investigacion_actual.md`
- `docs/investigacion_base.md`
- `docs/investigacion_operativa.md`
- `docs/INTEGRACION_OFICIAL.md`
- `docs/operacion_asistencia.md`
- `docs/investigaciones/Actualización verificable del Dashboard Deportivo de la Ciudad de México.pdf`

### Fuentes oficiales o estructuradas del sistema
- PILARES: `data/raw/external/pilares.csv`
- Deportivos públicos: `data/raw/external/deportivos_publicos.csv`
- Geometría alcaldías: `data/raw/external/alcaldias.geojson`
- Áreas verdes: `data/raw/external/green_areas_cdmx.geojson`
- Espacio público: `data/raw/external/public_space_cdmx.zip`
- DENUE: `data/raw/external/denue_cdmx.geojson`
- UTOPÍAs: `data/processed/infrastructure/utopias.json`
- Evidencia oficial manual de UTOPÍAs: `data/raw/manual/utopias-evidencias-oficiales.json`
- Canchas: `docs/fuentes-operativas/13-03-2026-Proyecto_500_canchas_PILARES_ASIGNADO 315 mallas arquitecto.xlsx`
- Evidencia oficial manual de Canchas: `data/raw/manual/canchas-evidencias-oficiales.json`
- Operación:
  - `docs/fuentes-operativas/MALLA HORARIA PUNTOS PONTE PILA 2026.xlsx`
  - `docs/fuentes-operativas/ACUMULADA PILARES ABRIL 26 GDE.xlsx`
  - `docs/fuentes-operativas/MALLA-HORARIA-DPP-PPP-JUL2026 SPPA.xlsx`

## Cifras actuales del Dashboard
Del corte auditado en `public/data/dashboard.json` del 2026-08-07:

- `territorialRecords`: 1120
- `programmedOfferRecords`: 24636
- `infrastructureDetails`: 872
- `sportsRecords`: 0
- `healthProfiles`: 70
- `mapAreas`: 112
- `canchasRecords`: 315
- `publicSpaceSummary.greenAreaRecordCount`: 11739
- `publicSpaceSummary.publicSpaceRecordCount`: 0
- `publicSpaceSummary.greenAreaSurfaceSqMTotal`: 67713932.74
- Corte vigente de UTOPÍAs en `public/data/utopias.json`:
  - `totalCatalogRecords`: 33
  - `territorialCount`: 17
  - `historicalIztapalapaCount`: 14
  - `newGenerationCount`: 19
  - `specialNonTerritorialCount`: 1
  - `operatingConfirmed`: 19
  - `inauguratedConfirmed`: 5
  - `underConstruction`: 5
  - `announcedOrPlanning`: 9
  - `withVerifiedAmenities`: 4
  - `officialCoordinates`: 0
- Corte vigente de Canchas tras conciliación D1.1:
  - `openingStatus.inaugurada_confirmada`: 0
  - `openingStatus.probable`: 0
  - `openingStatus.sin_confirmacion_publica`: 315
  - `workStatus.sin_confirmacion`: 315
  - `documentationStatus.completa`: 105
  - `documentationStatus.parcial`: 199
  - `documentationStatus.minima`: 11
  - `geolocationType.real`: 20
  - `geolocationType.aproximada_pilares`: 223
  - `geolocationType.aproximada_alcaldia`: 72

Resumen nuevo de oferta programada agregada:
- `PILARES` (corte abril 2026): 17854 sesiones programadas visibles
- `Ponte Pila` (corte julio 2026): 6782 sesiones programadas visibles
- Principales disciplinas por oferta visible: Fútbol, Aerobics, Acondicionamiento físico, Entrenamiento funcional y Box

## Cifras actuales de Operación
Del corte auditado en `public/data/operacion-asistencia.json`:

- `userCount`: 3436
- `staffCount`: 1620
- `venueCount`: 750
- `classGroupCount`: 7461
- `puentePilaClassCount`: 1941
- `pilaresClassCount`: 5520
- `studentCount`: 0
- `enrollmentCount`: 0
- `attendanceRecordCount`: 0
- `evidenceRecordCount`: 0
- `studentChangeCount`: 0
- `auditLogCount`: 0

## Qué funciona realmente

### Dashboard
- carga de dataset estructurado vía `fetch('/data/dashboard.json')`
- lectura ejecutiva por secciones:
  - Panorama
  - Actividad
  - Infraestructura
  - Canchas
  - Salud
  - Riesgo
  - Metodología
  - Datos
- filtros institucionales
- compatibilidad visible de filtros para evitar ceros falsos por dimensiones no aplicables
- mapas territoriales por alcaldía
- visualización de infraestructura pública, privada y canchas
- visualización separada de áreas verdes oficiales y superficie verde por alcaldía
- visualización de oferta programada real agregada desde mallas operativas
- notas metodológicas visibles por capa
- módulo Canchas con conciliación documental estricta: ya no publica inauguración u obra como confirmadas sin evidencia oficial individual

### Operación
- navegación separada y consistente
- lectura de clases por personal
- catálogo de clases y horarios
- captura local de asistencia
- carga local de evidencia
- alumnos manuales y mock
- bitácora local en navegador
- vistas preliminares para profesor y admin

## Qué sigue mock/local
El módulo Operación continúa siendo **cliente-only** y dependiente de `localStorage`.

Siguen mock/local:
- usuarios;
- alumnos;
- inscripciones;
- asistencias;
- evidencia;
- auditoría.

Registro explícito:
- alumnos, asistencias, evidencia y usuarios siguen **sin persistencia productiva**.

## Qué ya está en producción técnica del repo
- Dashboard Institucional como lectura ejecutiva y datos curados.
- ETL local reproducible para generar datasets.
- Integración nominal de PILARES y deportivos públicos.
- Mapa territorial institucional.
- Módulo Canchas integrado al dashboard.
- Capa agregada de oferta programada para Panorama y Actividad, derivada de mallas PILARES / Ponte Pila sin exponer datos nominales en el dashboard.

## Qué necesita backend
El sistema necesita, para producción operativa real:
- autenticación;
- RBAC;
- API;
- base de datos;
- storage de evidencia;
- auditoría server-side;
- sincronización entre dispositivos;
- identidad canónica de personal, grupos, sedes y alumnos.

## Estado de la seguridad
- Existe protección de acceso privado a nivel de UI/export.
- No existe todavía seguridad operativa real por rol y ámbito dentro de Operación.
- No existe aislamiento productivo de información nominal por usuario.

## Deuda técnica
1. Operación depende de `localStorage`.
2. No existe modelo transaccional real.
3. No existe API.
4. El dashboard y operación conviven en la misma app estática, aunque sus necesidades runtime son distintas.
5. Parte de la documentación histórica todavía refleja estados anteriores del proyecto.
6. El README sigue describiendo una etapa previa basada en `workbook.json`.
7. La oferta programada usa cortes distintos por canal: PILARES abril 2026 y Ponte Pila julio 2026. Aún no existe una tabla institucional versionada única para ambos.

## Riesgos técnicos
- `output: "export"` limita la evolución de Operación como sistema real.
- Sin DB no hay consistencia multiusuario.
- Sin auth no hay aislamiento por profesor o coordinación.
- La evidencia local en navegador no es institucionalmente confiable.
- La normalización de nombres sigue basada en heurística.

## Riesgos metodológicos
- Confundir oferta programada con participación real.
- Confundir narrativa operativa con estadística oficial.
- Mostrar como real una capa privada DENUE aún marcada como preparada.
- Inferir disciplinas, amenidades, gustos o demanda a partir de registros operativos.

## Riesgos de UX
- Sobrecargar móvil con flujos administrativos largos.
- Exigir demasiada navegación para acciones de campo.
- No diferenciar suficientemente vista de captura vs vista ejecutiva.

## Limitaciones metodológicas
1. Los Excel de Ponte Pila y PILARES describen **oferta programada**, no participación, demanda ni preferencia.
2. `investigacion_operativa.md` es cualitativa.
3. `investigacion_base.md` y `investigacion_actual.md` combinan hechos observados y capas estimadas que requieren etiquetado disciplinado.
4. El PDF de actualización 2026-08-02 debe prevalecer sobre hechos públicos más viejos, pero su extracción automática no quedó totalmente resuelta en este entorno; debe considerarse autoridad documental y verificarse manualmente si surge una contradicción crítica de detalle.

## Problemas detectados
- Documentación histórica parcialmente desalineada con el estado actual del repo.
- Convivencia de rutas y conceptos heredados en README y contexto antiguo.
- `docs/CONTEXTO_DASHBOARD_ACTUAL.txt` describe una arquitectura anterior basada en workbook Excel genérico y módulos clínicos, incompatible con el producto actual.
- Existen duplicados de fuentes operativas entre `docs/` raíz y `docs/fuentes-operativas/`.
- Operación aún no distingue productivamente entre autenticación, autorización y simulación de usuario.
- La capa privada DENUE sigue limitada por la ausencia de SCIAN verificable en el extracto local integrado.
- La infraestructura documentada por disciplina sigue siendo parcial; la ausencia de disciplina visible no debe leerse como ausencia real de oferta o amenidad.
- La capa Canchas sigue sin evidencia oficial individual suficiente dentro del repositorio para confirmar aperturas o entregas por registro.

## Contradicciones documentales relevantes

### 1. `README.md` vs estado real del proyecto
- `README.md` habla de `workbook.json`, `DEPORTE_CDMX_BASE` y una etapa MVP previa.
- El estado real ya usa `public/data/dashboard.json` y datasets de dominio.
- Prevalece: código actual + `investigacion_actual.md` + este documento.

### 2. `CONTEXTO_DASHBOARD_ACTUAL.txt` vs estado real
- Describe un proyecto previo con rutas y lógica clínica/Excel viewer.
- No representa el sistema actual.
- Prevalece: repositorio actual.

### 3. `investigacion_actual.md` vs investigación profunda 2026-08-02
- `investigacion_actual.md` sigue siendo referencia principal de gobernanza dentro del repo, pero la actualización verificable del 2026-08-02 debe prevalecer si contradice hechos públicos ya cambiados.
- Prevalece: PDF 2026-08-02 en hechos actualizados; `investigacion_actual.md` en estructura de gobernanza cuando no exista contradicción.

### 4. `investigacion_operativa.md` vs uso estadístico
- El documento cualitativo podría inducir a usar narrativa operativa como estadística.
- Prevalece: solo como capa interpretativa, nunca como fuente estadística.

### 5. Operación documentada vs operación real
- `operacion_asistencia.md` describe correctamente el estado actual como mock/local, pero algunos usuarios podrían leer el módulo como si ya fuera productivo.
- Prevalece: código y dataset actual, que confirman que no hay DB ni persistencia productiva.

## Roadmap vigente por sprints

### Sprint 1
- auth real
- RBAC
- API base
- DB base
- identidad de personal, sedes y grupos

### Sprint 2
- matrícula nominal real
- sesiones de asistencia productivas
- evidencia en storage real
- incidencias

### Sprint 3
- coordinación, subcoordinación, LCPO, RH y dirección con alcances reales
- alertas operativas
- seguimiento de cumplimiento

### Sprint 4
- puente analítico entre Operación y Dashboard
- agregados curados
- marts operativos

### Sprint 5
- mobile hardening
- soporte de campo
- auditoría institucional robusta

## Siguiente sprint recomendado
**Consolidación territorial e integración oficial defendible**

Prioridades:
- completar un extracto DENUE con SCIAN verificable;
- homologar el catálogo de disciplinas institucionales con revisión humana;
- versionar cortes de oferta programada por canal;
- consolidar notas metodológicas y exportes del panorama por alcaldía;
- mantener el Dashboard separado y solo lector de agregados curados.

## Asuntos que requieren decisión humana
- definir autoridad final entre `investigacion_actual.md` y el PDF de actualización para cada sección temática;
- decidir si Operación permanecerá dentro de esta app Next o migrará a arquitectura con backend dedicado;
- decidir política institucional de datos personales, retención de evidencia y acceso nominal;
- decidir cuál de las fuentes operativas duplicadas se considera canonical;
- decidir si el módulo Canchas pertenece solo a operación, solo al dashboard o a ambos con salidas diferenciadas.
