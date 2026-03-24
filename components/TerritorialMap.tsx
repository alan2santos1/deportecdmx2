"use client";

import type { MapAreaRecord, MapGeometryFeature } from "../lib/dashboard-types";

export type TerritorialMetricKey =
  | "activity"
  | "risk"
  | "publicInfrastructure"
  | "privateInfrastructure"
  | "totalInfrastructure"
  | "obesity"
  | "diabetes"
  | "sedentary";

type TerritorialMapProps = {
  geometry: MapGeometryFeature[];
  areas: MapAreaRecord[];
  metric: TerritorialMetricKey;
  selectedGeoKey: string | null;
  onSelect: (geoKey: string) => void;
};

const getMetricValue = (area: MapAreaRecord, metric: TerritorialMetricKey) => {
  if (metric === "activity") return area.activityRate * 100;
  if (metric === "risk") return area.riskScore;
  if (metric === "publicInfrastructure") return area.publicInfrastructureCount;
  if (metric === "privateInfrastructure") return area.privateInfrastructureCount;
  if (metric === "totalInfrastructure") return area.totalInfrastructureCount;
  if (metric === "obesity") return area.obesityRate * 100;
  if (metric === "diabetes") return area.diabetesRate * 100;
  return area.sedentaryRate * 100;
};

const formatMetricValue = (area: MapAreaRecord | undefined, metric: TerritorialMetricKey) => {
  if (!area) return "Sin dato";
  if (metric === "activity") return `${(area.activityRate * 100).toFixed(1)}%`;
  if (metric === "risk") return area.riskScore.toFixed(1);
  if (metric === "publicInfrastructure") return `${area.publicInfrastructureCount}`;
  if (metric === "privateInfrastructure") return `${area.privateInfrastructureCount}`;
  if (metric === "totalInfrastructure") return `${area.totalInfrastructureCount}`;
  if (metric === "obesity") return `${(area.obesityRate * 100).toFixed(1)}%`;
  if (metric === "diabetes") return `${(area.diabetesRate * 100).toFixed(1)}%`;
  return `${(area.sedentaryRate * 100).toFixed(1)}%`;
};

const metricLabels: Record<TerritorialMetricKey, string> = {
  activity: "Actividad",
  risk: "Riesgo",
  publicInfrastructure: "Infraestructura pública",
  privateInfrastructure: "Infraestructura privada",
  totalInfrastructure: "Infraestructura total",
  obesity: "Obesidad",
  diabetes: "Diabetes",
  sedentary: "Sedentarismo"
};

const gradientPalettes: Record<Exclude<TerritorialMetricKey, "risk">, string[]> = {
  activity: ["#dff6f4", "#95ddd7", "#39b9b0", "#0f766e"],
  publicInfrastructure: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#075985"],
  privateInfrastructure: ["#fef3c7", "#fcd34d", "#f59e0b", "#92400e"],
  totalInfrastructure: ["#e9d5ff", "#c084fc", "#9333ea", "#581c87"],
  obesity: ["#fee2e2", "#fca5a5", "#ef4444", "#991b1b"],
  diabetes: ["#ffedd5", "#fdba74", "#f97316", "#9a3412"],
  sedentary: ["#fce7f3", "#f9a8d4", "#ec4899", "#831843"]
};

const riskPalette = {
  Verde: "#16a34a",
  Amarillo: "#f59e0b",
  Rojo: "#dc2626"
} as const;

const buildLegend = (areas: MapAreaRecord[], metric: TerritorialMetricKey) => {
  if (metric === "risk") {
    return [
      { label: "Verde · menor prioridad", color: riskPalette.Verde },
      { label: "Amarillo · vigilancia", color: riskPalette.Amarillo },
      { label: "Rojo · prioridad alta", color: riskPalette.Rojo }
    ];
  }

  const values = areas.map((area) => getMetricValue(area, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / 4 || 1;

  return gradientPalettes[metric].map((color, index) => {
    const start = min + step * index;
    const end = index === gradientPalettes[metric].length - 1 ? max : min + step * (index + 1);
    return {
      label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
      color
    };
  });
};

const getFill = (area: MapAreaRecord | undefined, metric: TerritorialMetricKey, areas: MapAreaRecord[]) => {
  if (!area) return "#e2e8f0";
  if (metric === "risk") return riskPalette[area.riskLevel];

  const values = areas.map((item) => getMetricValue(item, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const normalized = (getMetricValue(area, metric) - min) / ((max - min) || 1);
  const palette = gradientPalettes[metric];
  const index = Math.min(palette.length - 1, Math.floor(normalized * palette.length));
  return palette[index];
};

export default function TerritorialMap({ geometry, areas, metric, selectedGeoKey, onSelect }: TerritorialMapProps) {
  const areaLookup = areas.reduce<Record<string, MapAreaRecord>>((acc, area) => {
    acc[area.geoKey] = area;
    return acc;
  }, {});
  const legend = buildLegend(areas, metric);

  if (geometry.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mist-300 bg-mist-100/60 p-6 text-sm text-ink-600">
        La geometría oficial aún no está disponible en el dataset cargado.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-mist-200 bg-mist-100/50">
        <svg viewBox="0 0 900 660" className="h-[420px] w-full bg-[radial-gradient(circle_at_top_left,rgba(14,165,164,0.06),transparent_42%),linear-gradient(180deg,#f8fafc,#eef2f7)]">
          {geometry.map((feature) => {
            const area = areaLookup[feature.geoKey];
            const isSelected = feature.geoKey === selectedGeoKey;
            return (
              <path
                key={feature.geoKey}
                d={feature.path}
                fill={getFill(area, metric, areas)}
                stroke={isSelected ? "#0f172a" : "#ffffff"}
                strokeWidth={isSelected ? 3.2 : 1.2}
                className="cursor-pointer transition-opacity duration-150 hover:opacity-85"
                onClick={() => onSelect(feature.geoKey)}
                onMouseEnter={() => onSelect(feature.geoKey)}
              >
                <title>{`${feature.alcaldia} · ${metricLabels[metric]}: ${formatMetricValue(area, metric)}`}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3">
        {legend.map((item) => (
          <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-3 py-2 text-xs font-medium text-ink-700">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
