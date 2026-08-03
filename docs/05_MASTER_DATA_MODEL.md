# 05 Master Data Model

## Estado del documento
- Tipo: documento rector técnico-metodológico del modelo de datos
- Fecha de consolidación: 2026-08-03
- Estatus: vigente
- Propósito: servir como Constitución técnica del proyecto para cualquier implementación futura de datos, analítica, operación, integración oficial y visualización

---

## 0. Alcance y autoridad

Este documento define el modelo de datos maestro del sistema **Deporte CDMX**.

Su función es fijar:

- la estructura lógica del sistema;
- la separación correcta entre dominios;
- las unidades válidas de observación;
- los contratos mínimos de trazabilidad;
- la jerarquía entre fuentes;
- las reglas para publicar indicadores;
- los límites metodológicos del dashboard y de operación.

### Precedencia documental
Para efectos del modelo de datos, este documento debe leerse junto con la jerarquía ya validada en el proyecto:

1. `docs/00_PROJECT_CHARTER.md`
2. investigación verificable más reciente del dashboard en `docs/investigaciones/`
3. `docs/investigacion_actual.md`
4. `docs/01_PROJECT_STATE.md`
5. `docs/02_TARGET_ARCHITECTURE.md`
6. `docs/03_PRODUCT_ROADMAP.md`
7. `docs/INTEGRACION_OFICIAL.md`
8. `docs/operacion_asistencia.md`
9. `docs/investigacion_base.md`
10. `docs/investigacion_operativa.md`
11. estado real del código

### Regla de interpretación
Si existe contradicción entre:

- una regla metodológica y una comodidad técnica,
- una narrativa antigua y la investigación verificable reciente,
- una visualización y la naturaleza real del dato,

prevalece siempre:

- la separación metodológica correcta;
- la trazabilidad explícita;
- la defensa institucional del dato;
- la no invención.

---

## 1. Filosofía del sistema

### 1.1 Naturaleza del producto
El sistema no es un dashboard aislado ni un ERP tradicional.

Es una **plataforma institucional de inteligencia y operación deportiva** con dos dominios principales:

1. **Dashboard Institucional**
2. **Operación y Asistencia**

Además incorpora capas transversales:

- infraestructura;
- canchas;
- oferta programada;
- salud y actividad física;
- riesgo territorial;
- metodología y trazabilidad.

### 1.2 Principio central
El sistema existe para integrar información heterogénea sin mezclar indebidamente:

- oferta programada;
- infraestructura;
- participación observada;
- preferencias declaradas;
- demanda revelada;
- contexto agregado de salud y actividad física.

### 1.3 Regla fundacional
La plataforma debe ser útil para gobierno sin caer en falsa precisión.

Eso implica:

- no inventar datos;
- no completar vacíos con supuestos implícitos;
- no presentar estimaciones como observaciones;
- no presentar programación como si fuera participación;
- no inferir demanda, gustos o uso a partir de la existencia de una clase o una instalación.

### 1.4 Resultado buscado
Cada número del sistema debe responder, como mínimo:

1. ¿Qué objeto está midiendo?
2. ¿Cuál es su unidad de observación?
3. ¿Qué fuente lo respalda?
4. ¿De qué fecha es?
5. ¿Es real, base oficial, estimado, preparado, proyectado o insight?
6. ¿Qué limitaciones tiene?

---

## 2. Arquitectura por capas

### 2.1 Visión general
El modelo de datos se organiza en capas lógicas, no solo en carpetas físicas.

Capas principales:

1. **Fuentes crudas**
2. **Normalización e integración**
3. **Datasets procesados de dominio**
4. **Agregados curados**
5. **Consumo visual**
6. **Futuro puente analítico entre operación y dashboard**

### 2.2 Capa 1 — Fuentes crudas
Incluye archivos descargados o recibidos sin reinterpretación institucional fuerte.

Ejemplos actuales:

- `data/raw/external/pilares.csv`
- `data/raw/external/deportivos_publicos.csv`
- `data/raw/external/alcaldias.geojson`
- `data/raw/external/denue_cdmx.geojson`
- Excel operativos en `docs/fuentes-operativas/`

Propósito:

- preservar evidencia original;
- permitir re-procesamiento reproducible;
- separar dato fuente de dato curado.

### 2.3 Capa 2 — Normalización e integración
Incluye builders, normalizadores y catálogos auxiliares.

Ejemplos actuales:

- `data/models/integration/build-official-infrastructure.ts`
- `data/models/integration/build-programmed-offer.ts`
- `data/models/integration/build-canchas-operativas.ts`
- `data/models/integration/build-operacion-asistencia.ts`
- `data/models/integration/normalize-alcaldia.ts`
- `data/models/integration/discipline-catalog.ts`
- `data/models/integration/denue-normalizer.ts`

Propósito:

- resolver claves territoriales;
- homologar nombres;
- separar registros observados de capas preparadas;
- construir datasets reproducibles.

### 2.4 Capa 3 — Datasets procesados de dominio
Son salidas intermedias o finales listas para consumo analítico controlado.

Ejemplos actuales:

- `data/processed/infrastructure/official-infrastructure.json`
- `data/processed/canchas/canchas-operativas.json`
- `data/processed/operacion/operacion-asistencia.json`

Propósito:

- encapsular lógica de integración por dominio;
- permitir auditoría aislada por capa;
- desacoplar builders del frontend.

### 2.5 Capa 4 — Agregados curados
Corresponde a datasets listos para visualización institucional.

Ejemplo principal:

- `public/data/dashboard.json`

Propósito:

- exponer solo información compatible con el dashboard;
- mantener al dashboard como lector;
- evitar que la UI haga integración de negocio.

### 2.6 Capa 5 — Consumo visual
Incluye selectores, tipos, componentes y estados de presentación.

Ejemplos:

- `lib/dashboard-types.ts`
- `lib/dashboard-selectors.ts`
- `components/Dashboard.tsx`
- `components/TerritorialMap.tsx`
- `components/CanchasMap.tsx`

Propósito:

- transformar datasets curados en experiencia visual;
- sin alterar la semántica del dato.

### 2.7 Capa 6 — Puente analítico futuro
Todavía no está implementado como backend ni marts reales, pero está previsto por arquitectura.

Debe servir para:

- recibir salidas agregadas de Operación;
- versionar snapshots institucionales;
- publicar métricas agregadas hacia el Dashboard;
- preservar separación entre datos nominales y lectura ejecutiva.

Estado actual:

- **propuesta futura**

---

## 3. Capas de información

La plataforma maneja múltiples capas de información con naturalezas distintas.

### 3.1 Capa de infraestructura real
Representa activos físicos, sedes o instalaciones observables.

Incluye hoy:

- PILARES nominales
- UTOPÍAs documentadas
- deportivos públicos
- geometría oficial de alcaldías

Incluye parcialmente:

- parques / espacios abiertos en forma agregada visible

Puede incluir después:

- DENUE validado por SCIAN
- amenidades verificadas por instalación

Unidad de observación típica:

- sede
- instalación
- establecimiento
- polígono / punto territorial

### 3.2 Capa de oferta programada
Representa actividades calendarizadas o asignadas administrativamente.

Incluye hoy:

- oferta programada de PILARES
- oferta programada de Ponte Pila

No incluye:

- asistencia real
- alumnos inscritos
- permanencia
- ocupación
- demanda

Unidad de observación típica:

- clase
- grupo
- franja horaria
- sesión semanal programada

### 3.3 Capa operativa administrativa
Representa seguimiento institucional interno.

Incluye hoy:

- canchas
- personal operativo
- sedes operativas
- grupos y horarios
- reglas de captura

Incluye como estructura preparada:

- alumnos
- inscripciones
- asistencia
- evidencia
- auditoría

Unidad de observación típica:

- cancha
- personal
- grupo
- sede
- evento operativo

### 3.4 Capa de salud y actividad física agregada
Representa indicadores de referencia oficial que deben territorializarse con precaución.

Incluye hoy:

- actividad física modelada con benchmarks MOPRADEF
- salud modelada con base ENSANUT
- población base y proyección

Unidad de observación típica:

- alcaldía × sexo × edad × año

Naturaleza:

- estimada
- base oficial
- proyectada

### 3.5 Capa de insight compuesto
Representa métricas derivadas del sistema.

Incluye hoy:

- índice de riesgo físico
- comparativos territoriales
- lectura público vs privado
- panorama deportivo por alcaldía

Unidad de observación típica:

- alcaldía
- conjunto de registros agregados

Naturaleza:

- insight

### 3.6 Capa ausente pero prevista
Capas que el sistema reconoce metodológicamente, pero no tiene productivamente:

- participación observada
- demanda revelada
- preferencias declaradas
- universo privado verificado DENUE
- matrícula nominal productiva
- asistencia diaria productiva

Estado:

- **propuesta futura o vacío actual**

---

## 4. Clasificación institucional de los datos

### 4.1 Tipos de dato
El sistema debe seguir al menos estas clasificaciones:

- `real`
- `base_oficial`
- `estimado`
- `preparado`
- `proyectado`
- `insight`
- `no_defendible` cuando aplique en el futuro

### 4.2 Naturaleza del dato
El modelo vigente ya contempla:

- `oferta_programada`
- `infraestructura`
- `participacion_observada`
- `preferencia_declarada`
- `demanda_revelada`

No todas están implementadas con registros reales hoy.

### 4.3 Alcance institucional
El sistema debe identificar si una capa pertenece a:

- `pilares`
- `ponte_pila`
- `pilares_ponte_pila`
- `infraestructura_publica`
- `infraestructura_privada`
- `espacio_publico`
- `cdmx_general`

### 4.4 Nivel de cobertura
Cada capa debe declarar si su cobertura es:

- `completa`
- `parcial`
- `agregada`
- `no_representativa`
- `no_disponible`

### 4.5 Calidad
Escala institucional:

- `A`: registro nominal vigente o evidencia altamente verificable
- `B`: fuente nominal oficial pero antigua o parcial
- `C`: agregado útil con limitaciones importantes
- `D`: preparado, heurístico, incompleto o no publicable como hecho

---

## 5. Catálogos maestros

El sistema necesita catálogos canónicos para evitar ambigüedad y deriva semántica.

### 5.1 Catálogo de alcaldías
Propósito:

- fijar nombres, `geoKey`, etiquetas y compatibilidad espacial

Origen actual:

- `data/raw/alcaldias.ts`
- `data/raw/external/alcaldias.geojson`
- `canonical-catalogs.ts`

Claves mínimas:

- `id`
- `label`
- `geoKey`
- `aliases[]` en una futura versión deseable

### 5.2 Catálogo de canales operativos
Valores vigentes:

- `pilares`
- `ponte_pila`

Propósito:

- separar programación y operación por red institucional

### 5.3 Catálogo de tipos de dato
Valores vigentes:

- `real`
- `base_oficial`
- `estimado`
- `preparado`
- `proyectado`
- `insight`

### 5.4 Catálogo de grados de calidad
Valores vigentes:

- `A`
- `B`
- `C`
- `D`

### 5.5 Catálogo de estado de verificación
Valores vigentes:

- `verificado`
- `parcial`
- `sin_verificar`

### 5.6 Catálogo de sexo
Valores vigentes:

- `Hombres`
- `Mujeres`
- `H`
- `M`
- `No documentado`

Regla:

- el dominio dashboard y el dominio operación pueden usar representaciones distintas, pero deben mapearse de forma controlada.

### 5.7 Catálogo de grupos de edad
Valores vigentes en dashboard:

- `12-17`
- `18-29`
- `30-44`
- `45-59`
- `60+`

Valores de catálogo expuesto:

- incluye también `0-11` como preparación futura

### 5.8 Catálogo de infraestructura
Valores vigentes:

- `PILARES`
- `UTOPÍAs`
- `Deportivos públicos`
- `Gimnasio privado`
- `Club deportivo privado`
- `Academia deportiva privada`
- `Parques / áreas verdes`

Regla:

- no implica que todas las categorías tengan el mismo nivel de verificación real en cada corte.

### 5.9 Catálogo de disciplinas programadas
Propósito:

- homologar texto libre de mallas operativas
- sin sobreinferir

Ejemplos actuales:

- `Aerobics`
- `Aerobics con step`
- `Baile aeróbico`
- `Atletismo — carrera`
- `Atletismo`
- `Fútbol`
- `Box`
- `Acondicionamiento físico`

Regla:

- si la fuente no explicita la disciplina, no se inventa.

### 5.10 Catálogo de estatus UTOPÍA
Valores vigentes o recomendados por investigación:

- `operando`
- `anunciada`
- `en_construccion`
- `sin_verificar`

### 5.11 Catálogo de estatus de cancha
Valores vigentes:

- operativos:
  - `completa`
  - `lista_para_operar`
  - `parcial`
  - `pendiente`
- inauguración:
  - `inaugurada`
  - `proxima`
  - `sin_fecha`

### 5.12 Catálogo de tipo de geolocalización
Valores vigentes en canchas:

- `real`
- `aproximada_pilares`
- `aproximada_alcaldia`
- `sin_coordenada`

### 5.13 Catálogo de roles operativos
Valores vigentes:

- `profesor_promotor`
- `coordinador`
- `lcpo`
- `rh`
- `direccion`
- `superadmin`

Nota:

- el charter también contempla `subcoordinador`; falta materializarlo en dataset y enforcement.

---

## 6. Dimensiones del modelo

### 6.1 Dimensión territorial
Granos vigentes:

- alcaldía
- `geoKey`
- centroides y geometría

Granos futuros recomendados:

- colonia
- AGEB
- manzana
- área de servicio

Estado:

- **propuesta futura**

### 6.2 Dimensión temporal
El sistema usa varios niveles de tiempo:

- año institucional
- fecha de corte
- fecha de captura
- vigencia de la fuente
- periodo de referencia
- día de la semana
- franja horaria

Regla:

- nunca mezclar cortes distintos sin declararlo.

Ejemplo vigente:

- oferta programada PILARES abril 2026
- oferta programada Ponte Pila julio 2026

### 6.3 Dimensión demográfica
Dimensiones vigentes:

- sexo
- grupo de edad
- población

Estado:

- observada en benchmarks agregados;
- modelada en territorialización local.

### 6.4 Dimensión institucional
Entidades vigentes:

- canal
- sede
- instalación
- PILARES asignado
- responsables institucionales
- figura operativa

### 6.5 Dimensión programática
Dimensiones vigentes:

- disciplina
- actividad
- modalidad
- horario
- grupo
- día
- franja

### 6.6 Dimensión de calidad y trazabilidad
Campos mínimos deseables por observación:

- `source_id`
- `source_title`
- `source_institution`
- `source_url`
- `source_date`
- `reference_period_start`
- `reference_period_end`
- `as_of_date`
- `download_date`
- `data_type`
- `quality_grade`
- `coverage_level`
- `unit_of_observation`
- `calculation_version`
- `limitations`

Estado actual:

- implementado parcialmente;
- no universal todavía en todos los datasets.

---

## 7. Hechos y datasets factuales

### 7.1 TerritorialRecord
Objeto:

- matriz territorial principal del dashboard

Grano:

- `alcaldia × year × sex × ageGroup`

Qué contiene:

- población
- activos
- tasas de actividad
- sedentarismo
- obesidad
- sobrepeso
- diabetes
- infraestructura agregada

Naturaleza:

- mixta

Uso:

- KPIs ejecutivos
- salud
- riesgo
- mapa
- panorama

### 7.2 InfrastructureDetailRecord
Objeto:

- detalle de infraestructura por registro o agregado visible

Grano:

- activo físico o bloque agregado por tipo y territorio, según fuente

Qué contiene:

- nombre del espacio
- tipo de espacio
- tipo de infraestructura
- alcaldía
- deportes documentados
- conteo administrativo
- espacios operativos
- capacidad
- coordenadas
- fuente

Uso:

- bloque de infraestructura
- tablas
- mapa
- comparación público vs privado

### 7.3 ProgrammedOfferRecord
Objeto:

- registro agregado de oferta programada por clase/sesión semanal visible

Grano:

- canal × sede × clase/grupo × día × horario

Qué contiene:

- alcaldía
- disciplina original
- disciplina normalizada
- categoría y subcategoría
- actividad original
- sexo del personal
- día y franja
- horas programadas
- corte de fuente

Uso:

- oferta programada
- top disciplinas
- panorama programático

### 7.4 HealthProfileRecord
Objeto:

- perfiles agregados de salud por sexo, edad y año

Grano:

- `year × sex × ageGroup`

Uso:

- distribuciones de salud
- contexto metodológico

### 7.5 CanchaOperationalRecord
Objeto:

- registro operativo de cada cancha

Grano:

- cancha nominal

Qué contiene:

- ubicación
- PILARES asignado
- responsables
- estatus de inauguración
- estatus operativo
- geolocalización
- mallas
- actividades
- observaciones

Uso:

- módulo Canchas
- resumen territorial de canchas
- seguimiento institucional

### 7.6 OperationalModuleDataset
Objeto:

- dataset operativo consolidado para el módulo `/operacion`

Subconjuntos:

- `users`
- `staff`
- `venues`
- `classGroups`
- `students`
- `enrollments`
- `attendanceRecords`
- `evidenceRecords`
- `studentChanges`
- `auditLog`

Estado real:

- `staff`, `venues`, `classGroups`: poblados
- lo demás: estructura lista, datos vacíos o mock/local

---

## 8. Métricas del sistema

Las métricas deben clasificarse por dominio.

### 8.1 Métricas institucionales vigentes

#### Actividad física
- `% población activa`
- `población activa`
- `sedentarismo estimado`
- `actividad por sexo`
- `actividad por edad`
- `actividad por alcaldía`

#### Salud
- `obesidad`
- `sobrepeso`
- `sobrepeso + obesidad`
- `diabetes`

#### Infraestructura
- `sedes PILARES`
- `UTOPÍAs`
- `deportivos públicos`
- `parques / espacios abiertos`
- `densidad por habitante`
- `espacios operativos estimados`
- `capacidad estimada`

#### Oferta programada
- `sedes con programación`
- `clases programadas`
- `sesiones semanales`
- `horas semanales`
- `disciplinas ofertadas`
- `oferta en fin de semana`

#### Canchas
- `total de canchas`
- `inauguradas`
- `próximas`
- `sin fecha`
- `completas`
- `parciales`
- `pendientes`
- `con horario`
- `con promotor`
- `con actividades`

#### Riesgo
- `índice de riesgo físico`
- `ranking de riesgo`
- `semáforo territorial`

### 8.2 Métricas operativas vigentes
- `staffCount`
- `venueCount`
- `classGroupCount`
- `puentePilaClassCount`
- `pilaresClassCount`

### 8.3 Métricas previstas pero no reales todavía
- alumnos activos por clase
- ocupación por grupo
- asistencia capturada
- tasa de impartición
- retención de alumnos
- continuidad operativa
- incidencias por sede
- evidencia por clase
- demanda no atendida

Estado:

- **propuesta futura**

---

## 9. KPIs institucionales

### 9.1 KPI válido
Un KPI publicable debe cumplir:

1. fuente identificable;
2. fecha de corte;
3. unidad explícita;
4. nivel de calidad;
5. tipo de dato visible;
6. compatibilidad metodológica con su visualización.

### 9.2 KPI no válido
No es válido un KPI que:

- mezcle clases con instalaciones;
- mezcle candidatos DENUE con infraestructura real;
- presente programación como participación;
- presente disponibilidad de una amenidad sin evidencia puntual;
- presente demanda sin solicitudes o listas de espera;
- presente preferencia sin instrumento explícito.

### 9.3 Familias de KPI

#### A. KPIs de contexto
- población
- estructura sexo/edad
- benchmark de actividad

#### B. KPIs de oferta programada
- clases
- sesiones
- horas
- sedes programadas

#### C. KPIs de infraestructura
- sedes
- instalaciones
- establecimientos verificados
- espacios abiertos
- canchas

#### D. KPIs operativos
- grupos
- personal
- capturas
- pendientes

#### E. KPIs compuestos
- riesgo físico
- cobertura relativa
- comparativos territoriales

---

## 10. Compatibilidades entre datasets

### 10.1 Compatibilidades vigentes

#### Compatible
- alcaldía ↔ `geoKey`
- PILARES ↔ territorialización por alcaldía
- deportivos públicos ↔ territorialización por alcaldía
- UTOPÍAs ↔ territorialización por alcaldía
- canchas ↔ PILARES asignado / alcaldía
- operación ↔ sedes / personal / canal
- oferta programada ↔ canal / alcaldía / disciplina / horario

#### Parcialmente compatible
- parques ↔ territorialización visible, pero no inventario nominal equivalente
- DENUE ↔ estructura lista, pero no universo verificable actual
- salud ↔ territorialización analítica, no observación directa
- actividad ↔ territorialización analítica, no observación directa

### 10.2 Incompatibilidades metodológicas

#### No sumar entre sí
- clases
- sesiones
- horas
- sedes
- instalaciones
- establecimientos
- parques
- canchas

#### No convertir automáticamente
- oferta programada → participación
- infraestructura → uso
- actividad libre → deporte formal
- texto ambiguo → disciplina específica

### 10.3 Compatibilidad futura condicionada

Podrán convivir en modelo común solo si existe identificación canónica:

- alumno ↔ clase
- clase ↔ sede
- sede ↔ territorio
- asistencia ↔ fecha
- evidencia ↔ asistencia
- demanda ↔ clase o sede

Estado:

- **propuesta futura**

---

## 11. Cobertura y calidad del dato

### 11.1 Cobertura alta hoy
- PILARES nominales
- deportivos públicos nominales
- UTOPÍAs institucionales
- oferta programada PILARES y Ponte Pila
- canchas operativas
- personal operativo
- sedes operativas
- grupos operativos

### 11.2 Cobertura media hoy
- territorialización de salud
- territorialización de actividad
- mapa institucional
- parques/espacios abiertos visibles

### 11.3 Cobertura baja o no disponible
- privados verificables DENUE
- alumnos
- inscripciones
- asistencia
- evidencia
- demanda revelada
- preferencias declaradas

### 11.4 Reglas de publicación

#### Calidad A
Puede alimentar KPI institucional principal.

#### Calidad B
Puede mostrarse con nota explícita de vigencia o parcialidad.

#### Calidad C
Debe llevar advertencia visible y no venderse como verdad exhaustiva.

#### Calidad D
No debe publicarse como hecho definitivo; se usa para preparación, QA o trabajo interno.

---

## 12. Dependencias entre indicadores

### 12.1 Dependencias existentes

#### Riesgo físico
Depende de:

- actividad física inversa
- obesidad
- sedentarismo
- infraestructura per cápita inversa

#### Densidad territorial
Depende de:

- conteos administrativos por tipo
- población territorial

#### Panorama por alcaldía
Depende de:

- población
- oferta programada
- infraestructura visible
- canchas

#### Público vs privado
Depende de:

- clasificación de infraestructura;
- y, para privados, solo debería depender de DENUE verificable cuando exista.

### 12.2 Dependencias futuras

#### Participación observada
Dependerá de:

- alumnos
- inscripciones
- asistencia diaria
- sello temporal
- usuario capturista

#### Demanda revelada
Dependerá de:

- listas de espera
- rechazos
- solicitudes
- cupos

#### Preferencias declaradas
Dependerá de:

- encuesta o instrumento explícito

---

## 13. Roadmap de integración de nuevas fuentes

### 13.1 Prioridad 1 — cerrar vacíos críticos
- DENUE con SCIAN verificable
- matrícula nominal
- asistencia productiva
- evidencia productiva
- auth + RBAC + DB

### 13.2 Prioridad 2 — cerrar vacíos de defensa institucional
- inventario nominal de parques / espacio público
- amenidades verificadas por instalación
- actualización operativa de PILARES
- catálogo interno de UTOPÍAs por amenidad

### 13.3 Prioridad 3 — madurez analítica
- MRP / SAE para salud y actividad
- intervalos de incertidumbre
- snapshots analíticos versionados
- bridge entre operación y dashboard

### 13.4 Prioridad 4 — capas de comportamiento real
- participación observada
- demanda revelada
- preferencias declaradas

---

## 14. Principios metodológicos obligatorios

### 14.1 Principios no negociables
1. No inventar datos.
2. No inferir amenidades o disciplinas sin evidencia.
3. No inferir demanda ni preferencia desde mallas.
4. No presentar estimación como observación.
5. No presentar programación como participación.
6. No presentar ausencia de dato como ausencia real del fenómeno.
7. No mezclar unidades no equivalentes en una sola métrica.
8. No confundir estado operativo con valor estadístico poblacional.

### 14.2 Regla de evidencia primero
Una disciplina, amenidad, estatus o KPI solo puede publicarse si existe:

- texto explícito;
- campo estructurado;
- fuente oficial verificable;
- o regla derivada transparente y documentada.

### 14.3 Regla de corte
Todo indicador debe declarar:

- fecha de corte;
- periodo de referencia;
- versión del cálculo;
- y si mezcla cortes distintos, debe decirlo.

### 14.4 Regla de capa
Toda visualización debe poder responder:

- qué capa está leyendo;
- qué no está leyendo;
- qué no representa.

---

## 15. Reglas para futuras implementaciones

### 15.1 Reglas para builders
Los builders futuros deben:

- leer solo fuentes trazables;
- versionar cortes;
- documentar su output;
- conservar el dato crudo separado;
- no “rellenar” vacíos con heurísticas opacas.

### 15.2 Reglas para nuevas fuentes
Toda fuente nueva debe registrarse con:

- nombre;
- institución;
- URL o ubicación;
- corte;
- periodicidad;
- cobertura;
- licencia si aplica;
- unidad de observación;
- tipo de dato;
- calidad esperada;
- reglas de compatibilidad.

### 15.3 Reglas para frontend
La UI no debe:

- reinterpretar por su cuenta la semántica del dato;
- sumar unidades no equivalentes;
- ocultar el tipo de dato;
- convertir una capa preparada en real por conveniencia visual.

### 15.4 Reglas para operación
El módulo Operación no debe:

- escribir narrativa institucional;
- publicar agregados sin reglas de curación;
- mezclar localStorage con persistencia real en producción;
- permitir acceso nominal transversal sin RBAC.

### 15.5 Reglas para el dashboard
El Dashboard no debe:

- leer tablas nominales como fuente visual principal;
- consumir datos operativos sin agregación curada;
- mostrar preferencias o demanda inexistentes;
- presentar privados no verificados como infraestructura real.

### 15.6 Reglas para QA de datos
Antes de publicar una nueva capa deben revisarse:

1. duplicados;
2. claves territoriales;
3. unidades;
4. corte temporal;
5. cobertura;
6. calidad;
7. compatibilidad con métricas existentes;
8. notas metodológicas visibles.

---

## 16. Modelo objetivo a futuro

### 16.1 Núcleo maestro deseado
Entidades objetivo:

- territories
- venues
- infrastructure_assets
- amenities
- disciplines
- class_groups
- schedule_slots
- staff_profiles
- users
- role_assignments
- students
- guardians
- enrollments
- attendance_sessions
- attendance_records
- evidence_assets
- incidents
- waiting_lists
- demand_requests
- surveys
- analytics_snapshots
- analytics_marts

Estado:

- **propuesta futura**

### 16.2 Regla de puente
La operación deberá alimentar al dashboard solo mediante:

- snapshots;
- vistas analíticas;
- marts curados;
- agregados anonimizados.

Nunca mediante:

- acceso directo del frontend institucional a datos nominales;
- stores compartidos;
- lógica ad hoc de cliente.

---

## 17. Conclusión rectora

El modelo de datos de **Deporte CDMX** no debe medirse por cuántas visualizaciones tiene, sino por qué tan bien separa:

- realidad observada;
- programación institucional;
- contexto agregado;
- estimación analítica;
- y vacíos de información.

La fortaleza del sistema no depende de aparentar completitud.
Depende de declarar con precisión:

- qué se sabe;
- qué no se sabe;
- qué está integrado;
- qué sigue preparado;
- y qué se necesita para evolucionar hacia una plataforma institucional completa.

Ese es el estándar que este documento fija para cualquier implementación futura.
