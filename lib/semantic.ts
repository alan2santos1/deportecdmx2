import { normalizeKey } from "./utils";
import type { SemanticFields } from "./types";

const matchColumn = (columns: string[], patterns: string[]) => {
  const normalized = columns.map((col) => ({ col, key: normalizeKey(col) }));
  for (const pattern of patterns) {
    const key = normalizeKey(pattern);
    const match = normalized.find((item) => item.key.includes(key));
    if (match) return match.col;
  }
  return undefined;
};

export const detectSemanticFields = (columns: string[]): SemanticFields => ({
  alcaldia: matchColumn(columns, ["alcaldia", "demarcacion", "municipio", "territorio"]),
  anio: matchColumn(columns, ["anio", "ano", "year", "periodo", "ejercicio"]),
  sexo: matchColumn(columns, ["sexo", "genero", "gender", "sex"]),
  grupoEdad: matchColumn(columns, ["grupoedad", "grupo_edad", "rangoedad", "rango_edad", "edadgrupo", "grupo etario"]),
  deporte: matchColumn(columns, ["deporteprincipal", "deporte", "disciplina", "tipo practica", "tipo_practica"]),
  tipoInfraestructura: matchColumn(columns, ["tipoinfraestructuradominante", "tipoinfraestructura", "tipo infraestructura", "tipo espacio", "tipo instalacion"]),
  personasActivas: matchColumn(columns, ["personasactivas", "poblacionactiva", "activos", "personas activas"]),
  poblacionTotal: matchColumn(columns, ["poblaciontotal", "totalpoblacion", "poblacion total", "habitantes"]),
  porcentajeActivo: matchColumn(columns, ["porcentajeactivo", "pctactivo", "porcentaje activo", "tasaactividad", "actividad_pct"]),
  infraestructura: matchColumn(columns, ["infraestructura", "infraestructuratotal", "instalacionestotales", "espacios deportivos"]),
  deportivos: matchColumn(columns, ["deportivospublicos", "deportivos", "deportivos publicos"]),
  pilares: matchColumn(columns, ["pilares", "centros pilares"]),
  gimnasios: matchColumn(columns, ["gimnasios", "gimnasios privados"]),
  parques: matchColumn(columns, ["parquesconequipamiento", "parques", "parques equipamiento"]),
  obesidad: matchColumn(columns, ["obesidad", "prevalenciaobesidad", "obesidad_pct"]),
  sobrepeso: matchColumn(columns, ["sobrepeso", "prevalenciasobrepeso", "sobrepeso_pct"]),
  diabetes: matchColumn(columns, ["diabetes", "prevalenciadiabetes", "diabetes_pct"]),
  sedentarismo: matchColumn(columns, ["sedentarismo", "inactividad", "sedentarismo_pct"])
});
