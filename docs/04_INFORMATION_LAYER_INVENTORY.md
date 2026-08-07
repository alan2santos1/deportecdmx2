# 04 Information Layer Inventory

## Estado del documento
- Tipo: inventario vivo de capas de información
- Fecha de actualización: 2026-08-06
- Alcance: documentación y estado real del repositorio sin modificar código

## Criterio
Este inventario distingue entre:

- capas documentales rectoras;
- capas de datos integradas en el dashboard;
- capas operativas integradas o preparadas;
- capas configuradas pero no integradas;
- huecos explícitos de información.

La columna `calidad` usa la escala institucional del proyecto:

- `A`: registro vigente nominal verificable o activo confirmado;
- `B`: fuente oficial nominal antigua o parcial;
- `C`: agregado institucional útil pero incompleto o con vigencia limitada;
- `D`: capa preparada, heurística, sintética o sin fuente nominal integrada.

## Tabla maestra de capas

| Nombre | Fuente | Tipo de dato | Cobertura | Fecha de corte | Periodicidad | Calidad | Oficial | Pública | Privada | Observada | Estimada | Preparada | Integrada | Falta integrar | Prioridad |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Charter rector del sistema | [docs/00_PROJECT_CHARTER.md](/Users/alansantos/Proyectos%20web/deportecdmx2/docs/00_PROJECT_CHARTER.md) | Documental rectora | Sistema completo | 2026-08-03 | Ad hoc | A | Sí | No | No | No | No | No | Sí | No | Alta |
| Estado vivo del proyecto | [docs/01_PROJECT_STATE.md](/Users/alansantos/Proyectos%20web/deportecdmx2/docs/01_PROJECT_STATE.md) | Documental rectora | Sistema completo | 2026-08-03 | Ad hoc | A | Sí | No | No | No | No | No | Sí | No | Alta |
| Arquitectura objetivo | [docs/02_TARGET_ARCHITECTURE.md](/Users/alansantos/Proyectos%20web/deportecdmx2/docs/02_TARGET_ARCHITECTURE.md) | Documental objetivo | Sistema completo | 2026-08-03 | Ad hoc | A | Sí | No | No | No | No | No | Sí | No | Alta |
| Roadmap de producto | [docs/03_PRODUCT_ROADMAP.md](/Users/alansantos/Proyectos%20web/deportecdmx2/docs/03_PRODUCT_ROADMAP.md) | Documental plan | Sistema completo | 2026-08-03 | Ad hoc | A | Sí | No | No | No | No | No | Sí | No | Alta |
| Investigación actual | [docs/investigacion_actual.md](/Users/alansantos/Proyectos%20web/deportecdmx2/docs/investigacion_actual.md) | Documental de gobernanza | Infraestructura, UTOPÍAs, canchas y reglas de defensa | 2026-08-03 | Ad hoc | A | No | No | No | No | No | No | Sí | No | Alta |
| Base maestra de investigación | `docs/investigaciones/Ecosistema deportivo...docx` | Documental metodológica | Sistema completo | 2026-08-03 | Ad hoc | A | No | No | No | No | No | No | Sí | No | Alta |
| Actualización verificable del dashboard | `docs/investigaciones/Actualización verificable del Dashboard Deportivo de la Ciudad de México.pdf` | Documental verificable | Dashboard institucional | 2026-08-02 | Ad hoc | A | No | No | No | No | No | No | Sí, por precedencia documental | No | Alta |
| Benchmarks de actividad física | [data/raw/official-benchmarks.ts](/Users/alansantos/Proyectos%20web/deportecdmx2/data/raw/official-benchmarks.ts) con MOPRADEF | Preparado, estimado y proyectado | 2020-2026, sexo y edad | 2020-2026 | Anual | C | Sí en origen, no en territorialización local | Sí | No | No | Sí | Sí | Sí | No | Alta |
| Base de salud ENSANUT | [data/raw/official-benchmarks.ts](/Users/alansantos/Proyectos%20web/deportecdmx2/data/raw/official-benchmarks.ts) + [docs/investigacion_base.md](/Users/alansantos/Proyectos%20web/deportecdmx2/docs/investigacion_base.md) | Estimado | CDMX territorializada por alcaldía, sexo y edad | 2022 | No definida en repo; depende de ENSANUT | C | Sí en origen, no por alcaldía | Sí | No | No | Sí | No | Sí | No | Alta |
| Población base y proyección | [data/processed/population.ts](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/population.ts) + [data/raw/alcaldias.ts](/Users/alansantos/Proyectos%20web/deportecdmx2/data/raw/alcaldias.ts) | Base oficial y proyectado | 16 alcaldías | Base 2020, proyección a 2022/2024/2025/2026 | Eventual | C | Sí en origen censal, proyección local no oficial | Sí | No | No | Sí | No | Sí | No | Alta |
| Registros territoriales del dashboard | [public/data/dashboard.json](/Users/alansantos/Proyectos%20web/deportecdmx2/public/data/dashboard.json) `territorialRecords` | Mixto: estimado, base_oficial, proyectado y real en infraestructura | 16 alcaldías × sexo × edad × 2020-2026 | Snapshot generado 2026-08-03 | Snapshot por build | C | Parcial | Sí | No | Parcial | Sí | Parcial | Sí | No | Alta |
| Oferta programada PILARES | [docs/fuentes-operativas/ACUMULADA PILARES ABRIL 26 GDE.xlsx](/Users/alansantos/Proyectos%20web/deportecdmx2/docs/fuentes-operativas/ACUMULADA%20PILARES%20ABRIL%2026%20GDE.xlsx) hoja `abril` | Real, oferta programada | PILARES, agregada por alcaldía, disciplina y horario | 2026-04-30 | Corte operativo ad hoc | A | Sí | No | No | Sí como programación | No | No | Sí | No | Alta |
| Oferta programada Ponte Pila | [docs/fuentes-operativas/MALLA-HORARIA-DPP-PPP-JUL2026 SPPA.xlsx](/Users/alansantos/Proyectos%20web/deportecdmx2/docs/fuentes-operativas/MALLA-HORARIA-DPP-PPP-JUL2026%20SPPA.xlsx) hojas `MALLA HORARIA PUNTOS PONTE PILA` y `MALLA HORARIA GENERAL ESCUELAS` | Real, oferta programada | Ponte Pila, agregada por alcaldía, disciplina y horario | 2026-07-31 | Corte operativo ad hoc | A | Sí | No | No | Sí como programación | No | No | Sí | No | Alta |
| Catálogo de disciplinas programadas | [data/models/integration/discipline-catalog.ts](/Users/alansantos/Proyectos%20web/deportecdmx2/data/models/integration/discipline-catalog.ts) | Preparado de normalización | Oferta programada PILARES y Ponte Pila | 2026-08-03 | Versionado por código | C | No | No | No | No | No | Sí | Sí | No | Alta |
| PILARES nominal por sede | [data/raw/external/pilares.csv](/Users/alansantos/Proyectos%20web/deportecdmx2/data/raw/external/pilares.csv) | Real | 300 sedes nominales | Dataset con vigencia histórica 2021 según investigación | No definida en repo | B | Sí | Sí | No | Sí | No | No | Sí | No | Alta |
| UTOPÍAs institucionales | [data/processed/infrastructure/utopias.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/infrastructure/utopias.json) | Real | 28 sedes/proyectos institucionales | Snapshot procesado vigente 2026-08-03 | Ad hoc | B | Sí en evidencia institucional, no dataset open data único | Parcial | No | Sí | No | No | Sí | No | Alta |
| Deportivos públicos nominales | [data/raw/external/deportivos_publicos.csv](/Users/alansantos/Proyectos%20web/deportecdmx2/data/raw/external/deportivos_publicos.csv) | Real | 265 instalaciones nominales | Sin fecha de corte explícita dentro del repo | No definida en repo | B | Sí | Sí | No | Sí | No | No | Sí | No | Alta |
| Geometría oficial de alcaldías | [data/raw/external/alcaldias.geojson](/Users/alansantos/Proyectos%20web/deportecdmx2/data/raw/external/alcaldias.geojson) | Real para geometría | 16 alcaldías | Sin fecha de corte explícita en repo | Baja | B | Sí | Sí | No | Sí | No | No | Sí | No | Alta |
| Infraestructura oficial consolidada | [data/processed/infrastructure/official-infrastructure.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/infrastructure/official-infrastructure.json) | Mixto: real y preparado | Infraestructura pública/comunitaria y capa privada preparada | Snapshot generado 2026-08-03 | Snapshot por build | B | Parcial | Sí | Parcial | Sí | No | Sí | Sí | No | Alta |
| Áreas verdes oficiales | [data/processed/infrastructure/public-space.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/infrastructure/public-space.json) `greenAreas.records` | Real | 11739 polígonos oficiales | Descarga auditada 2026-08-06; publicación visible 2023-02-15 | Eventual | B | Sí | Sí | No | Sí | No | No | Sí | No | Alta |
| Espacio público oficial | [data/processed/infrastructure/public-space.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/infrastructure/public-space.json) `publicSpace` | Preparado | Fuente conectada, sin registros publicados | Descarga auditada 2026-08-06; publicación visible 2023-03-30 | Eventual | D | Sí | Sí | No | No | No | Sí | Parcial | Sí, falta integración nominal usable | Alta |
| DENUE privada verificada por SCIAN | [data/raw/external/denue_cdmx.geojson](/Users/alansantos/Proyectos%20web/deportecdmx2/data/raw/external/denue_cdmx.geojson) + [data/models/integration/denue-normalizer.ts](/Users/alansantos/Proyectos%20web/deportecdmx2/data/models/integration/denue-normalizer.ts) | Real en diseño, no disponible en corte actual | Privado formal por establecimiento | No utilizable en corte local actual | Eventual | D | Sí en origen | Sí | Sí | No en este repo | No | Sí | No | Sí | Crítica |
| DENUE privada preparada/candidata | [data/models/integration/build-official-infrastructure.ts](/Users/alansantos/Proyectos%20web/deportecdmx2/data/models/integration/build-official-infrastructure.ts) | Preparado | Privado formal candidato por establecimiento y alcaldía | 2026-08-03 snapshot, pero `recordCount = 0` | Snapshot por build | D | No como resultado integrado | Sí | Sí | No | No | Sí | Parcial, estructura lista | Sí | Crítica |
| Mapa territorial por alcaldía | [public/data/dashboard.json](/Users/alansantos/Proyectos%20web/deportecdmx2/public/data/dashboard.json) `mapAreas` + `mapGeometry` | Insight con geometría real | 16 alcaldías × años soportados | Snapshot generado 2026-08-03 | Snapshot por build | C | Parcial | Sí | No | Parcial | Sí | Parcial | Sí | No | Alta |
| Sports records territoriales | [public/data/dashboard.json](/Users/alansantos/Proyectos%20web/deportecdmx2/public/data/dashboard.json) `sportsRecords` | Preparado | Sin cobertura activa | Vacío al 2026-08-03 | N/A | D | No | No | No | No | No | Sí | Sí, vacío | Sí | Alta |
| Perfiles de salud agregados | [public/data/dashboard.json](/Users/alansantos/Proyectos%20web/deportecdmx2/public/data/dashboard.json) `healthProfiles` | Estimado y proyectado | Sexo × edad × año | 2022 base, 2026 proyección | Snapshot por build | C | Sí en origen, no por alcaldía | Sí | No | No | Sí | No | Sí | No | Alta |
| Metodología, fuentes, calidad e insights | [public/data/dashboard.json](/Users/alansantos/Proyectos%20web/deportecdmx2/public/data/dashboard.json) `methodology`, `sourceRegistry`, `qualityChecks`, `insights` | Documental curada | Dashboard institucional | Snapshot generado 2026-08-03 | Snapshot por build | B | No | No | No | No | No | No | Sí | No | Media |
| Evidencia oficial manual de canchas | [data/raw/manual/canchas-evidencias-oficiales.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/raw/manual/canchas-evidencias-oficiales.json) | Manual curada con fuentes oficiales documentadas | Programa de canchas; evidencia agregada y potencial evidencia individual futura | 2026-08-03 | Ad hoc | C | Sí por origen documental | No | No | Sí documental | No | No | Sí | Sí, falta evidencia nominal individual | Alta |
| Canchas operativas consolidadas | [data/processed/canchas/canchas-operativas.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/canchas/canchas-operativas.json) | Real administrativo con conciliación documental | 315 canchas, 16 alcaldías | Archivo base 2026-03-13; snapshot procesado 2026-08-03 | Ad hoc | B | Sí como base institucional interna | No | No | Sí | No | Parcial en apertura/obra por falta de evidencia nominal | Sí | No | Alta |
| Geolocalización de canchas | [data/processed/canchas/canchas-operativas.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/canchas/canchas-operativas.json) | Mixto: real y aproximado | 315 canchas | 2026-08-03 snapshot | Ad hoc | C | Parcial | No | No | Sí | No | Sí | Sí | No | Alta |
| Personal operativo | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `staff` | Real | 1620 registros de personal consolidado | PILARES abril 2026; Ponte Pila mayo 2026 | Ad hoc | A | Sí | No | No | Sí | No | No | Sí | No | Alta |
| Usuarios de operación | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `users` | Preparado/mock derivado | 3436 usuarios simulados | Snapshot generado 2026-08-03 | Snapshot por build | D | No | No | No | No | No | Sí | Sí | Sí, requiere auth real | Alta |
| Sedes operativas | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `venues` | Real | 750 sedes/puntos PILARES y Ponte Pila | Abril 2026 y mayo 2026 | Ad hoc | A | Sí | No | No | Sí | No | No | Sí | No | Alta |
| Grupos y clases operativas | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `classGroups` | Real | 7461 grupos/clases | Abril 2026 y mayo 2026 | Ad hoc | A | Sí | No | No | Sí | No | No | Sí | No | Alta |
| Alumnos nominales | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `students` | Preparado | Vacío | Vacío al 2026-08-03 | N/A | D | No | No | No | No | No | Sí | Sí, vacío | Sí | Crítica |
| Inscripciones | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `enrollments` | Preparado | Vacío | Vacío al 2026-08-03 | N/A | D | No | No | No | No | No | Sí | Sí, vacío | Sí | Crítica |
| Asistencia diaria | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `attendanceRecords` | Preparado | Vacío | Vacío al 2026-08-03 | Diaria en diseño | D | No | No | No | No | No | Sí | Sí, vacío | Sí | Crítica |
| Evidencia fotográfica | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `evidenceRecords` | Preparado | Vacío | Vacío al 2026-08-03 | Diaria en diseño | D | No | No | No | No | No | Sí | Sí, vacío | Sí | Crítica |
| Altas, bajas y cambios de alumno | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `studentChanges` | Preparado | Vacío | Vacío al 2026-08-03 | Transaccional en diseño | D | No | No | No | No | No | Sí | Sí, vacío | Sí | Alta |
| Auditoría operativa | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `auditLog` | Preparado | Vacío | Vacío al 2026-08-03 | Transaccional en diseño | D | No | No | No | No | No | Sí | Sí, vacío | Sí | Alta |
| Reglas de captura y permisos | [data/processed/operacion/operacion-asistencia.json](/Users/alansantos/Proyectos%20web/deportecdmx2/data/processed/operacion/operacion-asistencia.json) `attendanceCaptureRules`, `rolePermissions`, `routeProposals` | Preparado | Operación | Snapshot 2026-08-03 | Snapshot por build | C | No | No | No | No | No | Sí | Sí | Sí, falta enforcement server-side | Alta |

## Huecos absolutos de información

### 1. Participación observada real
- No existe padrón nominal productivo de alumnos por clase.
- No existe asistencia diaria persistida.
- No existe evidencia productiva asociada a clase, fecha y usuario.
- Impacto:
  - el proyecto no puede medir uso observado;
  - el dashboard no puede publicar participación real;
  - operación sigue siendo cliente/local para esta dimensión.
- Prioridad: crítica.

### 2. Demanda revelada
- No existen listas de espera, rechazos, reservas fallidas ni solicitudes estructuradas.
- Impacto:
  - no es posible medir demanda no atendida;
  - no puede calcularse saturación real por clase o sede.
- Prioridad: crítica.

### 3. Preferencias declaradas
- No existe encuesta o instrumento explícito de preferencia deportiva de la población.
- Impacto:
  - no es válido hablar de “deportes favoritos por alcaldía”;
  - solo existe oferta programada y contexto agregado.
- Prioridad: alta.

### 4. Capa privada DENUE verificable
- El extracto local de DENUE no aporta SCIAN usable en la salida integrada.
- Estado actual:
  - estructura ETL lista;
  - `recordCount = 0` en la capa integrada;
  - no existe universo privado verificable publicado.
- Impacto:
  - no se puede sostener un conteo privado real por alcaldía;
  - cualquier lectura privada debe seguir como preparada.
- Prioridad: crítica.

### 5. Espacio público nominal completo
- Ya existe una capa nominal integrada de áreas verdes oficiales.
- Sigue faltando integrar nominalmente el dataset oficial de Espacio público de la Ciudad de México porque el recurso descargable auditado el 2026-08-06 no expone atributos suficientes para conciliación defendible.
- Impacto:
  - las áreas verdes ya tienen trazabilidad local;
  - la capa de espacio público sigue incompleta como universo institucional separado.
- Prioridad: alta.

### 6. PILARES actualizados operativamente
- Existe CSV nominal integrado, pero la propia investigación vigente advierte que el corte es histórico.
- Faltante:
  - estado operativo actual 2025-2026;
  - amenidades por sede;
  - oferta nominal por sede actualizada fuera de mallas.
- Prioridad: alta.

### 7. UTOPÍAs con amenidades verificadas
- Existe inventario institucional defendible por sede/estatus.
- Falta:
  - amenidades detalladas verificadas por sede;
  - estado operativo de amenidades;
  - catálogo estructurado de disciplinas/instalaciones internas.
- Prioridad: media-alta.

### 8. Inventario público deportivo exhaustivo
- `Deportivos públicos` está integrado nominalmente, pero la investigación vigente lo trata como parcial e históricamente imperfecto.
- Faltan:
  - conciliación contra otras capas públicas;
  - deduplicación interfuente;
  - amenidades estructuradas por instalación.
- Prioridad: alta.

### 9. Disciplinas y amenidades documentadas
- El sistema ya evita inferencia libre, pero eso deja subrepresentación estructural.
- Faltan:
  - catálogos oficiales por sede/instalación;
  - verificación humana de amenidades;
  - cobertura nominal para natación, básquetbol, box, atletismo, acondicionamiento y otras familias.
- Prioridad: alta.

### 10. Serie territorial de actividad y salud defendible a nivel alcaldía
- Hoy existe una capa útil para MVP, pero sigue siendo modelada.
- Faltan:
  - metodología SAE/MRP implementada con microdatos;
  - intervalos de incertidumbre;
  - publicación institucional reproducible de la estimación.
- Prioridad: alta.

### 11. Cohorte temporal unificada para oferta programada
- PILARES y Ponte Pila usan cortes distintos:
  - PILARES abril 2026
  - Ponte Pila julio 2026
- Impacto:
  - la suma agregada es operativamente útil, pero no es un mismo periodo de observación.
- Prioridad: alta.

### 12. Persistencia productiva y seguridad operativa
- No existen:
  - auth real;
  - RBAC real;
  - DB;
  - API;
  - storage;
  - auditoría server-side.
- Impacto:
  - `/operacion` no es sistema productivo todavía.
- Prioridad: crítica.

### 13. Datos nominales de alumnos, tutores y consentimiento
- No existe modelo real de menores, tutores, consentimiento ni retención.
- Impacto:
  - no puede operarse matrícula institucional real.
- Prioridad: crítica.

### 14. Calidad jurídica y de privacidad para evidencia
- No existe política implementada de:
  - acceso a fotografía;
  - retención;
  - eliminación;
  - auditoría formal.
- Prioridad: alta.

### 15. Puente analítico entre Operación y Dashboard
- El charter lo exige por agregados curados.
- Hoy solo existe convivencia de módulos en la misma app y dataset operativo separado.
- Faltan:
  - marts agregados de operación;
  - reglas de publicación;
  - snapshots institucionales de asistencia y cumplimiento.
- Prioridad: alta.

## Lectura ejecutiva de estado

### Capas fuertes hoy
- oferta programada agregada de PILARES y Ponte Pila;
- infraestructura nominal PILARES;
- deportivos públicos nominales;
- inventario institucional UTOPÍAs;
- canchas operativas;
- personal, sedes y grupos operativos;
- geometría oficial de alcaldías.

### Capas útiles pero metodológicamente limitadas
- territorialización de actividad y salud;
- parques/espacios abiertos como agregado territorial;
- mapa institucional como capa compuesta;
- narrativa de insights y riesgo territorial.

### Capas listas en contrato pero ausentes como dato real
- privados verificados por DENUE;
- alumnos;
- inscripciones;
- asistencia;
- evidencia;
- auditoría operativa;
- demanda revelada;
- preferencias declaradas.

## Siguiente uso recomendado
Este inventario debe servir como base para:

1. decidir qué capas pueden presentarse públicamente;
2. definir el backlog de integración oficial;
3. separar con claridad lo real, lo estimado y lo preparado;
4. priorizar el backend operativo y el puente analítico.
