import { alcaldiasSeed } from "../../raw/alcaldias";

const toId = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const canonicalCatalogs = {
  alcaldias: alcaldiasSeed.map((item) => ({
    id: toId(item.name),
    label: item.name,
    geoKey: toId(item.name)
  })),
  channels: [
    { id: "pilares", label: "PILARES" },
    { id: "ponte_pila", label: "Ponte Pila" }
  ],
  dataTypes: [
    { id: "real", label: "Real" },
    { id: "base_oficial", label: "Base oficial" },
    { id: "estimado", label: "Estimado" },
    { id: "preparado", label: "Preparado" },
    { id: "proyectado", label: "Proyectado" },
    { id: "insight", label: "Insight" }
  ],
  qualityGrades: [
    { id: "A", label: "Registro vigente nominal verificable" },
    { id: "B", label: "Dataset oficial nominal antiguo o parcial" },
    { id: "C", label: "Anuncio oficial o avance agregado" },
    { id: "D", label: "Fuente interna o evidencia incompleta" }
  ],
  verificationStates: [
    { id: "verificado", label: "Verificado" },
    { id: "parcial", label: "Parcial" },
    { id: "sin_verificar", label: "Sin verificar" }
  ],
  sexes: [
    { id: "Hombres", label: "Hombres" },
    { id: "Mujeres", label: "Mujeres" }
  ],
  ageGroups: [
    { id: "0-11", label: "0–11" },
    { id: "12-17", label: "12–17" },
    { id: "18-29", label: "18–29" },
    { id: "30-44", label: "30–44" },
    { id: "45-59", label: "45–59" },
    { id: "60+", label: "60+" }
  ]
} as const;
