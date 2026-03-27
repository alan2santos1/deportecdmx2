# Investigación actual — Infraestructura deportiva, UTOPÍAs, PILARES y base operativa de 500 canchas (CDMX)

## Estado del documento
**Este es el documento de referencia principal vigente para el proyecto.**

### Prioridad de fuentes
A partir de este momento, el sistema debe priorizar SIEMPRE en este orden:

1. **Esta investigación actual (`investigacion_actual.md`)**
2. **El Excel real de 500 canchas**
3. **El estado actual del código**
4. **Solo después**, otras capas o fuentes históricas ya integradas

### Regla crítica
**No mezclar hipótesis viejas ni datasets obsoletos** si contradicen esta investigación o el Excel real.

---

# 1) Objetivo de negocio

Construir un **dashboard institucional y defendible** sobre infraestructura deportiva en CDMX, con foco en:

- lectura territorial por alcaldía
- priorización operativa
- visualización ejecutiva
- seguimiento real de canchas
- integración progresiva de capas oficiales
- capacidad de explicar **qué sí está sustentado** y **qué todavía no**

El dashboard **no debe inventar datos**, ni “completar” campos sin evidencia.

---

# 2) Principio rector del proyecto

## Regla principal
Todo dato debe clasificarse como uno de estos tipos:

- **real** → viene de una fuente oficial o del Excel operativo
- **estimado** → se calcula con reglas metodológicas explícitas
- **preparado** → existe como capa potencial, pero todavía no está validado suficientemente
- **no defendible** → no se debe mostrar como dato institucional

## Regla visual
Cada módulo o capa del dashboard debe dejar claro si lo que se muestra es:

- **dato real**
- **dato estimado**
- **dato preparado**

---

# 3) Hallazgo crítico: situación real de los datos

## 3.1 Infraestructura deportiva en CDMX NO está completa en una sola fuente
No existe una sola base pública oficial completa, limpia y actualizada que permita afirmar con total precisión:

- todas las canchas de CDMX
- todas las disciplinas disponibles por sede
- todos los gimnasios, albercas o espacios especializados
- todas las UTOPÍAs con amenidades completas
- todas las sedes PILARES con estado operativo actualizado

### Implicación
El sistema debe construirse como **modelo híbrido defendible**, no como una “verdad absoluta” falsa.

---

# 4) Qué sí es defendible hoy

---

# 5) PILARES

## 5.1 Qué sí existe
Existe un dataset público de **Ubicación y Estatus PILARES** en Datos Abiertos CDMX.

## 5.2 Problema crítico
Ese dataset tiene un **corte viejo (2021)** y por lo tanto:

- **sí sirve** como referencia nominal / baseline
- **no sirve** para afirmar conteo actual 2025–2026
- **no sirve** para afirmar estado operativo actualizado
- **no sirve** para amenidades deportivas por sede

## 5.3 Regla para el sistema
PILARES debe tratarse así:

### Sí mostrar:
- ubicación histórica
- referencia territorial
- posible enriquecimiento espacial
- match contra canchas

### No afirmar como actual:
- total vigente exacto de sedes
- amenidades por sede
- actividades por sede
- infraestructura deportiva real por sede

## 5.4 Conclusión operativa
PILARES puede quedarse como:

- **capa real histórica**
- **capa territorial útil**
- **capa de apoyo institucional**

pero **no como verdad operativa actual total**.

---

# 6) UTOPÍAs

## 6.1 UTOPÍAs operando — defendibles
Sí existe evidencia pública sólida para un bloque de **UTOPÍAs operando**, principalmente:

- las **12 UTOPÍAs de Iztapalapa**
- con nombre y ubicación defendible

## 6.2 UTOPÍAs anunciadas / en construcción — defendibles
Sí existe evidencia pública defendible para las **primeras 16 UTOPÍAs anunciadas por alcaldía**, así como algunos casos que ya avanzaron a obra o construcción.

## 6.3 Estados válidos para UTOPÍAs
El sistema debe manejar solo estos estados:

- `operando`
- `anunciada`
- `en_construccion`
- `sin_verificar`

## 6.4 Regla crítica
No asumir amenidades completas por UTOPÍA si no hay evidencia puntual.

### Ejemplo
No porque una UTOPÍA exista se puede afirmar automáticamente que ya tiene:

- alberca operando
- gimnasio operando
- pista operando
- cancha específica operando

---

# 7) Inventario defendible actual de UTOPÍAs

## 7.1 UTOPÍAs operando (bloque defendible base)
Principalmente las de Iztapalapa:

- Utopía Atzintli
- Utopía Cuauhtlicalli Aculco
- Utopía Cascada
- Utopía Libertad
- Utopía Meyehualco
- Utopía Olini
- Utopía Papalotl
- Utopía Quetzalcóatl
- Utopía Tecóloxtitlan
- Utopía Teotongo
- Utopía Tezontli
- Barco Utopía

## 7.2 UTOPÍAs anunciadas / en construcción (bloque defendible)
Se identifican como parte del rollout institucional las siguientes sedes / proyectos:

- Utopía Parque Japón
- Utopía Deportivo Ceylán
- Utopía Centro SCOP
- Utopía El Parián
- Utopía Módulo Deportivo Cuajimalpa
- Utopía Tepito / Utopía Cuauhtémoc
- Utopía Deportivo Hermanos Galeana
- Utopía CETRAM Acatitla
- Utopía de las Niñas y los Niños (Magdalena Mixhuca)
- Utopía Deportivo Oyamel
- Utopía Un Hogar Para Nosotros
- Utopía Deportivo Tecómitl
- Utopía Deportivo El Triángulo
- Utopía Topilejo / Utopía del Maíz
- Utopía Deportivo Eduardo Molina
- Utopía Deportivo Xochimilco

## 7.3 Regla crítica de modelado
Hay nombres que pueden venir como alias o cambiar entre boletines.

### Ejemplos
- `Utopía Tepito` y `Utopía Cuauhtémoc` pueden ser el mismo proyecto
- `Utopía Topilejo` y `Utopía del Maíz` pueden referir al mismo proyecto
- `Mixhuca` debe modelarse con claridad territorial y no duplicarse

### Regla
Debe existir soporte de:

- `nombre_oficial`
- `alias[]`
- `estatus`
- `fecha_estatus`
- `fuente_principal`

---

# 8) Infraestructura pública deportiva

## 8.1 Qué sí existe
Hay fuentes parciales defendibles como:

- Deportivos Públicos (Datos Abiertos CDMX)
- Espacio Público CDMX
- algunas capas geográficas IPDP / SIEG
- listados web institucionales

## 8.2 Problema crítico
Estas fuentes tienen limitaciones como:

- cortes viejos
- cobertura incompleta
- falta de amenidades
- falta de disciplina específica
- duplicados potenciales
- mezcla de espacios recreativos y deportivos

## 8.3 Regla para el sistema
Estas capas deben usarse como:

- **capas reales parciales**
- **capas auxiliares**
- **capas de contraste territorial**

pero no como inventario absoluto final de infraestructura.

---

# 9) DENUE / INEGI — infraestructura privada y mixta

## 9.1 Esta sí es una base fuerte
Para infraestructura privada, **DENUE / INEGI es la fuente defendible principal**.

## 9.2 Qué sí aporta DENUE
DENUE sí permite modelar de forma seria:

- gimnasios
- clubes deportivos
- escuelas de deporte
- instalaciones acuáticas / balnearios
- negocios formales relacionados con práctica deportiva

## 9.3 Qué NO aporta DENUE
DENUE **no resuelve bien**:

- disciplina exacta por sede
- amenidades reales internas
- calidad del espacio
- si hay alberca deportiva real o recreativa
- si hay cancha específica
- infraestructura informal o comunitaria no registrada

## 9.4 Regla para el dashboard
DENUE debe alimentar principalmente:

- capa privada
- conteos por alcaldía
- densidad por territorio
- lectura público vs privado
- mapa de equipamiento formal

---

# 10) SCIAN defendible para deporte

## 10.1 Códigos base que sí deben considerarse
La integración de DENUE debe auditar y usar, como mínimo, estos grupos defendibles:

### Clubes / deporte / fitness
- `713941` → Clubes deportivos del sector privado
- `713942` → Clubes deportivos del sector público
- `713943` → Balnearios del sector privado
- `713944` → Balnearios del sector público

### Escuelas / formación deportiva
- `611621` → Escuelas de deporte del sector privado
- `611622` → Escuelas de deporte del sector público

## 10.2 Regla crítica
No asumir que un SCIAN implica automáticamente una disciplina concreta.

### Ejemplo
Un gimnasio no significa:

- natación
- box
- básquet
- fútbol
- atletismo

Un club deportivo no significa automáticamente:

- cancha de tenis
- cancha de básquet
- alberca
- pista

---

# 11) Hallazgo crítico: las disciplinas están subrepresentadas

Este es uno de los puntos más importantes del proyecto.

## 11.1 Problema
Si hoy el dashboard muestra muy poco en:

- natación
- básquetbol
- atletismo
- box
- gimnasios
- albercas
- multideporte

**eso no necesariamente significa que no existan**.

Muchas veces significa que:

- la fuente no trae amenidades
- el dataset no trae disciplina
- la clasificación es muy general
- la infraestructura existe pero no está bien modelada todavía

## 11.2 Regla institucional
**Nunca vender como ausencia real lo que en realidad es ausencia de dato estructurado.**

## 11.3 Cómo debe verse en UI
Debe quedar claro cuando una disciplina es:

- `documentada`
- `probable`
- `subrepresentada`
- `no verificable`

---

# 12) Modelo correcto para disciplinas y amenidades

## 12.1 Principio
La disponibilidad de disciplinas no debe inferirse libremente.

## 12.2 Se debe usar un enfoque “evidence-first”
Una disciplina o amenidad solo debe marcarse si existe evidencia verificable.

### Ejemplos válidos
- texto oficial que diga “alberca”
- ficha oficial que diga “cancha de básquet”
- boletín oficial que diga “pista de atletismo”
- catálogo institucional de amenidades
- dato operativo validado

### Ejemplos inválidos
- “parece que”
- “seguramente”
- “como es deportivo entonces debe tener”
- “como es UTOPÍA entonces seguro tiene alberca”

## 12.3 Estados válidos por amenidad
Cada amenidad o disciplina debe poder estar como:

- `disponible`
- `planificada`
- `null`

---

# 13) Programa 500 Canchas

## 13.1 Esta es una capa estratégica central del proyecto
La base operativa de **500 Canchas** debe considerarse una de las fuentes más importantes del sistema.

## 13.2 Regla de jerarquía
El Excel de 500 canchas tiene prioridad alta porque contiene:

- seguimiento operativo real
- estado administrativo
- relación territorial
- proximidad con PILARES
- responsables y mallas
- información que no existe igual en open data

## 13.3 Regla crítica
Lo que venga en el Excel **sí puede alimentar la operación del dashboard**, pero debe distinguirse visualmente como:

- **dato operativo / administrativo**
- no necesariamente “dato público consolidado”

## 13.4 Qué sí debe salir del Excel
La capa de 500 canchas debe alimentar:

- mapa de canchas
- tabla operativa
- filtros territoriales
- estatus de inauguración
- completitud operativa
- responsables PILARES
- promotor deportivo
- malla horaria
- actividades
- observaciones
- seguimiento ejecutivo

---

# 14) Reglas específicas para 500 Canchas

## 14.1 Lo que sí debe modelarse
Campos operativos clave:

- `alcaldia`
- `nombre`
- `direccion`
- `lat`
- `lon`
- `mapsLink`
- `pilaresAssigned`
- `nearestPilares1`
- `nearestPilares2`
- `assignedPilaresResponsibleName`
- `assignedPilaresContact`
- `assignedPilaresEmail`
- `assignedPilaresSchedule`
- `tienePromotorFutbol`
- `promoterCount`
- `mallaHorariaFutbol`
- `mallaHorariaDisciplinas`
- `disciplinas`
- `activities`
- `observaciones`
- `inaugurationStatus`
- `operationalStatus`
- `inaugurationDate`

## 14.2 Lo que NO debe inventarse
No inferir automáticamente:

- coordinador
- figura educativa específica
- responsable de disciplina concreta
- tipo exacto de cancha si no viene claro
- estatus operativo “completo” si faltan piezas clave

## 14.3 Regla de separación semántica
No mezclar:

- promotor de fútbol
- responsable PILARES
- nombre de figura
- sede cercana
- sede asignada

---

# 15) Reglas ya validadas que deben mantenerse

Estas reglas deben conservarse y no romperse:

## 15.1 Promotor deportivo de fútbol
Debe modelarse como:

- `si`
- `no`
- `sin_dato`

No como nombre de persona.

## 15.2 Cantidad de promotores
Debe mantenerse como campo separado.

## 15.3 PILARES asignado
No debe autollenarse con PILARES cercano.

## 15.4 ORIGEN
No debe autollenarse con TIPO.

## 15.5 Horarios y mallas
No deben aceptar como horario válido valores tipo:

- `NO`
- `POR DEFINIR`
- `POR ASIGNAR`

## 15.6 Otras disciplinas
No deben contaminarse con frases negativas como:

- “no se imparte”
- “sin disciplina”
- “no aplica”

---

# 16) Mapa del sistema — criterio institucional correcto

## 16.1 El mapa debe comunicar prioridad, no confusión
El sistema debe evitar mapas donde “todo se ve rojo”.

## 16.2 La lectura correcta del mapa es:
- **verde** → prioridad baja
- **amarillo** → prioridad media
- **rojo** → prioridad alta

## 16.3 Regla de prioridad relativa
La prioridad debe depender de la naturaleza de la métrica:

### Más alto = mejor
Ejemplo:
- actividad
- infraestructura visible

Entonces:
- valor alto = menor prioridad

### Más alto = peor
Ejemplo:
- obesidad
- diabetes
- sedentarismo
- riesgo

Entonces:
- valor alto = mayor prioridad

---

# 17) Problema detectado en el dashboard actual

Hay señales de que el dashboard todavía puede estar **subrepresentando** ciertas cosas, por ejemplo:

- natación
- básquetbol
- gimnasios
- espacios deportivos visibles por alcaldía
- infraestructura pública y privada real

## Posibles causas
- DENUE todavía no está bien ampliado
- UTOPÍAs aún no están integradas correctamente
- PILARES sigue entrando incompleto
- disciplinas están mal inferidas o demasiado restringidas
- capas auxiliares no están consolidadas

### Conclusión
Si hoy algo “se ve vacío”, **primero asumir problema de cobertura o modelado**, no ausencia real.

---

# 18) Qué se debe hacer ahora (orden correcto)

## Fase 1 — consolidación defendible
Ajustar y consolidar:

- UTOPÍAs
- DENUE / SCIAN
- lectura de infraestructura pública / privada
- lógica de disciplinas
- capa de 500 canchas

## Fase 2 — mejoras de visualización
Agregar:

- mapa más robusto
- comparativas territoriales
- mejores filtros
- lectura público vs privado más defendible
- capa ejecutiva más clara

## Fase 3 — enriquecimiento institucional futuro
Solo después, si se consigue evidencia:

- amenidades por sede
- disciplinas por instalación
- UTOPÍAs con mayor detalle
- PILARES actualizados
- catálogo institucional real de infraestructura

---

# 19) Regla de presentación institucional

Todo lo que se muestre en el dashboard debe poder defenderse en una reunión ejecutiva.

## Pregunta filtro obligatoria
Antes de mostrar cualquier dato, el sistema debe preguntarse:

> “¿Esto lo puedo sostener frente a una dirección general, una dependencia o una presentación pública sin que me lo tumben?”

Si la respuesta es **no**, entonces:

- no debe mostrarse como dato real
- debe marcarse como estimado
- o debe quitarse

---

# 20) Reglas técnicas para Codex

## 20.1 Prohibiciones
Codex NO debe:

- inventar campos
- inferir disciplinas sin evidencia
- mezclar fuentes incompatibles
- sobrescribir lógica ya validada sin justificación
- romper la arquitectura base
- cambiar diseño innecesariamente
- meter librerías pesadas sin necesidad
- destruir capas existentes que ya funcionan

## 20.2 Sí debe hacer
Codex SÍ debe:

- corregir semántica
- mejorar cobertura real
- robustecer ETL
- fortalecer trazabilidad
- mejorar lectura institucional
- mantener compilación limpia
- documentar cambios

## 20.3 Cada mejora debe indicar
- qué archivo tocó
- qué corrigió
- por qué era necesario
- qué impacto tiene en el dashboard
- si ya compiló correctamente

---

# 21) Estado final esperado del sistema

El sistema final debe permitir leer con claridad:

- qué territorio tiene mayor necesidad
- qué infraestructura sí está documentada
- qué infraestructura sigue subrepresentada
- qué canchas ya están listas / próximas / pendientes
- qué UTOPÍAs operan / se anunciaron / están en construcción
- qué tanto hay de infraestructura pública vs privada
- qué parte del dashboard es real, estimada o preparada

---

# 22) Instrucción final de ejecución

A partir de este archivo, cualquier mejora debe respetar estas reglas:

## Prioridad absoluta
1. esta investigación actual
2. el Excel real de 500 canchas
3. el código actual del proyecto

## Objetivo
**Convertir el dashboard en una herramienta institucional defendible, útil, clara y visualmente sólida, sin inventar datos.**