# Operación y Asistencia

## Objetivo
Mantener una capa operativa separada del dashboard territorial para control interno de:

- personal operativo
- sedes
- clases y mallas horarias
- matrícula mock/local
- asistencia diaria
- evidencia fotográfica
- supervisión administrativa

Esta capa no se mezcla con infraestructura, riesgo, mapas institucionales ni módulos territoriales.

## Fuentes integradas
1. `docs/MALLA HORARIA PUNTOS PONTE PILA 2026.xlsx`
   - Hoja: `MALLA MAY 2026`
   - Cobertura real: puntos Ponte Pila, promotor, disciplina, área, horario por día, sede que recibe el reporte de asistencia.

2. `docs/ACUMULADA PILARES ABRIL 26 GDE.xlsx`
   - Hoja: `abril`
   - Cobertura real: sede PILARES, figura, persona asignada, tipo de promotor, actividad, actividad desagregada, horario por día, coordinador y LCPO.

3. `public/data/operacion-asistencia.json`
   - Dataset procesado generado desde ambas fuentes.

## Hallazgos semánticos clave
### 1. La acumulada no es asistencia diaria
La hoja `abril` describe carga operativa y asignación de personal. No contiene pase de lista transaccional.

### 2. `NOMBRE COMPLETO DEL BENEFICIARIO` se usa como personal operativo
Por el contexto de figura, actividad y carga horaria, ese campo se interpreta como persona asignada a la operación y no como alumno nominal.

### 3. No existe padrón nominal de alumnos por clase en las fuentes base
Por eso la matrícula actual sigue como mock/local y vive en navegador.

## Dataset procesado
Se genera en:

- `data/processed/operacion/operacion-asistencia.json`
- `public/data/operacion-asistencia.json`

## Qué ya funciona
### Rutas activas
- `/operacion`
- `/operacion/profesor`
- `/operacion/asistencia`
- `/operacion/clases`
- `/operacion/admin`

### Flujo funcional actual
- navegación operativa visible entre Resumen, Profesor, Asistencia, Clases y Admin
- UI mobile-first con selectores buscables en lugar de selects nativos grandes
- nombres de personal normalizados con:
  - `rawFullName`
  - `firstName`
  - `paternalLastName`
  - `maternalLastName`
  - `displayName`
  - `sortableName`
- usuarios internos mock preparados por rol
- simulación de acceso por profesor/promotor
- lectura de clases propias, sedes, disciplinas y horarios
- catálogo de clases con filtros rápidos
- pase de lista del día con estados:
  - `presente`
  - `retardo`
  - `falta`
  - `justificado`
- alta manual de alumno por clase con nombre y apellidos separados
- baja y reactivación de inscripción con historial local
- carga de evidencia fotográfica con preview y metadata local
- panel admin con:
  - clases del día
  - listas capturadas
  - pendientes
  - incidencias
  - alumnos activos mock/local
  - evidencias
  - últimas listas guardadas
- bitácora local preparada:
  - `attendanceRecords`
  - `evidenceRecords`
  - `studentChanges`
  - `auditLog`

## Qué sigue mock/local
- alumnos e inscripciones viven en `localStorage`
- asistencias viven en `localStorage`
- evidencia vive en `localStorage`
- usuarios y roles son mock derivados del dataset
- el control de permisos aún no se aplica del lado servidor

## Qué necesita base de datos para producción
- usuarios reales y autenticación
- relación usuario ↔ personal ↔ sede ↔ alcance
- padrón nominal de alumnos por clase
- altas y bajas persistentes
- asistencia diaria con sello de servidor
- almacenamiento real de evidencia
- bitácora institucional no editable por cliente

## Estructura del dataset
### `meta`
Archivos, hojas, filas, notas y limitaciones metodológicas.

### `summary`
Incluye:
- `userCount`
- `staffCount`
- `venueCount`
- `classGroupCount`
- `attendanceRecordCount`
- `studentChangeCount`
- `auditLogCount`

### `users`
Usuarios internos mock preparados:
- `userId`
- `staffId`
- `role`
- `username`
- `displayName`
- `assignedScope`
- `active`

### `staff`
Personal operativo consolidado con nombre original y nombre normalizado para UI.

Campos clave:
- `rawFullName`
- `displayName`
- `sortableName`
- `figures`
- `channels`
- `disciplines`
- `activities`
- `classGroupIds`

### `venues`
Sedes Ponte Pila y PILARES.

### `classGroups`
Grupos operativos reales derivados de las mallas.

### `students`
Sigue vacío en fuente base. La app completa matrícula mock/local en cliente.

### `enrollments`
Sigue vacío en fuente base. La app crea altas y bajas locales.

### `attendanceRecords`
Contrato listo para guardar:
- clase
- alumno
- profesor
- fecha
- hora
- estado
- evidencia asociada

### `evidenceRecords`
Metadata local de evidencia fotográfica:
- `evidenceId`
- `classGroupId`
- `attendanceDate`
- `uploadedByUserId`
- `capturedAt`
- `fileName`
- `localPreviewUrl`

### `studentChanges`
Bitácora local de:
- alta
- baja
- reactivación
- edición

### `auditLog`
Bitácora local de acciones relevantes:
- usuario
- timestamp
- entidad
- acción
- nota

## Modelo de roles preparado
- `profesor_promotor`
  - solo sus clases y grupos
- `coordinador`
  - seguimiento de zona o sede asignada
- `lcpo`
  - operación de la sede
- `rh`
  - lectura transversal administrativa
- `direccion`
  - lectura ejecutiva completa
- `superadmin`
  - corrección, reasignación y administración operativa

## Reglas de negocio activas
### Asistencia
- solo se puede capturar el día actual
- no se permite fecha pasada
- no se permite fecha futura
- cada registro guarda timestamp y usuario simulado

### Matrícula
- no se borra historial
- una baja conserva traza local
- la reactivación queda registrada

### Evidencia
- se asocia a clase y fecha
- aún no sube a storage real

## Flujo actual por vista
### `/operacion/profesor`
- selecciona profesor/promotor
- muestra únicamente su carga operativa
- usa nombre normalizado
- resume horas, sedes, disciplinas y horarios

### `/operacion/asistencia`
- selecciona profesor
- selecciona clase
- fecha bloqueada al día actual
- muestra alumnos mock/local
- permite alta manual
- permite `presente`, `retardo`, `falta`, `justificado`
- guarda asistencia y evidencia local

### `/operacion/admin`
- filtra por canal, alcaldía, sede, disciplina y profesor/promotor
- muestra pendientes y últimas capturas
- concentra trazabilidad mock/local de la sesión

## Limitaciones actuales
- la normalización de nombres asume formato `APELLIDO PATERNO APELLIDO MATERNO NOMBRES` cuando hay al menos tres tokens
- si un nombre no se puede separar con suficiente claridad, se conserva fallback limpio y el valor original
- la captura local depende del navegador y no sincroniza entre dispositivos

## Tablas sugeridas para producción
### `operation_users`
- `id`
- `staff_id`
- `role`
- `username`
- `email`
- `status`

### `operation_venues`
- `id`
- `channel`
- `name`
- `alcaldia`
- `geo_key`
- `address`

### `operation_class_groups`
- `id`
- `venue_id`
- `staff_id`
- `discipline`
- `activity`
- `weekly_hours`

### `operation_students`
- `id`
- `first_name`
- `paternal_last_name`
- `maternal_last_name`
- `sex`
- `age`
- `status`

### `operation_enrollments`
- `id`
- `class_group_id`
- `student_id`
- `status`
- `start_date`
- `end_date`
- `created_by_user_id`

### `operation_student_changes`
- `id`
- `enrollment_id`
- `student_id`
- `change_type`
- `timestamp`
- `changed_by_user_id`
- `notes`

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
- `storage_path`

### `operation_audit_log`
- `id`
- `user_id`
- `action`
- `entity_type`
- `entity_id`
- `notes`
- `created_at`
