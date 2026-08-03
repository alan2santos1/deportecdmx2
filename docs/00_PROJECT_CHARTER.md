# 00 Project Charter

## Estado del documento
- Tipo: documento rector estable y normativo
- Fecha de consolidación: 2026-08-03
- Propósito: definir las reglas permanentes del sistema, su separación de dominios y los principios obligatorios de arquitectura, datos y operación

## Nombre provisional del sistema
**Deporte CDMX**

Nombre funcional sugerido de programa:
**Plataforma Institucional de Inteligencia y Operación Deportiva de la Ciudad de México**

## Visión
Construir la plataforma institucional de referencia para la gestión deportiva gubernamental de la Ciudad de México, capaz de combinar:

- lectura ejecutiva territorial;
- seguimiento operativo de sedes, clases y personal;
- integración progresiva de fuentes oficiales;
- trazabilidad metodológica completa;
- una experiencia digital moderna, móvil y defendible ante gobierno.

## Objetivo institucional
Permitir a la Secretaría del Deporte y áreas relacionadas:

- entender territorialmente la actividad física, salud e infraestructura;
- operar clases, personal, sedes y asistencia con trazabilidad;
- tomar decisiones públicas con evidencia explicable;
- distinguir con claridad entre dato observado, estimado, preparado y analítico;
- evolucionar hacia una infraestructura institucional de datos deportivos.

## Problema que resuelve
La información deportiva en CDMX está fragmentada entre:

- fuentes oficiales públicas parciales;
- encuestas agregadas sin grano alcaldía directo;
- registros administrativos y operativos no integrados;
- mallas programáticas que describen oferta, pero no uso ni demanda.

El sistema existe para resolver esa fragmentación sin inventar datos y sin mezclar capas metodológicamente incompatibles.

## Alcance
El sistema cubre dos dominios obligatoriamente separados:

### 1. Dashboard Institucional
Producto ejecutivo de lectura territorial y toma de decisiones.

### 2. Operación y Asistencia
Producto operativo de captura, supervisión y administración diaria.

Además incorpora un módulo operativo-institucional de **Canchas** y una capa de integración de infraestructura pública y privada.

## Módulos principales
- Dashboard Institucional
- Operación y Asistencia
- Canchas
- Infraestructura
- Analítica y trazabilidad

## Dashboard Institucional
El Dashboard Institucional es un sistema de **lectura ejecutiva**.

Su función es:
- leer datasets curados;
- mostrar indicadores, mapas y comparativos;
- comunicar contexto metodológico;
- priorizar decisiones institucionales.

No debe:
- capturar asistencia;
- administrar alumnos;
- editar clases;
- modificar personal;
- escribir registros operativos.

## Operación y Asistencia
Operación y Asistencia es el sistema de **registro y supervisión operativa**.

Su función es:
- administrar oferta programada;
- capturar asistencia;
- registrar evidencia;
- gestionar matrícula operativa;
- monitorear cumplimiento por rol y ámbito.

No debe:
- calcular narrativa institucional;
- publicar por sí mismo inferencias territoriales;
- presentar estimaciones como hechos observados;
- sustituir el tablero ejecutivo.

## Canchas
El módulo de Canchas es un componente operativo-administrativo con capacidad de alimentar métricas institucionales.

Debe distinguir claramente entre:
- registro operativo de cancha;
- estado de inauguración;
- completitud documental;
- ubicación real o aproximada;
- relación con PILARES y responsables.

## Infraestructura
La capa de infraestructura integra:
- PILARES;
- UTOPÍAs;
- deportivos públicos;
- parques y espacios abiertos;
- infraestructura privada vía DENUE, cuando la clasificación sea defendible.

La infraestructura debe mostrarse con distinción explícita entre:
- real;
- preparado;
- estimado.

## Analítica
La analítica del sistema se divide en:

### Analítica institucional
- salud;
- actividad física;
- infraestructura;
- riesgo territorial;
- cobertura pública y privada;
- desempeño agregado.

### Analítica operativa
- clases programadas;
- clases impartidas;
- asistencias capturadas;
- cobertura de personal;
- continuidad operativa;
- incidencias;
- evidencia.

## Principios de arquitectura
1. El sistema es **multi-dominio**: institucional y operativo comparten producto, no lógica de negocio.
2. El Dashboard Institucional es de **solo lectura**.
3. Operación es el dominio que **escribe** datos operativos.
4. La comunicación entre dominios debe ocurrir mediante **agregados curados**, no mediante lectura directa de tablas de captura.
5. Los módulos pueden compartir **design system**, pero no deben compartir reglas de negocio críticas.
6. Toda entidad operacional productiva debe tener:
   - identificador estable;
   - trazabilidad de fuente;
   - versión de cálculo o transformación;
   - fecha de corte o de captura.
7. Ninguna capa visual debe depender de inferencias ocultas.
8. El sistema debe ser compatible con evolución hacia:
   - API;
   - DB;
   - storage;
   - RBAC;
   - marts analíticos.

## Principios de datos
1. No inventar datos.
2. No completar campos faltantes sin evidencia suficiente.
3. No mezclar en una misma métrica unidades administrativas y unidades analíticas sin etiquetado explícito.
4. Toda métrica debe tener:
   - fuente;
   - fecha de corte;
   - tipo de dato;
   - calidad;
   - versión de cálculo.
5. Los datos operativos no deben transformarse automáticamente en narrativa pública.
6. Los datos crudos deben conservarse distinguibles de las capas procesadas.

## Principios metodológicos
1. Nunca presentar dato estimado como observado.
2. Nunca inferir amenidades o disciplinas sin evidencia.
3. Nunca inferir preferencia o demanda a partir de mallas programadas.
4. Nunca inferir participación ciudadana desde oferta programada.
5. Los Excel de PILARES y Ponte Pila representan **oferta programada**, no demanda, preferencia ni uso comprobado.
6. `investigacion_operativa.md` es narrativa cualitativa y no debe alimentar estadísticas sin validación adicional.
7. El Dashboard debe distinguir siempre:
   - dato real;
   - dato base oficial;
   - dato estimado;
   - dato preparado;
   - dato proyectado;
   - insight.
8. Las capas estimadas deben documentar la lógica de territorialización.

## Principios de seguridad
1. La información operativa debe seguir principio de mínimo privilegio.
2. Un profesor nunca debe ver datos de otros profesores.
3. El acceso debe definirse por:
   - identidad;
   - rol;
   - ámbito;
   - vigencia.
4. La plataforma debe minimizar datos personales visibles por defecto.
5. Evidencia y asistencia deben conservar bitácora de autor, fecha y hora.
6. Los datos sensibles no deben vivir solo en cliente para producción.

## Principios UX mobile-first
1. La prioridad de uso del módulo Operación es móvil.
2. La experiencia debe ser rápida, clara y usable en campo.
3. El diseño debe evitar patrones de ERP antiguo.
4. La interacción debe seguir una línea visual tipo:
   - Apple;
   - Linear;
   - Notion;
   - Stripe Dashboard.
5. La complejidad institucional debe resolverse con jerarquía visual, no con saturación.

## Clasificación de datos
El sistema debe usar, como mínimo, estas categorías:

- `real`
- `base_oficial`
- `estimado`
- `preparado`
- `proyectado`
- `insight`
- `no_defendible` para aquello que no deba exponerse institucionalmente

## Reglas de trazabilidad
Toda métrica, tabla, KPI o visualización debe poder responder:

1. ¿Qué fuente la alimenta?
2. ¿Cuál es la fecha de corte?
3. ¿Qué tipo de dato es?
4. ¿Qué versión de cálculo la produjo?
5. ¿Qué limitaciones metodológicas tiene?

## Separación obligatoria de conceptos
El sistema debe conservar separación explícita entre:

### Oferta programada
Lo que está calendarizado, asignado o previsto operativamente.

### Participación
Lo que efectivamente ocurrió en términos de asistencia o presencia comprobada.

### Preferencias
Lo que la población prefiere practicar o consumir.

### Demanda
Lo que la población solicita, necesita o intenta acceder.

### Infraestructura
La existencia y características de espacios, sedes o establecimientos.

## Reglas de separación obligatoria
- Oferta programada no equivale a participación.
- Participación no equivale a preferencia.
- Preferencia no equivale a demanda.
- Infraestructura no equivale a uso.
- Programación no equivale a impacto.
- Más espacios no equivale automáticamente a mayor actividad.

## Roles generales
- Profesor o promotor
- Coordinador
- Subcoordinador
- LCPO
- RH
- Dirección
- Administrador / superadmin

## Cosas que nunca deben hacerse
- El Dashboard no escribe datos operativos.
- Operación no calcula narrativa institucional.
- Nunca inferir preferencia o demanda desde las mallas.
- Nunca presentar dato estimado como observado.
- Nunca inferir amenidades o disciplinas sin evidencia.
- Nunca mezclar oferta programada con participación real sin etiquetado.
- Nunca usar una narrativa cualitativa como estadística oficial.
- Nunca exponer datos personales operativos sin necesidad institucional explícita.

## Definición de qué escribe Operación
Operación escribe:
- personal asignado;
- clases y grupos;
- horarios;
- matrícula nominal;
- asistencia;
- evidencias;
- incidencias;
- movimientos de alta/baja;
- auditoría de acciones operativas.

## Definición de qué lee el Dashboard
El Dashboard lee:
- agregados curados;
- métricas territoriales;
- métricas operativas agregadas;
- indicadores institucionales;
- fuentes oficiales integradas;
- capas metodológicas documentadas.

No debe leer directamente tablas transaccionales nominales como fuente visual principal.

## Regla de comunicación entre módulos
La comunicación entre Operación y Dashboard debe hacerse mediante:
- agregados curados;
- marts o vistas analíticas;
- snapshots versionados;
- reglas de publicación explícitas.

No debe hacerse mediante:
- stores compartidos de UI;
- `localStorage`;
- lectura directa del cliente sobre tablas de captura;
- inferencias ad hoc no versionadas.

## Criterios de privacidad y minimización
1. Recolectar solo los datos personales necesarios para la operación.
2. Mostrar información nominal solo a roles autorizados.
3. El Dashboard Institucional debe consumir datos agregados, no nominales.
4. Las salidas analíticas deben privilegiar nivel:
   - alcaldía;
   - sede;
   - disciplina;
   - grupo;
   - fecha,
   antes que persona.
5. La evidencia fotográfica debe administrarse con reglas de acceso, retención y auditoría.

## Criterio de convivencia entre dominios
El sistema es una sola plataforma, pero con dos responsabilidades distintas:

- **Operación** registra y administra la realidad operativa.
- **Dashboard Institucional** interpreta y comunica resultados agregados.

La coexistencia es obligatoria.
La mezcla de responsabilidades está prohibida.
