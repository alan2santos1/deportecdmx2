Base de datos defendible para inteligencia deportiva en CDMX usando fuentes oficiales
Resumen ejecutivo
La evidencia oficial más reciente para dimensionar actividad física (práctica deportiva o ejercicio) en México proviene de MOPRADEF (INEGI), con actualización metodológica en 2025. En 2025, 44.5% de la población de 18+ en el agregado urbano de 32 ciudades (100 mil+ hab.) estuvo activa físicamente en su tiempo libre. La brecha por género persistió: 40.7% mujeres vs 49.1% hombres (diferencia 8.4 pp). [1]
Para el dato nacional 12+ (nueva cobertura 2025), 41.7% declaró actividad física en tiempo libre (37.4% mujeres, 46.7% hombres). [1] En ese mismo año, la actividad en tiempo libre cae con la edad: el grupo 12–19 fue el más activo (52.7%) y el de 60+ el menos activo (37.6%). [1]
En salud, ENSANUT Continua 2022 (INSP) muestra en adultos (20+) prevalencias elevadas: sobrepeso 38.3%, obesidad 36.9% y obesidad abdominal 81.0%; y un patrón consistente por sexo (mujeres con mayor obesidad y obesidad abdominal). [2] ENSANUT 2022 también reporta diabetes total (diagnosticada + no diagnosticada) 18.3% en adultos; sube de forma marcada con la edad (60+ llega a 37.0%). [3]
Para territorializar por alcaldía, no existe una sola fuente oficial que entregue simultáneamente (i) práctica deportiva, (ii) obesidad/diabetes y (iii) infraestructura pública/privada, todo a nivel alcaldía. El enfoque defendible para CDMX es construir un “sistema de integración” con: - Infraestructura pública: Datos Abiertos CDMX (PILARES, deportivos, espacio público/áreas verdes) con georreferencia y alcaldía. [4]
- Infraestructura privada: DENUE/CDMX (directorio geográfico) filtrado con SCIAN para gimnasios/clubes/escuelas deportivas. [5]
- Salud y actividad: ENSANUT y MOPRADEF (encuestas) con estimación por alcaldía mediante modelos de small area estimation (baseline: estandarización por edad/sexo; avanzado: MRP). [6]
Fuentes oficiales priorizadas y qué tan “territorial” es cada una
Esta sección separa datos reales (observados a nivel instalación/punto), datos agregados (publicados solo a niveles nacionales/urbanos) y datos estimables (derivables por alcaldía con metodología transparente).
PILARES (infraestructura y sedes) - Dataset oficial en Datos Abiertos CDMX: “Ubicación y Estatus PILARES”. Incluye un recurso CSV con Id de recurso 8a6d280d-… y metadatos (actualización de datos 8-nov-2021; metadatos 14-feb-2023). [7]
- Enfoque: dato real (listado de sedes con ubicación) → agregable por alcaldía si el registro incluye alcaldía o vía spatial join.
- Marco programático: PILARES acerca educación, cultura y deporte; ofrece talleres deportivos/culturales y acceso gratuito, orientado a zonas con menor índice de desarrollo social. [8]
DENUE / Directorio de unidades económicas (infraestructura privada) - En Datos Abiertos CDMX existe un “Directorio Estadístico de Unidades Económicas CDMX” (subconjunto validado; menciona “más de 200 mil” unidades económicas activas en CDMX). [9]
- Recurso clave para explotación territorial: GeoJSON del directorio con Id de recurso 3ffedf9d-… (tamaño 112.2 MiB). [10]
- Para identificar gimnasios/clubes/escuelas deportivas se filtra por SCIAN: - 713943 Centros de acondicionamiento físico (privado); 713941 Clubes deportivos (privado). [11]
- 611621 Escuelas de deporte (privado). [12]
- Enfoque: dato real (puntos de negocio) → agregable por alcaldía.
Deportivos públicos (infraestructura pública deportiva) - Dataset “Deportivos Públicos de la CDMX” en Datos Abiertos CDMX con descarga CSV (incluye direcciones y referencias territoriales en sus registros). [13]
- Enfoque: dato real (listado de instalaciones públicas).
Infraestructura/espacio público y áreas verdes - “Inventario de Áreas Verdes en la Ciudad de México” (IPDP): capa geoespacial con categorías/subcategorías de gestión; útil para parques/áreas verdes como insumo de actividad física al aire libre. [14]
- Adicionalmente, existe “Espacio público de la Ciudad de México” (IPDP) como compilación de varias fuentes (incluyendo INEGI) para espacios públicos (parques, plazas, instalaciones recreativas/deportivas). [15]
- Enfoque: dato real georreferenciado (polígonos/puntos) → agregable por alcaldía.
ENSANUT (salud) - ENSANUT 2022 ofrece prevalencias robustas, pero típicamente no publicadas por alcaldía; por lo tanto llega como dato agregado (nacional/estratos) y dato estimable (alcaldía) con métodos de post-estratificación.
- Obesidad/sobrepeso y diferencias por sexo: [16]
- Diabetes total 18.3% y fuerte gradiente por edad: [3]
MOPRADEF (actividad física) - Publicación 2025 (comunicado): da indicadores nacionales y urbanos agregados con desglose por sexo y edad; no incluye directamente alcaldías. [1]
- Reporte 2024: incluye determinantes, motivos, percepción de infraestructura “en la colonia”, etc. [17]
- Microdatos: INEGI documenta el proyecto y establece acceso “Uso Público” a microdatos (con descarga directa en el ecosistema INEGI), lo cual habilita estimaciones por ciudad y modelos. [18]
Actividad física y sedentarismo con cifras oficiales útiles para el dashboard
Indicadores “headline” listos para tarjeta KPI
Los siguientes indicadores son directamente publicables (con fuente INEGI) y sirven como capa “benchmark” para tu tablero CDMX (comparación vs nacional/urbano).
Actividad física (tiempo libre) – agregado urbano 32 ciudades (18+) - 2025: 44.5% activa físicamente. [1]
- 2024: 41.1% activa físicamente. [19]
Implicación inmediata: 55.5% (2025) y 58.9% (2024) están inactivos en tiempo libre en ese agregado urbano (100 − activo). [20]
Brecha por género (18+, tiempo libre, urbano 32 ciudades) - 2025: mujeres 40.7%, hombres 49.1% (brecha 8.4 pp, la menor de la serie según el comunicado). [1]
- 2024: mujeres 36.8%, hombres 46.0%. [19]
Actividad física (tiempo libre) – nacional 12+ (nuevo en 2025) - Total 41.7% (mujeres 37.4%, hombres 46.7%). [1]
- Caída con edad: 12–19: 52.7% vs 60+: 37.6%. [1]
Suficiencia (cumplir recomendación) entre los activos 12+ (2025) - Del total activo en tiempo libre, 57.9% cumplió días/tiempo/intensidad recomendada. [1]
“Detonadores” accionables reportados por INEGI
El reporte 2024 agrega variables de altísimo valor para diseño de política pública:
    Motivo principal para realizar actividad física (2024): salud 76.1%, diversión 11.7%, verse mejor 7.0%. [21]
    Lugar de práctica (2024): lugares públicos (parque/calle/campo/plaza) 58.3%; privadas (trabajo/estudio u otras privadas) 38.0%; casa 3.7%. [21]
    Existencia de instalaciones públicas en la colonia (entre activos 2024): 71.1% sí existen; 25.7% no; 3.2% no sabe. [21]
    Calidad percibida (entre quienes tienen espacios públicos): 85.1% las calificó regulares o buenas, 12.8% malas. [21]
    Inactividad por sexo (18+, 2024): mujeres 63.2% inactivas vs hombres 54.0%. [21]
    Razones de abandono (inactivos que alguna vez practicaron, 2024): falta de tiempo 52.1%, problemas de salud 17.9%, cansancio por el trabajo 15.2%. [21]
Estas variables alimentan directamente módulos del dashboard como: “barreras principales”, “calidad percibida de infraestructura”, y “preferencia público vs privado”.
Salud: obesidad, sobrepeso y diabetes con desgloses defendibles y su relación con actividad física
Cifras oficiales “base” (ENSANUT 2022) para tableros de salud
Adultos (20+) – prevalencias nacionales (ENSANUT Continua 2022) - Sobrepeso: 38.3%
- Obesidad: 36.9%
- Obesidad abdominal: 81.0% [22]
Diferencias por sexo (ENSANUT 2022, 20+) - Sobrepeso: 41.2% hombres vs 35.8% mujeres
- Obesidad: 41.0% mujeres vs 32.3% hombres
- Obesidad abdominal: 87.9% mujeres vs 73.9% hombres [23]
Diabetes en adultos (ENSANUT 2022; biomarcadores) - Prediabetes: 22.1%
- Diabetes diagnosticada: 12.6%
- Diabetes no diagnosticada: 5.8%
- Diabetes total: 18.3% [3]
Gradiente por edad (diabetes total) - 20–39: 6.1%
- 40–59: 22.5%
- 60+: 37.0% [3]
Relación salud ↔ actividad física (fundamento para “storytelling” de dashboard)
ENSANUT 2022 (artículo analítico) reporta que los adultos con obesidad tienen mayor probabilidad de diagnóstico de enfermedades crónicas: diabetes (RM/OR 1.7), hipertensión (3.6) y dislipidemia (2.3) respecto a IMC normal. [22]
Esto permite un módulo del dashboard tipo: “riesgo metabólico” con evidencia oficial y modelación territorial (ver metodología).
Complementariamente, los “comportamientos del movimiento” en ENSANUT 2022 incluyen cumplimiento de guías de actividad física y sedentarismo con desglose por sexo y grupos etarios, útiles para parametrizar modelos (por ejemplo, calibración de “sedentarismo” o “cumplimiento de guías”). [24]
Infraestructura deportiva y recreativa: qué construir con PILARES, deportivos, áreas verdes y DENUE
Infraestructura pública: PILARES y deportivos
PILARES (Datos Abiertos CDMX) - Recurso oficial (CSV) con Id 8a6d280d-…; tamaño 26.6 KiB; datos con “ubicación y estatus” (última actualización de datos 8-nov-2021). [7]
- Para el tablero, la unidad de análisis defendible es: sede PILARES = 1 punto geográfico (con coordenadas/dirección) → agregación por alcaldía. - Contexto de política pública: talleres deportivos/culturales/educativos gratuitos y enfoque territorial en zonas con menor desarrollo social. [8]
Deportivos públicos (Datos Abiertos CDMX) - Existe recurso de descarga CSV para “Deportivos Públicos de la CDMX”. [13]
- Unidad de análisis defendible: deportivo público = 1 instalación.
Nota metodológica clave sobre “Deportivos” vs “Instalaciones deportivas” - El dataset “Instalaciones deportivas” reporta explícitamente 32 deportivos en un subconjunto de alcaldías (Azcapotzalco, Álvaro Obregón, Coyoacán, Gustavo A. Madero, Iztacalco, Iztapalapa, Tlalpan y Xochimilco), útil como fuente geográfica pero no necesariamente exhaustiva para CDMX. [25]
- Para un tablero operativo de CDMX, prioriza “Deportivos Públicos de la CDMX” (listado) y usa “Instalaciones deportivas” como capa geográfica complementar (si aplica).
Infraestructura recreativa y “actividad física al aire libre”
Para parques, camellones, plazas, áreas verdes e instalaciones recreativas:
    “Inventario de Áreas Verdes en la Ciudad de México” (IPDP): capa geoespacial para gestión y distribución de áreas verdes. [14]
    “Espacio público de la Ciudad de México” (IPDP): compilación de fuentes (incluye INEGI y otras) orientada a localizar espacio público como áreas verdes, instalaciones deportivas/recreativas, plazas y parques. [15]
Infraestructura privada: gimnasios y academias deportivas vía DENUE (SCIAN)
La base territorial más útil (por cobertura) es el GeoJSON del directorio (Id 3ffedf9d-…) dentro del Directorio de Unidades Económicas CDMX. [10]
La clasificación defendible se basa en SCIAN 2023 (INEGI): - Gimnasios / centros de acondicionamiento físico (privado): 713943. [11]
- Clubes deportivos (privado): 713941. [11]
- Escuelas/academias deportivas (privado): 611621. [12]
Con esto puedes construir “densidad de oferta privada” por alcaldía y contrastarla con soberanía de infraestructura pública.
Modelo para estimar actividad física y salud por alcaldía y proyectar 2024–2026
Aquí se propone un enfoque en dos niveles: baseline (rápido y defendible) y avanzado (más preciso). Ambos deben etiquetar explícitamente en tu dataset qué campos son estimados.
Paso cero: grano del dato y tabla de post-estratificación
Define el grano principal del “panel” como:
alcaldía × sexo × grupoEdad × año
Alcaldías CDMX: Álvaro Obregón[26], Azcapotzalco[27], Benito Juárez[28], Coyoacán[29], Cuajimalpa de Morelos[30], Cuauhtémoc[31], Gustavo A. Madero[32], Iztacalco[33], Iztapalapa[34], La Magdalena Contreras[35], Miguel Hidalgo[36], Milpa Alta[37], Tláhuac[38], Tlalpan[39], Venustiano Carranza[40], Xochimilco[41].
La tabla de post-estratificación (población) debe venir de tabulados censales INEGI/Censo 2020 (o el insumo oficial vigente en tu institución). En esta respuesta no incluyo cifras por alcaldía porque la construcción exige descarga/tabulación directa; el método es el componente defendible.
Estimación por alcaldía: baseline (estandarización por edad/sexo)
Objetivo: producir indicadores por alcaldía con mínima complejidad y máxima auditabilidad.
Para cada indicador de ENSANUT (ej. diabetes, obesidad) se usa:
p ̂_a=∑_((s,e))^▒p (s,e)⋅N_(a,s,e)/N_a 
Donde: - p(s,e) = prevalencia nacional (o estrato urbano, si está disponible) por sexo y grupo de edad (ENSANUT). [42]
- N_(a,s,e) = población de la alcaldía a en ese estrato sexo×edad (Censo).
- N_a = población total alcaldía.
Ventaja: no requiere supuestos socioeconómicos; limita el sesgo a diferencias reales de estructura de edad/sexo (relevante porque diabetes crece fuertemente con edad). [3]
Limitación: no captura heterogeneidad intra-CDMX por ingreso/urbanismo/ambiente alimentario.
Para actividad física (MOPRADEF), el baseline similar usa prevalencias publicadas por edad/sexo (cuando existan en tabulados microdata o reportes). El comunicado 2025 ya provee patrones por edad/sexo a nivel nacional 12+. [1]
Estimación por alcaldía: avanzado (MRP / small area estimation)
MRP (Multilevel Regression + Poststratification) es el estándar para bajar encuestas a pequeñas áreas cuando el diseño no es representativo a ese nivel.
Diseño recomendado: 1. Modelo (por outcome): logística (o binomial) con predictores individuales disponibles en microdatos: - sexo, edad (grupos), escolaridad, condición laboral; y efectos jerárquicos por entidad/estrato urbano. 2. Post-estratificación: matriz N_(a,s,e,edu,...) a nivel alcaldía con Censo (o tabulados) para reponderar. 3. Calibración: forzar consistencia con totales publicados (por ejemplo, que el promedio ponderado CDMX coincida con el valor publicado a nivel de ciudad/entidad si lo tienes en MOPRADEF/ENSANUT).
Este enfoque es especialmente útil para: - Actividad física (MOPRADEF), porque el proyecto tiene microdatos de uso público (documentado por INEGI) y variables conductuales (motivos, lugares, suficiencia). [43]
- Salud (ENSANUT), para incorporar gradientes socioeconómicos además de edad/sexo.
Densidad de infraestructura por habitante (pública + privada)
Construye indicadores por alcaldía y año:
    pilares_por_10k = (sedes PILARES / población) × 10,000. [7]
    deportivos_publicos_por_10k = (deportivos públicos / población) × 10,000. [44]
    gyms_privados_por_10k = (unidades SCIAN 713943 / población) × 10,000. [45]
    academias_deportivas_por_10k = (unidades SCIAN 611621 / población) × 10,000. [46]
Complementa con métricas espaciales: - Accesibilidad: distancia caminable (ej. 800 m) a la instalación más cercana desde centroides poblacionales o malla hex (H3).
- Cobertura: % población con ≥1 instalación a ≤15 min a pie.
Proyección 2024–2026: enfoque defendible (sin “inventar”)
Actividad física (MOPRADEF): - 2024 y 2025 ya cuentan con publicaciones oficiales (cambios metodológicos en 2025). [47]
- 2026: proyecta con un modelo simple y transparente (p.ej., suavizamiento exponencial) y publica intervalo de incertidumbre.
- Debes incorporar un “break” metodológico 2025 (cambio de universo y medición), evitando comparar directamente nacional 12+ 2025 contra series 18+ previas sin ajuste. [1]
Salud (ENSANUT): - ENSANUT 2022 es la base robusta más reciente en este paquete; para 2024–2026 usa escenarios (conservador/base/alto) y justifica con tendencia histórica cuando la tengas disponible en series ENSANUT (sin forzar una cifra puntual si no hay medición 2024–2026). [22]
Infraestructura: - Proyección “realista” debe basarse en: - (i) fecha de última actualización del dataset público, - (ii) tasas observadas de alta/baja entre cortes (si hay flujo de actividad), - (iii) anuncios oficiales de nuevas sedes/instalaciones (si se integran, deben citarse). - En Datos Abiertos CDMX, varios datasets advierten que puede haber actualizaciones retroactivas, por lo que también debes versionar. [48]
Dataset listo para dashboard: estructura, diccionario y campos “reales vs estimados”
Estructura recomendada (vista “long” para analítica)
Grano: alcaldia × sexo × grupoEdad × anio
Esto te permite: segmentación, comparativos y proyecciones.
A continuación incluyo el “contrato” en la forma solicitada (puedes materializarlo como una tabla o JSONL):
{
  "alcaldia": "string",
  "anio": "int",

  "poblacion": "int",
  "sexo": "string",
  "grupoEdad": "string",

  "actividadFisica_tiempoLibre": "float",
  "actividadFisica_tiempoComprometido": "float",
  "actividadFisica_total": "float",
  "sedentarismo": "float",

  "obesidad": "float",
  "sobrepeso": "float",
  "diabetes": "float",

  "pilares": "int",
  "deportivos": "int",
  "gimnasios": "int",
  "parques": "int",

  "deportesPrincipales": ["string"]
}
Diccionario de variables: fuente, tipo de dato y estatus
Variable	Qué representa (para dashboard)	Fuente primaria	Estatus recomendado
actividadFisica_tiempoLibre	% población activa en tiempo libre	MOPRADEF (publicación y/o microdatos) [49]
Agregado (publicación) y Estimado (alcaldía)
actividadFisica_total	% población con actividad (tiempo libre o comprometido)	MOPRADEF 2025 [1]
Agregado (nacional) / Estimado (alcaldía)
sedentarismo	% que cumple umbral sedentarismo (ENSANUT, definición por edad)	ENSANUT 2022 movimiento [24]
Agregado / Estimado
obesidad, sobrepeso	% prevalencia en adultos	ENSANUT 2022 obesidad [16]
Agregado / Estimado
diabetes	% diabetes total (adultos)	ENSANUT 2022 diabetes [3]
Agregado / Estimado
pilares	# sedes PILARES en alcaldía	Datos Abiertos CDMX PILARES [50]
Real
deportivos	# deportivos públicos en alcaldía	Datos Abiertos CDMX deportivos [13]
Real
gimnasios	# unidades económicas SCIAN 713943	Directorio CDMX + SCIAN [51]
Real
parques	# polígonos/puntos de parques/áreas verdes	Inventarios IPDP/SEDEMA [52]
Real
deportesPrincipales	Top actividades (ranking)	MOPRADEF microdatos (tipo de práctica) [53]
Estimado/Calculado
ETL mínimo reproducible (sin “magia”)
    Descargar recursos de Datos Abiertos CDMX por Id de recurso (PILARES, deportivos, directorio GeoJSON). [54]
    Normalizar nombres de alcaldía (catálogo único), y geocodificar si faltan coordenadas.
    Conteos por alcaldía:
    PILARES: conteo de sedes por alcaldía. [7]
    Deportivos públicos: conteo instalaciones por alcaldía. [44]
    Directorio (privado): filtrar SCIAN (713943, 713941, 611621) y contar por alcaldía. [55]
    Densidades: por 10 mil habitantes una vez incorporada tabla de población.
    Estimaciones ENSANUT/MOPRADEF por alcaldía: baseline (edad/sexo) o MRP.
Insights accionables para narrativa institucional
    “Más de la mitad no hace ejercicio en tiempo libre” (urbano 32 ciudades, 18+): en 2024, con 41.1% activo, implica 58.9% inactivo; en 2025, 44.5% activo implica 55.5% inactivo. [47]
    Brecha de género persistente: 2025 muestra 40.7% mujeres vs 49.1% hombres activas en tiempo libre (urbano 32 ciudades). [1]
    Edad crítica: en el indicador 12+ (2025), la participación cae desde 52.7% (12–19) hasta 37.6% (60+). [1]
    Barreras: el tiempo manda: entre quienes abandonaron, 52.1% reporta falta de tiempo; 17.9% problemas de salud. Esto sugiere que estrategias de cercanía (≤15 min) y programas de “micro-sesiones” pueden ser más efectivos que campañas genéricas. [21]
    Efecto infraestructura y calidad: 71.1% de personas activas reporta que sí existen instalaciones públicas en su colonia y 12.8% las califica como malas. El dashboard debe distinguir existencia vs calidad. [21]
    Carga metabólica elevada: en adultos, obesidad 36.9% y diabetes total 18.3%; y la diabetes se triplica/cuadruplica con la edad (60+ 37.0%). Esto justifica focalizar programas deportivos en zonas con mayor proporción de 40+ y 60+. [56]
Limitaciones y supuestos defendibles
La arquitectura propuesta es sólida, pero debe documentar límites:
    Desfase temporal de infraestructura: PILARES en Datos Abiertos reporta actualización de datos a 2021 (metadatos 2023), por lo que tu tablero debe manejar “vigencia” y permitir actualización con nuevas versiones oficiales. [7]
    Encuestas no diseñadas para alcaldía: ENSANUT y MOPRADEF (publicaciones) no entregan alcaldía; la territorialización debe etiquetarse como estimación y anexar metodología (baseline/MRP). [57]
    Riesgo de duplicados/omisiones en directorios: el directorio económico es un punto de partida excelente, pero hay rotación empresarial; por ello conviene usar cortes por año y versionado (y, si es posible, contrastar con versiones nacionales del DENUE en INEGI). [58]
    Comparabilidad 2024 vs 2025 (actividad física): 2025 introduce cambios metodológicos (edad y cobertura, y medición de “tiempo comprometido”), por lo que el dashboard debe separar series y documentar quiebres. [20]
Resultado final defendible: con estas fuentes y metodología, tu dashboard puede separar claramente lo observado (infraestructura) de lo estimado (salud/actividad por alcaldía), sin inventar cifras y manteniendo trazabilidad de cada KPI a su documento oficial.
 
[1] [20] [28] [32] [35] [41] [49] [57] https://inegi.org.mx/contenidos/saladeprensa/boletines/2026/mopradef/mopradef2025_CP.pdf
https://inegi.org.mx/contenidos/saladeprensa/boletines/2026/mopradef/mopradef2025_CP.pdf
[2] [16] [22] [23] [31] [33] [38] [56] https://ensanut.insp.mx/encuestas/ensanutcontinua2022/doctos/analiticos/31-Obesidad.y.riesgo-ENSANUT2022-14809-72498-2-10-20230619.pdf
https://ensanut.insp.mx/encuestas/ensanutcontinua2022/doctos/analiticos/31-Obesidad.y.riesgo-ENSANUT2022-14809-72498-2-10-20230619.pdf
[3] [27] [39] [42] https://ensanut.insp.mx/encuestas/ensanutcontinua2022/doctos/analiticos/21-Diabetes-ENSANUT2022-14832-72458-2-10-20230619.pdf
https://ensanut.insp.mx/encuestas/ensanutcontinua2022/doctos/analiticos/21-Diabetes-ENSANUT2022-14832-72458-2-10-20230619.pdf
[4] [7] [50] [54] https://datos.cdmx.gob.mx/dataset/9b42193a-6a6d-41b0-8de2-9f636c0affbe/resource/8a6d280d-3ac4-4341-aad4-8ab1b66f1efb
https://datos.cdmx.gob.mx/dataset/9b42193a-6a6d-41b0-8de2-9f636c0affbe/resource/8a6d280d-3ac4-4341-aad4-8ab1b66f1efb
[5] [10] [51] https://datos.cdmx.gob.mx/dataset/directorio-estadistico-de-unidades-economicas-ciudad-de-mexico/resource/3ffedf9d-10ad-429c-aa7c-db305b3e7909
https://datos.cdmx.gob.mx/dataset/directorio-estadistico-de-unidades-economicas-ciudad-de-mexico/resource/3ffedf9d-10ad-429c-aa7c-db305b3e7909
[6] [18] [43] [53] https://www.inegi.org.mx/rnm/index.php/catalog/study/MEX-INEGI.ESD3.03-MOPRADEF-2024
https://www.inegi.org.mx/rnm/index.php/catalog/study/MEX-INEGI.ESD3.03-MOPRADEF-2024
[8] https://gobierno.cdmx.gob.mx/acciones/pilares/
https://gobierno.cdmx.gob.mx/acciones/pilares/
[9] [48] [58] https://datos.cdmx.gob.mx/dataset/directorio-estadistico-de-unidades-economicas-ciudad-de-mexico
https://datos.cdmx.gob.mx/dataset/directorio-estadistico-de-unidades-economicas-ciudad-de-mexico
[11] [12] [45] [46] [55] https://www.inegi.org.mx/contenidos/app/scian/tablaxvi.pdf
https://www.inegi.org.mx/contenidos/app/scian/tablaxvi.pdf
[13] [29] [44] https://datos.cdmx.gob.mx/dataset/c35ecde0-ab8b-43ba-a002-6c99173a97cf/resource/2782b1fa-7c4a-4c35-a9f2-a8670059253e/download/deportivos_publicos-r.xlsx-todos2.0.csv
https://datos.cdmx.gob.mx/dataset/c35ecde0-ab8b-43ba-a002-6c99173a97cf/resource/2782b1fa-7c4a-4c35-a9f2-a8670059253e/download/deportivos_publicos-r.xlsx-todos2.0.csv
[14] [52] https://datos.cdmx.gob.mx/fa_IR/dataset/inventario-de-areas-verdes-en-la-ciudad-de-mexico
https://datos.cdmx.gob.mx/fa_IR/dataset/inventario-de-areas-verdes-en-la-ciudad-de-mexico
[15] [34] https://datos.cdmx.gob.mx/sv/dataset/1ba93027-5f1b-467a-b88e-4c58757b46ee
https://datos.cdmx.gob.mx/sv/dataset/1ba93027-5f1b-467a-b88e-4c58757b46ee
[17] [19] [21] [26] [30] [36] [37] [40] [47] https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2025/mopradef/mopradef2024_RR.pdf
https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2025/mopradef/mopradef2024_RR.pdf
[24] https://ensanut.insp.mx/encuestas/ensanutcontinua2022/doctos/analiticos/33-Movimiento.en.poblacion-ENSANUT2022-14754-72522-2-10-20230619.pdf
https://ensanut.insp.mx/encuestas/ensanutcontinua2022/doctos/analiticos/33-Movimiento.en.poblacion-ENSANUT2022-14754-72522-2-10-20230619.pdf
[25] https://datos.cdmx.gob.mx/ne/dataset/instalaciones-deportivas
https://datos.cdmx.gob.mx/ne/dataset/instalaciones-deportivas
