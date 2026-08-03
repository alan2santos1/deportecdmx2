# 06 Project Audit

## Estado del documento
- Tipo: auditoría técnica y metodológica integral
- Fecha de corte: 2026-08-03
- Alcance: revisión crítica de documentación rectora, investigación vigente, código, builders, tipos, datasets procesados y rutas activas
- Restricción aplicada: no se modificó código, datasets ni builders para producir este documento

---

## 1. Criterio de auditoría

La auditoría se realizó contrastando:

1. documentos rectores del proyecto;
2. investigación metodológica más reciente;
3. contratos de tipos y capas de datos;
4. builders y ETL activos;
5. rutas y componentes visibles;
6. datasets procesados y agregados generados.

La evaluación usa seis preguntas obligatorias:

1. ¿La capa respeta la unidad de observación correcta?
2. ¿La capa distingue real, estimado, preparado, proyectado e insight?
3. ¿La fuente integrada es suficientemente defendible para el uso que recibe?
4. ¿La UI comunica las limitaciones reales del dato?
5. ¿El builder produce un resultado coherente con la metodología declarada?
6. ¿La evolución futura puede hacerse sin romper arquitectura?

---

## 2. Diagnóstico ejecutivo

## 2.1 Lo mejor construido

- La separación conceptual entre `Dashboard Institucional` y `/operacion` está bien planteada en la documentación y en la estructura general del repositorio.
- El proyecto ya tiene un patrón ETL reproducible: fuentes crudas, normalización, datasets procesados y agregado institucional final.
- La trazabilidad documental es mucho más madura que el promedio del código actual.
- Las capas reales más defendibles ya existen y están integradas: PILARES históricos, deportivos públicos, geometría de alcaldías, UTOPÍAs como bloque institucional y canchas administrativas.
- El proyecto ya dejó de depender de lógica clínica heredada y hoy responde a dominio deportivo e institucional.
- La UI del dashboard ya intenta mostrar capa, fuente y nota metodológica en varios bloques. Eso es correcto como dirección de producto.

## 2.2 Hallazgo central

La documentación del proyecto ya describe un sistema institucional mucho más riguroso de lo que el código efectivamente soporta hoy.

En otras palabras:

- la gobernanza metodológica va por delante de la implementación;
- la arquitectura va por delante de la persistencia real;
- la narrativa institucional va por delante de la solidez de varios indicadores.

El mayor riesgo no es visual ni de frontend. El mayor riesgo es que algunas capas del dashboard todavía convierten seeds, supuestos o mezclas parciales en métricas que se leen como si fueran institucionalmente maduras.

## 2.3 Conclusión crítica

El proyecto no está roto. Pero tampoco está listo para presentarse como plataforma institucional cerrada y metodológicamente resuelta.

Está en un estado intermedio:

- fuerte en estructura, intención y trazabilidad;
- desigual en validez estadística de varios indicadores;
- incompleto en operación productiva real;
- todavía vulnerable a confusión entre oferta, infraestructura, participación y lectura territorial.

---

## 3. Hallazgos transversales

## 3.1 Contradicciones entre documentación y código

### A. El modelo rector prohíbe inferencias fuertes; el dashboard aún usa seeds sintéticos

`data/models/build-dashboard-data.ts` sigue fabricando:

- actividad por alcaldía;
- `sportFocus` por grupo de edad;
- riesgo territorial;
- capacidad y espacios operativos;
- parte de la infraestructura territorial agregada fuera de la integración nominal real.

Esto contradice parcialmente el principio rector de no llenar vacíos con supuestos implícitos. Aunque la UI sí etiqueta varias capas como estimadas o insights, el problema no es solo visual: la construcción base sigue dependiendo de semillas artificiales (`yearSeeds`, `ageSeeds`, `sexSeeds`, `alcaldiasSeed`).

### B. El proyecto declara que `sportsRecords` no debe inventarse; el dashboard conserva la idea de ranking deportivo aunque el dataset está vacío

- `public/data/dashboard.json` reporta `sportsRecords: 0`.
- El código del dashboard conserva selectores, gráficos y topes por disciplina apoyados en oferta programada e infraestructura documentada.

Esto es parcialmente correcto si se presenta como oferta programada. Es incorrecto si la UI o la narrativa dejan entender “deportes más practicados”.

### C. Operación declara rutas preparadas que no existen

El dataset operativo incluye propuestas para:

- `/operacion/alumnos`
- `/operacion/evidencia`

pero esas rutas no están implementadas en `app/operacion/`.

Eso genera una divergencia entre contrato documental y estado real del módulo.

### D. El control de acceso privado existe, pero no constituye seguridad institucional real

`components/AccessGate.tsx`:

- valida una contraseña en cliente;
- usa hash embebido en frontend;
- persiste sesión en `sessionStorage`.

Esto sirve como barrera ligera para hosting estático. No sirve como control real de acceso institucional ni cumple principios de seguridad de mínimo privilegio.

## 3.2 Deuda estructural principal

La arquitectura ya exige:

- auth real;
- RBAC;
- API;
- DB;
- storage;
- bridge analítico.

Nada de eso existe todavía de forma productiva.

Por tanto:

- el dashboard ya es un lector curado aceptable para demo institucional controlada;
- `/operacion` sigue siendo un prototipo funcional cliente-only;
- la comunicación entre ambos dominios todavía no ocurre mediante agregados curados productivos, sino por convivencia en el mismo repositorio.

## 3.3 Deuda metodológica principal

Persisten cuatro huecos estructurales:

1. no existe participación observada real;
2. no existe demanda revelada;
3. no existe preferencia declarada;
4. la territorialización de salud y actividad sigue siendo modelada, no observada.

Mientras esos huecos sigan abiertos, ciertos módulos solo pueden leerse como:

- contexto;
- hipótesis institucional;
- priorización;
- planeación.

No como medición confirmada de comportamiento poblacional.

---

## 4. Auditoría por módulo

## 4.1 Dashboard Institucional

### Qué cumple completamente

- Lee un dataset curado (`public/data/dashboard.json`) en vez de resolver negocio directamente en UI.
- Tiene módulos separados y entendibles: Panorama, Actividad, Infraestructura, Canchas, Salud, Riesgo, Metodología y Datos.
- Ya muestra fuente, tipo de dato y notas metodológicas en varios bloques.
- Mantiene separación visual respecto de `/operacion`.

### Qué cumple parcialmente

- La jerarquía institucional está resuelta, pero parte del contenido sigue dependiendo de capas débiles o sintéticas.
- El dashboard distingue `real`, `estimado`, `preparado` e `insight`, pero varias métricas derivan de una misma base sintética y no de fuentes independientes.
- La capa de filtros es funcional, pero no siempre diferencia entre “filtro no aplica” y “métrica estructuralmente no observable”.

### Qué contradice el modelo de datos

- `build-dashboard-data.ts` sigue generando `TerritorialRecord` con campos deportivos y de actividad a partir de seeds y no de datasets observados por alcaldía.
- `sportFocus` es una asignación fija por grupo de edad, no una observación ni una clasificación defendible de práctica.
- `dominantInfraType` proviene de una semilla interna, no de una comparación institucional real entre capas observadas y actualizadas.

### Qué contradice la metodología

- La existencia de `sportFocus` y de ciertos resúmenes deportivos sugiere una cercanía semántica con “práctica deportiva”, aunque el propio proyecto reconoce que no existe esa medición por alcaldía.
- La serie 2020–2023 es retrospectiva preparada, pero la estructura del dashboard la normaliza como parte de la misma secuencia general.

### Deuda técnica

- El agregado final depende de builders monolíticos y de seeds incrustados en código.
- No existe separación fuerte entre:
  - dataset observado;
  - dataset modelado;
  - snapshot de publicación.
- No hay pruebas automáticas de consistencia entre documentación y dataset final.

### Deuda metodológica

- No hay capa de incertidumbre para actividad y salud modeladas.
- No hay distinción formal de “no defendible” en el contrato principal de visualización, pese a que el charter sí la contempla.
- El dashboard todavía puede inducir a lectura excesiva de precisión territorial.

### Datasets débiles

- `territorialRecords`
- `mapAreas`
- cualquier lectura deportiva no basada en oferta programada explícita

### Fuentes oficiales faltantes

- microdatos y metodología reproducible para SAE/MRP;
- inventario nominal actual de áreas verdes/espacio público integrado al repo;
- privados DENUE con SCIAN verificable usable;
- capas de contexto territorial adicionales si se quieren sostener ciertas narrativas.

### Indicadores que deben eliminarse

- Ninguno debe “eliminarse” de inmediato solo por UI, pero sí debe retirarse cualquier lectura que sugiera práctica observada deportiva por alcaldía cuando provenga de seeds o de oferta programada.

### Indicadores que deben corregirse

- `sportFocus`
- cualquier headline que sugiera “deporte dominante” territorial observado
- cualquier serie 2020–2023 presentada sin suficiente advertencia de preparación retrospectiva

### Qué puede evolucionar sin romper arquitectura

- fuente y metadata por KPI;
- filtros con mejor semántica de aplicabilidad;
- separación más dura entre panel observado y panel modelado;
- snapshots analíticos de Operación cuando existan.

---

## 4.2 Territorio / Mapa

### Qué cumple completamente

- La geometría de alcaldías está integrada localmente y no depende de APIs externas.
- El mapa distingue métricas y ya incorpora leyenda institucional básica.
- La UI del mapa es funcional y consistente con el sistema visual.

### Qué cumple parcialmente

- El mapa comunica que algunas capas son estimadas o insights, pero sigue renderizando métricas construidas sobre una base sintética territorial.
- La lectura lateral es clara, pero mezcla capas con distinta solidez en una misma narrativa territorial.

### Qué contradice el modelo de datos

- `MapAreaRecord` resume actividad, obesidad, diabetes, sedentarismo, riesgo e infraestructura total en un mismo objeto como si compartieran el mismo nivel de observación.
- `totalInfrastructureCount` mezcla categorías administrativas heterogéneas con reglas sintéticas derivadas del mismo territorial seed.

### Qué contradice la metodología

- El mapa puede dar sensación de precisión alcaldía-a-alcaldía sobre actividad y salud sin intervalos de incertidumbre.
- El `riskScore` es un índice de priorización válido como insight, pero el cálculo actual es arbitrario desde el punto de vista epidemiológico y no está calibrado con una metodología publicada.

### Deuda técnica

- El score está embebido en código.
- No hay versión formal del modelo de riesgo separada del builder institucional.
- No hay pruebas de sensibilidad ni estabilidad del índice.

### Deuda metodológica

- No hay banda de confianza;
- no hay justificación cuantitativa de pesos;
- no hay distinción suficiente entre comparación relativa y score interpretable.

### Datasets débiles

- `mapAreas`

### Fuentes oficiales faltantes

- estimaciones oficiales o reproducibles a nivel alcaldía para salud y actividad;
- capas territoriales adicionales de accesibilidad y contexto si se pretende sofisticar el mapa.

### Indicadores que deben corregirse

- `riskScore`
- `riskLevel`
- cualquier lectura de “infraestructura total” que se entienda como universo completo

### Qué puede evolucionar sin romper arquitectura

- reemplazar `MapAreaRecord` por snapshot analítico versionado;
- incorporar incertidumbre;
- separar mapas observados de mapas modelados.

---

## 4.3 Infraestructura

### Qué cumple completamente

- Ya existe una capa nominal integrada para:
  - PILARES;
  - UTOPÍAs;
  - deportivos públicos.
- La UI ya distingue sedes reales y espacios operativos estimados en PILARES.
- La documentación del proyecto ya reconoce que el total de infraestructura no puede leerse como universo absoluto.

### Qué cumple parcialmente

- Parques y espacios abiertos siguen visibles, pero no cuentan con el mismo nivel de trazabilidad nominal local que PILARES y deportivos públicos.
- DENUE ya tiene pipeline y contrato, pero el corte actual no produce capa privada verificable.
- UTOPÍAs están integradas como bloque institucional, pero sin amenidades verificadas por sede.

### Qué contradice el modelo de datos

- `build-dashboard-data.ts` todavía fabrica `InfrastructureDetailRecord` sintéticos por alcaldía y año para varias categorías, en paralelo a la capa nominal real de `official-infrastructure.json`.
- Eso duplica semánticas:
  - una capa nominal observada real;
  - una capa agregada artificial por seed territorial.

### Qué contradice la metodología

- Presentar capacidades y espacios operativos estimados junto a conteos administrativos puede seguir induciendo sumas incorrectas si el usuario no lee con cuidado la nota.
- La geometría y la capa nominal real son defendibles; la expansión sintética por año no lo es al mismo nivel.

### Deuda técnica

- Coexisten dos fuentes para infraestructura:
  - `officialInfrastructure.details`
  - `buildInfrastructureDetails()`
- Esa duplicidad agrega riesgo de divergencia silenciosa.

### Deuda metodológica

- No hay criterio formal común para:
  - capacidad;
  - espacio operativo;
  - unidad analítica equivalente entre PILARES, UTOPÍAs, parques y deportivos.

### Datasets débiles

- parques / áreas verdes visibles en dashboard;
- capacidad estimada;
- espacios operativos estimados;
- cualquier total que quiera parecer homogéneo entre sedes, instalaciones y espacios.

### Fuentes oficiales faltantes

- inventario actual y nominal de espacio público/áreas verdes con grano utilizable;
- amenidades verificadas por sede para PILARES, UTOPÍAs y deportivos;
- actualización vigente de PILARES;
- privados validados.

### Indicadores que deben eliminarse

- ningún KPI de infraestructura debe sumar candidatos privados preparados al total real;
- cualquier “total CDMX” que mezcle sedes, instalaciones y espacios operativos debería retirarse o reexpresarse.

### Indicadores que deben corregirse

- totales agregados de infraestructura;
- densidad de infraestructura cuando el numerador mezcle unidades distintas;
- cualquier lectura que trate UTOPÍAs o PILARES como equivalentes funcionales a un deportivo completo.

### Qué puede evolucionar sin romper arquitectura

- mover todo el resumen ejecutivo de infraestructura a una sola fuente processed curada;
- conservar categorías visibles pero endurecer unidad y cobertura por KPI;
- incorporar inventario real de amenidades por sede cuando exista.

---

## 4.4 UTOPÍAs

### Qué cumple completamente

- Se reconocen como capa institucional separada.
- Se manejan estatus acotados y la documentación prohíbe inferir amenidades.
- La integración processed existe y alimenta infraestructura y mapa.

### Qué cumple parcialmente

- La territorialización nominal está resuelta en un bloque defendible, pero no existe un dataset oficial abierto unificado dentro del repo.
- La UI las trata como reales, lo cual es razonable para bloque por sede, pero sin matizar el nivel de completitud de atributos.

### Qué contradice el modelo de datos

- La capa vive en `data/processed/infrastructure/utopias.json`, es decir, ya entra procesada como verdad institucional, no como raw + normalized + processed con trazabilidad equivalente a otras fuentes.

### Qué contradice la metodología

- Nada grave en su uso actual, siempre que no se afirmen amenidades o disciplinas internas.

### Deuda técnica

- Falta formalizar su builder reproducible desde una fuente documental explícita.

### Deuda metodológica

- Falta documentación fina de:
  - fecha de estatus por sede;
  - evidencia primaria por registro;
  - alias y resolución de ambigüedad.

### Datasets débiles

- atributos internos de amenidades;
- estatus operativo fino;
- coordenadas y detalle de oferta interna.

### Fuentes oficiales faltantes

- inventario nominal abierto y vigente por sede;
- documentación oficial consolidada de estatus y amenidades.

### Indicadores que deben corregirse

- cualquier total que implique que las UTOPÍAs tienen cobertura deportiva homogénea entre sí.

### Qué puede evolucionar sin romper arquitectura

- enriquecer atributos y trazabilidad;
- separar mejor sedes operando, anunciadas y en construcción;
- vincularlas con canchas cuando aplique.

---

## 4.5 Oferta Programada

### Qué cumple completamente

- Usa fuentes reales identificadas.
- La documentación ya dice explícitamente que estas mallas son oferta programada, no participación.
- El builder `build-programmed-offer.ts` respeta estructura, corte y canal.
- La disciplina se normaliza de forma explícita mediante catálogo y no por inferencia de infraestructura.

### Qué cumple parcialmente

- PILARES y Ponte Pila se muestran en un mismo módulo, pero con cortes distintos.
- La UI puede consolidar ambas capas sin hacer siempre suficientemente visible que no corresponden al mismo periodo.

### Qué contradice el modelo de datos

- `coverageLevel` se marca como `parcial`, lo cual es correcto, pero el dashboard puede seguir usando el conjunto como lectura dominante de ecosistema deportivo visible.

### Qué contradice la metodología

- La suma de sesiones PILARES abril 2026 + Ponte Pila julio 2026 sigue siendo metodológicamente delicada si se presenta como un solo volumen comparable.

### Deuda técnica

- No existe control de versión de cortes más allá de `cutLabel` y `sourceDate`.
- No existe un snapshot por periodo unificado para comparación institucional.

### Deuda metodológica

- Falta política explícita para visualización multi-corte.
- Falta señal más fuerte en UI cuando se mezclan meses distintos.

### Datasets débiles

- cualquier agregado combinado PILARES + Ponte Pila si se lee como “corte CDMX”.

### Fuentes oficiales faltantes

- cortes comparables en el tiempo;
- futura asistencia real para convertir oferta en seguimiento operativo agregado.

### Indicadores que deben corregirse

- totales visibles de sesiones si no enfatizan el corte de cada canal.

### Qué puede evolucionar sin romper arquitectura

- snapshots por canal y periodo;
- tablero comparativo de oferta programada por corte;
- puente hacia operación real una vez exista asistencia.

---

## 4.6 KPIs de Actividad y Salud

### Qué cumple completamente

- Reconoce que ENSANUT y MOPRADEF son bases agregadas;
- muestra capas como estimadas o proyectadas;
- ya incorpora nota de quiebre metodológico.

### Qué cumple parcialmente

- La semántica de KPI está alineada con el charter, pero la construcción sigue siendo demasiado sintética.

### Qué contradice el modelo de datos

- `yearSeeds`, `ageSeeds` y `sexSeeds` son parámetros hardcodeados y no un dataset de benchmark trazable con la granularidad que luego aparenta el resultado.

### Qué contradice la metodología

- 2020–2023 no deberían leerse como actividad territorial preparada “equivalente” a 2024–2025.
- 2026 es un escenario. El sistema lo marca como proyectado, pero sigue entrando al mismo panel analítico.

### Deuda técnica

- no hay módulo estadístico aislado;
- no hay capa de insumo microdata reproducible;
- no hay versionado de fórmulas más allá de notas.

### Deuda metodológica

- no hay incertidumbre;
- no hay errores estándar;
- no hay sensibilidad por alcaldía;
- no hay justificación suficiente del ajuste territorial.

### Datasets débiles

- `territorialRecords`
- `healthProfiles`

### Fuentes oficiales faltantes

- microdatos y metodología reproducible de small area estimation;
- encuestas locales si se desea alcaldía defendible para práctica deportiva.

### Indicadores que deben eliminarse

- Ninguno si quedan explícitamente como estimados o proyecciones.
- Sí debe eliminarse cualquier formulación verbal que los trate como observación directa por alcaldía.

### Indicadores que deben corregirse

- panorama de alcaldía “más activa” si se comunica como hecho observado;
- series comparativas 2020–2026 sin suficiente jerarquía visual de calidad.

### Qué puede evolucionar sin romper arquitectura

- incorporar intervalos;
- mover seeds a catálogo metodológico versionado;
- separar panel benchmark de panel territorial modelado.

---

## 4.7 Riesgo Territorial

### Qué cumple completamente

- Está claramente etiquetado como insight derivado.
- No se presenta como diagnóstico clínico.

### Qué cumple parcialmente

- La explicación del score existe, pero el cálculo sigue siendo un artefacto interno de builder, no un modelo auditado externamente.

### Qué contradice el modelo de datos

- el score mezcla actividad modelada, salud estimada e infraestructura agregada sin una capa formal de dependencias ni sensibilidad.

### Qué contradice la metodología

- los pesos son arbitrarios desde el punto de vista técnico;
- el score parece más preciso de lo que metodológicamente es.

### Deuda técnica

- fórmula embebida;
- sin versionado de modelo;
- sin tests de regresión.

### Deuda metodológica

- sin calibración institucional;
- sin benchmark externo;
- sin explicación estadística de cortes de color.

### Datasets débiles

- `riskScore`
- `riskLevel`

### Fuentes oficiales faltantes

- ninguna fuente resolverá esto por sí sola; hace falta marco metodológico institucional propio.

### Indicadores que deben corregirse

- score de riesgo;
- semáforo territorial si se interpreta como clasificación epidemiológica.

### Qué puede evolucionar sin romper arquitectura

- formalizarlo como índice de priorización únicamente;
- publicar versión del modelo y supuestos.

---

## 4.8 Canchas

### Qué cumple completamente

- Existe integración multi-hoja real y compleja.
- El modelo distingue:
  - geolocalización real;
  - aproximada por PILARES;
  - aproximada por alcaldía.
- La UI ya trata la sección como capa operativa administrativa, no como estimación poblacional.
- Se conservaron separados PILARES asignado y PILARES cercano.
- Se generaron estatus operativos e inauguración derivados con notas de trazabilidad.

### Qué cumple parcialmente

- La lógica de estatus es útil, pero sigue siendo una derivación heurística sobre un Excel operativo heterogéneo.
- La cobertura geográfica real sigue siendo muy baja: 20 coordenadas reales de 315.

### Qué contradice el modelo de datos

- Sigue habiendo campos ocultos o semánticamente débiles dentro del dataset que no deberían ascender a lectura institucional sin una política más estricta de exposición.

### Qué contradice la metodología

- `inaugurationStatus` basado en textos ambiguos puede ser útil operativamente, pero no debe leerse como estatus oficial de obra o apertura si no existe confirmación institucional complementaria.
- `operationalStatus` mide completitud documental, no capacidad real de operación.

### Deuda técnica

- dependencia alta del parsing heurístico de Excel;
- ausencia de catálogo canónico de canchas fuera del workbook;
- falta de pipeline de reconciliación incremental.

### Deuda metodológica

- falta separar con más fuerza:
  - estado documental;
  - estado operativo real;
  - estado de inauguración institucional;
  - estado territorial.

### Datasets débiles

- geolocalización;
- estatus de inauguración;
- estatus operativo si se interpreta fuera de completitud documental.

### Fuentes oficiales faltantes

- padrón oficial nominal externo al Excel;
- validación territorial o obra por cancha;
- catastro o base geográfica oficial complementaria.

### Indicadores que deben eliminarse

- ninguno de la sección si se mantiene como operativa-administrativa.

### Indicadores que deben corregirse

- cualquier KPI que sugiera “canchas operando” cuando en realidad mide completitud documental o fecha inferida.

### Qué puede evolucionar sin romper arquitectura

- fortalecer calidad de dato;
- separar más explícitamente estatus;
- incorporar futura validación territorial y de obra.

---

## 4.9 Operación

### Qué cumple completamente

- Tiene separación de rutas respecto al dashboard.
- Ya existe modelo inicial de:
  - personal;
  - sedes;
  - clases;
  - horarios;
  - reglas de captura.
- La captura mock permite probar flujo.
- El módulo ya deja claro qué es real y qué sigue mock.

### Qué cumple parcialmente

- La experiencia es usable para simulación.
- No es un sistema productivo institucional.

### Qué contradice el modelo de datos

- `users` son mock derivados;
- `students`, `enrollments`, `attendanceRecords`, `evidenceRecords` y `auditLog` siguen vacíos en source processed;
- el frontend genera alumnos e inscripciones sintéticas en cliente.

### Qué contradice la metodología

- Nada grave en el plano metodológico, siempre que se entienda como operación preparada.
- Sí contradice el principio de seguridad y trazabilidad productiva del charter si se confundiera con módulo listo para producción.

### Deuda técnica

- `localStorage` como persistencia;
- ausencia de auth real;
- ausencia de RBAC real;
- ausencia de API y DB;
- ausencia de storage de evidencia;
- ausencia de sellado de servidor.

### Deuda metodológica

- falta definir con precisión qué operación publicará al dashboard y con qué quality gates;
- falta política de privacidad y tratamiento de menores;
- falta matriz formal de datos sensibles.

### Datasets débiles

- todo lo transaccional:
  - alumnos;
  - inscripciones;
  - asistencias;
  - evidencia;
  - auditoría.

### Fuentes oficiales faltantes

- no faltan fuentes Excel para oferta programada;
- falta la fuente transaccional viva porque el sistema todavía no existe productivamente.

### Indicadores que deben eliminarse

- cualquier KPI de asistencia real o matrícula real en `/operacion` si el usuario pudiera confundir mock con productivo.

### Indicadores que deben corregirse

- `Usuarios mock` como headline debe quedar siempre explícitamente como simulado;
- `Asistencia preparada` no debe parecer uso real del sistema.

### Qué puede evolucionar sin romper arquitectura

- backend/API/DB;
- roles reales;
- sync de asistencia;
- publicación agregada al dashboard.

---

## 4.10 Builders / ETL / Metadata

### Qué cumple completamente

- Existe pipeline reproducible.
- Hay separación razonable entre integración oficial, canchas, operación y dashboard.
- La metadata general del proyecto es mejor que la del promedio de MVPs institucionales.

### Qué cumple parcialmente

- Hay trazabilidad en notas, pero no siempre en forma suficientemente estructurada por registro y versión de cálculo.

### Qué contradice el modelo de datos

- `build-dashboard-data.ts` concentra demasiada lógica heterogénea:
  - seeds demográficas;
  - territorialización;
  - infraestructura sintética;
  - score de riesgo;
  - composición del snapshot.

Eso contradice la idea de capas más limpias y desacopladas.

### Qué contradice la metodología

- Builder principal mezcla:
  - integración observada;
  - modelación;
  - narrativa de publicación.

### Deuda técnica

- monolitismo del builder institucional;
- baja testabilidad;
- pocas validaciones automáticas de consistencia.

### Deuda metodológica

- falta separar formalmente:
  - builder de observados;
  - builder de estimados;
  - builder de insights;
  - builder de snapshot editorial.

### Datasets débiles

- cualquier dataset generado directamente por el builder institucional sin pasar por capa intermedia versionada de modelación.

### Fuentes oficiales faltantes

- no aplica como fuente; aplica como diseño de pipeline.

### Indicadores que deben corregirse

- todos los que hoy salen de seeds internas sin módulo metodológico aislado.

### Qué puede evolucionar sin romper arquitectura

- descomponer builder final;
- agregar validaciones automáticas;
- versionar snapshots por dominio.

---

## 5. Indicadores problemáticos

## 5.1 Indicadores que deben retirarse o congelarse hasta rediseño metodológico

- `sportFocus` por alcaldía o grupo como si fuera práctica observada;
- cualquier lectura de “deporte dominante” territorial;
- cualquier total general de infraestructura que mezcle unidades no equivalentes sin etiquetado fuerte;
- cualquier uso de participación, asistencia o matrícula desde el dashboard mientras no exista bridge curado real.

## 5.2 Indicadores que deben mantenerse pero reetiquetados o endurecidos

- `% población activa`
  - debe sostenerse como estimado territorial o benchmark, no observación directa.
- `índice de riesgo físico`
  - debe sostenerse como insight compuesto de priorización.
- `infraestructura total`
  - debe sostenerse solo si la unidad visible queda claramente desagregada.
- `sesiones programadas`
  - debe mostrarse por canal y corte, no como un único volumen homogéneo.

---

## 6. Datasets más débiles del proyecto

Ordenados de peor a mejor defensa actual:

1. `users` de operación
2. `students`, `enrollments`, `attendanceRecords`, `evidenceRecords`, `auditLog`
3. `sportsRecords` inexistente pero semánticamente latente
4. `territorialRecords`
5. `mapAreas`
6. parques/espacios abiertos agregados
7. capacidad y espacios operativos estimados
8. UTOPÍAs como dataset procesado sin raw equivalente formal
9. canchas en geolocalización y estatus derivados
10. infraestructura nominal pública observada
11. oferta programada agregada real

---

## 7. Fuentes oficiales faltantes o insuficientemente integradas

- DENUE con SCIAN verificable utilizable en el extracto integrado.
- Inventario nominal y trazable de parques / espacio público / áreas verdes dentro del repo.
- Actualización vigente de PILARES o validación institucional más reciente que 2021.
- Inventario más robusto de amenidades por deportivos públicos.
- Fuente nominal oficial y vigente de UTOPÍAs con trazabilidad abierta o semioficial consolidada.
- Método reproducible de territorialización de actividad y salud con microdatos o publicación equivalente.
- Fuente nominal transaccional para operación real:
  - usuarios;
  - alumnos;
  - inscripciones;
  - asistencia;
  - evidencia.

---

## 8. Módulos con mejor capacidad de evolución sin romper arquitectura

- Infraestructura nominal pública
- Oferta programada
- Canchas
- Metadata y trazabilidad institucional
- Mapa como contenedor visual, si recibe mejores snapshots
- Operación, si se introduce backend sin contaminar el dashboard

Los módulos con peor capacidad de evolución sin rediseño metodológico son:

- KPIs de actividad por alcaldía
- KPIs de salud por alcaldía
- índice de riesgo
- cualquier módulo deportivo de “ranking de práctica”

---

## 9. Matriz priorizada

## Prioridad crítica

- Sustituir la lectura productiva implícita de `/operacion` por una definición explícita de “prototipo cliente-only” en todas las capas pertinentes.
- Separar en el pipeline institucional lo observado, lo modelado y lo editorial. Hoy `build-dashboard-data.ts` mezcla demasiado.
- Desactivar o rediseñar cualquier lectura que sugiera práctica deportiva observada por alcaldía sin evidencia.
- Resolver la inconsistencia entre rutas operativas propuestas y rutas reales implementadas.
- Formalizar que DENUE actual no produce universo privado verificable y evitar cualquier regresión futura que lo vuelva a sumar como real.

## Prioridad alta

- Rehacer el módulo metodológico de actividad y salud a partir de una capa versionada de estimación, no de seeds incrustados en el builder.
- Rediseñar la unidad de los KPIs de infraestructura para impedir mezclas entre sedes, instalaciones, espacios operativos y capacidad.
- Crear builder reproducible y trazable para UTOPÍAs como capa institucional.
- Integrar inventario nominal defendible de parques / áreas verdes / espacio público.
- Definir contrato formal del bridge Operación → Dashboard.
- Documentar y aislar versión del modelo de riesgo.

## Prioridad media

- Mejorar catálogos de disciplinas y subdisciplinas con trazabilidad por fuente.
- Incorporar pruebas automáticas de consistencia metodológica y de presencia de metadata.
- Versionar snapshots por corte y dominio.
- Estandarizar mejor quality grades por registro y no solo por capa.
- Mejorar catálogo y deduplicación territorial de deportivos públicos.

## Prioridad baja

- Afinar microcopy y semántica de badges.
- Unificar más el tono de metadata entre dashboard y operación.
- Reducir código repetido en UI operativa.

---

## 10. Roadmap recomendado para siguientes sprints

## Sprint 1 — Endurecimiento metodológico del Dashboard

- retirar o congelar indicadores ambiguos;
- separar snapshot observado vs snapshot modelado;
- limpiar KPIs y totales de infraestructura;
- formalizar política de publicación institucional.

## Sprint 2 — Reestructura de builders y datasets

- dividir `build-dashboard-data.ts`;
- crear capa explícita de estimaciones territoriales;
- crear builder reproducible de UTOPÍAs;
- consolidar metadata por dataset y versión.

## Sprint 3 — Infraestructura oficial y privada

- integrar inventario nominal de parques/espacio público;
- corregir DENUE con SCIAN verificable;
- mejorar amenidades y deduplicación de infraestructura pública.

## Sprint 4 — Operación productiva mínima

- diseñar API, DB y auth;
- dejar de depender de `localStorage`;
- crear usuarios reales, roles y scopes;
- persistir asistencia y evidencia fuera del cliente.

## Sprint 5 — Bridge analítico

- definir marts agregados operativos;
- publicar solo snapshots curados hacia dashboard;
- introducir quality gates para asistencia, clases, captura y cobertura.

## Sprint 6 — Estadística territorial seria

- sustituir seeds por metodología reproducible de estimación;
- documentar incertidumbre;
- recalibrar riesgo territorial y salud.

---

## 11. Veredicto final

El proyecto ya tiene:

- buena estructura;
- buena intención metodológica;
- una separación de dominios correcta;
- capacidad real de evolucionar.

Pero todavía arrastra problemas importantes:

- el dashboard institucional depende en exceso de capas sintéticas para actividad, salud y riesgo;
- la capa de infraestructura aún mezcla registros nominales con expansiones analíticas;
- operación sigue siendo un prototipo local, no un sistema institucional productivo;
- faltan fuentes oficiales clave y faltan reglas más duras para impedir sobrelectura del dato.

La siguiente etapa no debe ser añadir más features.

La siguiente etapa debe ser:

1. limpiar lo metodológicamente débil;
2. endurecer el pipeline;
3. formalizar qué es demo, qué es real y qué es modelo;
4. recién después continuar desarrollando.
