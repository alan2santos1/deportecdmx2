# AGENTE_DEPORTE_CDMX

## Sistema de inteligencia deportiva poblacional para la Ciudad de México

### Fase 1: Investigación y fuentes de datos

La construcción de un sistema de inteligencia deportiva para la Ciudad de México (CDMX) requiere identificar fuentes públicas y confiables sobre actividad física, infraestructura deportiva y salud. A continuación se presentan las fuentes más relevantes y sus características.

## Datos oficiales sobre actividad física

### Módulo de Práctica Deportiva y Ejercicio Físico (MOPRADEF) – INEGI
- Mide la participación de la población en actividades deportivas y ejercicio físico.
- Desde 2024 se levanta con una muestra independiente y en 2025 incorporó un rediseño metodológico que amplía la muestra a población de 12 años en adelante.
- Recoge frecuencia y duración de la actividad, instalaciones donde se realiza, motivos de práctica o abandono, disponibilidad de espacios y actividad física durante tiempo comprometido.
- La información se publica en tabulados, microdatos y datos abiertos en el portal de INEGI.
- Los microdatos se ofrecen como CSV/TXT con diccionario y también existe API del Banco de Indicadores.
- Es el principal insumo para estimar el porcentaje de población que realiza deporte en CDMX y características como intensidad, lugar y motivos.

### Encuesta Nacional de Salud y Nutrición (ENSANUT)
- Evalúa indicadores de salud, nutrición y factores de riesgo.
- Incluye variables de obesidad, diabetes, hipertensión y preguntas sobre actividad física.
- Los microdatos están disponibles bajo licencia académica mediante solicitud al INSP.
- Sirve para correlacionar actividad física con prevalencia de obesidad y diabetes.

### Encuesta Nacional de Uso del Tiempo (ENUT) – INEGI
- Permite estimar tiempo dedicado al deporte y ejercicio físico durante la semana.
- Cuenta con microdatos y tabulados en CSV.
- Complementa MOPRADEF al estimar tiempo de actividad física en distintos grupos demográficos.

## Fuentes de infraestructura deportiva y espacios públicos

### Deportivos públicos de la CDMX – INDEPORTE
- Lista de deportivos públicos con nombre, dirección y datos de contacto.
- Disponible como CSV en el portal de Datos Abiertos CDMX.
- Útil para calcular densidad de instalaciones por habitante o km² y para mapear cobertura geográfica.

### Instalaciones deportivas – IPDP
- Contiene deportivos de distintas alcaldías con nombre y domicilio.
- Disponible en CSV, SHP y GeoJSON.
- Aporta georreferenciación precisa para análisis espacial y mapas.

### Espacio público de la Ciudad de México – IPDP
- Incluye áreas verdes, parques, plazas, camellones e instalaciones recreativas o deportivas.
- Disponible en CSV y SHP.
- Permite complementar la infraestructura deportiva formal con espacios públicos útiles para activación física.

### Ubicación y estatus de PILARES – SECTEI
- Incluye ubicación, latitud, longitud y estatus de PILARES.
- Útil para mapear cobertura territorial de espacios comunitarios con potencial deportivo.

### DENUE – INEGI
- Permite identificar gimnasios y otros centros de acondicionamiento físico.
- Acceso vía API o descarga CSV/ZIP.
- Sirve para estimar oferta privada de espacios deportivos por alcaldía.

### SINAVE / Estadísticas de salud
- Reportes y tabulados sobre morbilidad y mortalidad por causas relacionadas con obesidad, diabetes y enfermedades cardiovasculares.
- Útiles para carga de enfermedad y cruces con actividad física.

## Fuentes demográficas y complementarias
- **Censo de Población y Vivienda 2020 – INEGI:** población por edad y sexo a nivel alcaldía.
- **Marco Geoestadístico Nacional – INEGI:** polígonos para mapas interactivos.
- **WiFi gratuito en PILARES – ADIP:** evidencia expansión de infraestructura comunitaria.

## Estimación de datos ausentes

Algunas variables deseadas no están disponibles directamente, por ejemplo personas que practican deporte por alcaldía. Se proponen estas estrategias:

1. **Proyección a partir de MOPRADEF**
   - Calcular proporciones de población activa por edad y género.
   - Aplicarlas a la población de cada alcaldía usando Censo 2020.
   - Ajustar con variables socioeconómicas si es posible.

2. **Uso de ENUT e imputación**
   - Estimar tiempo dedicado al deporte y ajustar prevalencias.
   - Aplicar imputación basada en demografía e infraestructura.

3. **Infraestructura como proxy**
   - Usar densidad de deportivos, PILARES y gimnasios por habitante.
   - Aplicar análisis espacial para detectar cobertura baja y posibles zonas de menor actividad física.

---

## Fase 2: Diseño de la estructura de datos

Se propone un modelo relacional, idealmente PostgreSQL + PostGIS.

### Tabla `poblacion_deportiva`
- `id`
- `alcaldia_id`
- `anio`
- `grupo_edad`
- `genero`
- `total_poblacion`
- `personas_activas`
- `porcentaje_activo`
- `frecuencia_media`
- `duracion_media_minutos`
- `nivel_intensidad`

### Tabla `deportes_populares`
- `id`
- `alcaldia_id`
- `deporte`
- `participantes`
- `porcentaje_participacion`

### Tabla `actividad_por_alcaldia`
- `alcaldia_id`
- `anio`
- `poblacion_total`
- `poblacion_activa`
- `porcentaje_activa`
- `ranking_activa`
- `infraestructura_disponible`
- `infraestructura_por_habitante`

### Tabla `infraestructura_deportiva`
- `id`
- `tipo`
- `nombre`
- `direccion`
- `alcaldia_id`
- `latitud`
- `longitud`
- `estatus`
- `fuente`

### Tabla `indicadores_salud`
- `id`
- `alcaldia_id`
- `anio`
- `prevalencia_obesidad`
- `prevalencia_diabetes`
- `mortalidad_diabetes`
- `fuente`

### Tablas auxiliares
- `alcaldias`
- `periodos`
- `usuarios`

---

## Fase 3: Métricas e insights clave

### Métricas de actividad física
- % de población activa por alcaldía
- Deporte más practicado por grupo de edad y género
- Frecuencia y duración promedio
- Razones para practicar o abandonar
- Densidad de instalaciones deportivas
- Cobertura espacial
- Relación infraestructura–actividad

### Métricas de salud y correlación
- Prevalencia de obesidad y diabetes
- Correlación actividad física–obesidad/diabetes
- Ranking de alcaldías saludables
- Alertas o anomalías

### KPIs sugeridos
1. Tasa de participación deportiva
2. Proporción de instalaciones por habitante
3. Relación actividad–salud
4. Tasa de abandono
5. Cobertura de PILARES
6. Popularidad de deportes emergentes

---

## Fase 4: Propuesta de dashboard

Se recomienda una aplicación React con Recharts o D3.js y mapas con Leaflet o Mapbox.

### Estructura UI
1. **Hero**
   - % de población activa total
   - Alcaldía más activa
   - % de mujeres activas
   - Densidad de instalaciones

2. **Mapa interactivo de alcaldías**
   - Choropleth por tasa de actividad física
   - Drill-down con métricas por alcaldía

3. **Gráficos principales**
   - Serie temporal de actividad física
   - Barras por grupo de edad y género
   - Treemap o burbujas de deportes más populares
   - Heatmap infraestructura vs actividad

4. **Filtros dinámicos**
   - Año
   - Rango de edad
   - Género
   - Tipo de instalación
   - Deporte

5. **Tabla dinámica**
   - Ordenable, filtrable y exportable

6. **Sección de insights**
   - Hallazgos automatizados y recomendaciones

7. **Drill-down territorial**
   - Panel por alcaldía con evolución, comparación y activos cercanos

### Componentes en React
- `MetricCard`
- `BarChart`
- `LineChart`
- `PieChart`
- `LeafletMap` o `MapboxMap`
- `FiltersPanel`
- `DynamicTable`

### Interacciones
- Filtros en tiempo real
- Comparación entre alcaldías
- Exportación a PDF o CSV

---

## Fase 5: Arquitectura técnica

### Backend
- Node.js con Express o NestJS
- Endpoints REST y/o GraphQL
- JWT y caché si se requiere

### Base de datos
- PostgreSQL + PostGIS

### Pipeline ETL
- Python con pandas/geopandas o Airflow
- Integración de MOPRADEF, ENUT, DENUE, infraestructura y salud
- Cálculo de métricas agregadas y tablas de hechos

### Automatización
- Tareas programadas por fuente
- Docker opcional
- Scraping solo si una fuente no tiene API o descarga directa

### Frontend
- React o Next.js
- Componentes reutilizables
- Leaflet o Mapbox para mapas

### Infraestructura
- AWS, GCP o equivalente
- HTTPS, monitoreo y despliegue escalable

---

## Fase 6: Aplicación real y modelo de negocio

### Usos potenciales
1. **Gobierno**
   - Planeación de instalaciones
   - Priorización de presupuesto
   - Evaluación de programas deportivos

2. **Marcas deportivas y gimnasios**
   - Inteligencia de mercado
   - Apertura de sucursales
   - Segmentación geográfica y demográfica

3. **Programas sociales**
   - PILARES
   - INDEPORTE
   - Promoción deportiva territorial

4. **Academia y medios**
   - Investigación
   - Reportajes
   - Visualizaciones públicas

### Versiones del producto
- Dashboard público
- Dashboard premium
- Reportes PDF automáticos

### Estrategia comercial
- Piloto con gobierno local
- Alianzas con empresas
- Difusión con visualizaciones públicas
- Escalabilidad a otras entidades

---

## Conclusiones y próximos pasos

El proyecto combina datos oficiales de actividad física, salud, demografía e infraestructura para construir una herramienta de inteligencia deportiva territorial.

### Próximos pasos recomendados
1. Obtener acceso y/o descarga de microdatos clave
2. Implementar un ETL inicial
3. Diseñar el frontend con la estructura propuesta
4. Validar modelos de estimación con estudios o encuestas locales

---

## Nota para implementación en Codex

Este documento debe usarse como contexto funcional para transformar el proyecto actual de dashboard hacia una versión enfocada en:
- deporte CDMX
- alcaldías
- actividad física
- infraestructura
- salud
- inteligencia territorial

No debe tratarse como documento de marketing, sino como base para:
- modelado de datos,
- diseño de KPIs,
- estructura de vistas,
- metodología visible en el dashboard.
