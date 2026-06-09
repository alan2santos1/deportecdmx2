# Operación y Asistencia

## Objetivo
Preparar una capa operativa separada del dashboard territorial para controlar clases, personal operativo, sedes, horarios y futura captura de asistencia con trazabilidad.

Esta capa **no se mezcla** con los módulos institucionales de actividad física, infraestructura o riesgo. Vive como módulo independiente de operación.

## Fuentes integradas
1. `docs/MALLA HORARIA PUNTOS PONTE PILA 2026.xlsx`
   - Hoja: `MALLA MAY 2026`
   - Cobertura real: puntos Ponte Pila, promotor, disciplina, área, horario por día, sede que recibe el reporte de asistencia.

2. `docs/ACUMULADA PILARES ABRIL 26 GDE.xlsx`
   - Hoja: `abril`
   - Cobertura real: sede PILARES, figura, persona asignada, tipo de promotor, actividad, actividad desagregada, horario por día, coordinador, subcoordinación, LCPO.

## Hallazgos semánticos clave
### 1. El archivo acumulado no es asistencia diaria
La hoja `abril` **no contiene pase de lista transaccional**. Contiene carga operativa acumulada por persona, sede y horario.

### 2. El campo `NOMBRE COMPLETO DEL BENEFICIARIO` no se usa como alumno
Aunque el encabezado dice “beneficiario”, por el contexto operativo de la fila:
- `FIGURA`
- `TIPO DE PROMOTOR`
- `ACTIVIDAD`
- `ACTIVIDAD DESAGREGADA`
- `TOTAL DE HORAS SEMANA`

se interpreta como **personal operativo asignado** y no como alumno nominal.

### 3. No existe todavía padrón nominal de alumnos por clase
Por eso:
- `students`
- `enrollments`
- `attendanceRecords`
- `evidenceRecords`

quedan estructurados pero vacíos en esta primera iteración.

## Dataset procesado
Se genera en:

- `data/processed/operacion/operacion-asistencia.json`
- `public/data/operacion-asistencia.json`

## Qué ya quedó funcional
### Rutas activas
- `/operacion`
- `/operacion/profesor`
- `/operacion/asistencia`
- `/operacion/clases`
- `/operacion/admin`

### Funcionalidad ya operativa
- selección local de profesor/promotor desde dataset procesado
- búsqueda por nombre, disciplina o actividad
- navegación visible entre Resumen, Profesor, Asistencia, Clases y Admin
- visualización de clases asignadas por persona
- resumen de sedes, disciplinas, horarios semanales y total de horas por profesor
- catálogo navegable de clases con filtros básicos
- selección de clase para pase de lista
- roster mock determinístico por clase para simular matrícula inicial
- alta manual de alumno en cliente
- baja y reactivación de inscripción con historial local
- marcación de asistencia del día con estados `presente`, `retardo` y `falta`
- guardado local de timestamp, clase, profesor/promotor y usuario visible
- bloqueo visual de captura retroactiva
- carga y vista previa de evidencia fotográfica
- asociación local de evidencia a clase y fecha
- filtros administrativos por canal, alcaldía, sede y disciplina
- indicadores admin de clases del día, listas capturadas, pendientes, disciplinas e incidencias

## Qué sigue mock o preparado
- alumnos mock y manuales viven en `localStorage`, no en base de datos
- inscripciones mock y manuales viven en `localStorage`, no en base de datos
- asistencias capturadas viven en `localStorage`, no en base de datos
- evidencia fotográfica se conserva localmente en navegador para la primera versión funcional
- la selección de rol existe como contrato y UI, pero todavía no es autenticación real

## Qué necesita base de datos
- padrón nominal real de alumnos por grupo
- movimientos de alta y baja con auditoría institucional
- asistencia diaria con sello de servidor
- almacenamiento real de evidencia fotográfica
- usuarios, sesiones y permisos por rol
- bitácora de modificaciones y correcciones

## Estructura del dataset
### `meta`
Describe archivos fuente, hojas, número de filas y notas metodológicas.

### `summary`
Resume:
- personal operativo
- sedes
- grupos/clases
- grupos Ponte Pila
- grupos PILARES
- número de entidades preparadas para asistencia

### `staff`
Personal operativo consolidado desde ambas fuentes:
- promotores
- entrenadores
- animadores

Campos clave:
- `fullName`
- `figures`
- `channels`
- `disciplines`
- `activities`
- `classGroupIds`

### `venues`
Sedes operativas:
- puntos Ponte Pila
- sedes PILARES

Campos clave:
- `channel`
- `name`
- `alcaldia`
- `address`
- `georeferenceLink`
- `latitude`
- `longitude`
- `reportingPilaresName`
- `coordinatorName`
- `subcoordinatorName`
- `lcpoName`

### `classGroups`
Grupo operativo semanal derivado de una fila real de malla.

Campos clave:
- `channel`
- `venueId`
- `staffId`
- `figure`
- `disciplineCatalog2026`
- `activityName`
- `activityDetail`
- `modality`
- `weeklySchedule`
- `weeklyHours`

### `students`
Vacío en esta fase por falta de fuente nominal confiable de alumnos.

### `enrollments`
Vacío en esta fase. Queda listo para futuras altas y bajas con historial.

### `attendanceRecords`
Vacío en esta fase. Queda listo para registrar:
- fecha
- hora
- usuario
- evidencia
- estado de asistencia

### `evidenceRecords`
Vacío en esta fase. Queda listo para evidencia fotográfica asociada a sesión y asistencia.

### `attendanceCaptureRules`
Reglas funcionales preparadas:
- solo el día de la clase
- trazabilidad obligatoria
- altas y bajas con historial

### `rolePermissions`
Roles preparados:
- `profesor_promotor`
- `subcoordinacion`
- `lcpo`
- `rh`
- `admin`
- `direccion`

### `routeProposals`
Propuesta inicial de rutas UI:
- `/operacion`
- `/operacion/clases`
- `/operacion/asistencia`
- `/operacion/alumnos`
- `/operacion/evidencia`
- `/operacion/admin`

## Reglas de negocio preparadas
### Asistencia
- solo se puede pasar lista el día de la clase
- cada captura debe guardar fecha y hora
- cada captura debe guardar usuario responsable
- la evidencia queda asociada a sesión o lista

### Permisos
- el profesor/promotor solo ve sus clases
- subcoordinación y LCPO ven su ámbito operativo
- RH, administración y dirección ven histórico y tiempo real

### Matrícula
- las altas y bajas no deben borrar historial
- una baja debe conservar fecha y responsable

## Qué es real hoy
- personal operativo
- sedes
- grupos/clases
- horarios por día
- coordinadores, subcoordinación y LCPO cuando la fuente lo trae

## Qué queda solo preparado
- alumnos nominales por clase
- asistencia diaria transaccional
- evidencia fotográfica
- auditoría completa por usuario
- permisos activos en aplicación

## Cómo funciona hoy la simulación diaria
### Profesor
- selecciona un profesor/promotor desde el dataset procesado
- consulta sus clases, sedes, disciplinas, horarios y horas semanales

### Asistencia
- selecciona profesor
- selecciona clase
- solo puede usar la fecha del día
- ve roster mock coherente por clase
- agrega alumnos manualmente cuando hace falta
- marca `presente`, `retardo` o `falta`
- asocia evidencia fotográfica local

### Admin
- consulta todas las clases sin depender del rol mock del profesor
- filtra por canal, alcaldía, sede y disciplina
- revisa clases del día, listas capturadas, pendientes e incidencias

## Propuesta de implementación siguiente
1. Conectar captura diaria de asistencia por clase.
2. Incorporar padrón nominal de alumnos por grupo.
3. Agregar storage de evidencia.
4. Implementar control de acceso por rol.
5. Crear vistas separadas por profesor, sede y dirección.

## Propuesta de tablas reales futuras
### `operation_users`
- `id`
- `full_name`
- `role`
- `staff_reference_id`
- `email`
- `status`

### `operation_venues`
- `id`
- `channel`
- `name`
- `alcaldia`
- `geo_key`
- `address`
- `latitude`
- `longitude`

### `operation_class_groups`
- `id`
- `venue_id`
- `staff_user_id`
- `discipline`
- `activity`
- `modality`
- `weekly_hours`
- `status`

### `operation_class_schedule_slots`
- `id`
- `class_group_id`
- `day_of_week`
- `start_time`
- `end_time`

### `operation_students`
- `id`
- `full_name`
- `sex`
- `birth_date`
- `status`

### `operation_enrollments`
- `id`
- `class_group_id`
- `student_id`
- `status`
- `start_date`
- `end_date`
- `created_by_user_id`

### `operation_enrollment_history`
- `id`
- `enrollment_id`
- `status`
- `changed_at`
- `changed_by_user_id`
- `note`

### `operation_attendance_records`
- `id`
- `class_group_id`
- `student_id`
- `attendance_date`
- `attendance_time`
- `status`
- `recorded_by_user_id`
- `evidence_asset_id`

### `operation_evidence_assets`
- `id`
- `class_group_id`
- `attendance_date`
- `uploaded_by_user_id`
- `captured_at`
- `storage_url`
- `mime_type`
- `file_name`
