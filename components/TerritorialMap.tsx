"use client";

import { useMemo } from "react";
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

type PriorityLevel = "Prioridad baja" | "Prioridad media" | "Prioridad alta";

const paletteByPriority = {
  low: "#1f9d72",
  medium: "#f0b429",
  high: "#d64545"
} as const;

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

const metricDirection: Record<TerritorialMetricKey, "higher_is_better" | "higher_is_worse"> = {
  activity: "higher_is_better",
  risk: "higher_is_worse",
  publicInfrastructure: "higher_is_better",
  privateInfrastructure: "higher_is_better",
  totalInfrastructure: "higher_is_better",
  obesity: "higher_is_worse",
  diabetes: "higher_is_worse",
  sedentary: "higher_is_worse"
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
  const value = getMetricValue(area, metric);
  if (metric === "activity" || metric === "obesity" || metric === "diabetes" || metric === "sedentary") {
    return `${value.toFixed(1)}%`;
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const quantile = (values: number[], q: number) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
};

const buildPriorityScale = (areas: MapAreaRecord[], metric: TerritorialMetricKey) => {
  const values = areas.map((area) => getMetricValue(area, metric));
  return {
    lowCut: quantile(values, 1 / 3),
    highCut: quantile(values, 2 / 3)
  };
};

const getPriorityLevel = (
  area: MapAreaRecord | undefined,
  metric: TerritorialMetricKey,
  scale: { lowCut: number; highCut: number }
): PriorityLevel => {
  if (!area) return "Prioridad media";
  const value = getMetricValue(area, metric);
  if (metricDirection[metric] === "higher_is_worse") {
    if (value >= scale.highCut) return "Prioridad alta";
    if (value >= scale.lowCut) return "Prioridad media";
    return "Prioridad baja";
  }
  if (value <= scale.lowCut) return "Prioridad alta";
  if (value <= scale.highCut) return "Prioridad media";
  return "Prioridad baja";
};

const getPriorityColor = (priority: PriorityLevel) => {
  if (priority === "Prioridad baja") return paletteByPriority.low;
  if (priority === "Prioridad media") return paletteByPriority.medium;
  return paletteByPriority.high;
};

const buildLegend = (areas: MapAreaRecord[], metric: TerritorialMetricKey) => {
  const scale = buildPriorityScale(areas, metric);
  return [
    {
      label: "Prioridad baja",
      color: paletteByPriority.low,
      range: metricDirection[metric] === "higher_is_worse" ? `< ${scale.lowCut.toFixed(1)}` : `> ${scale.highCut.toFixed(1)}`
    },
    {
      label: "Prioridad media",
      color: paletteByPriority.medium,
      range: `${scale.lowCut.toFixed(1)} - ${scale.highCut.toFixed(1)}`
    },
    {
      label: "Prioridad alta",
      color: paletteByPriority.high,
      range: metricDirection[metric] === "higher_is_worse" ? `> ${scale.highCut.toFixed(1)}` : `< ${scale.lowCut.toFixed(1)}`
    }
  ];
};

export default function TerritorialMap({ geometry, areas, metric, selectedGeoKey, onSelect }: TerritorialMapProps) {
  const areaLookup = useMemo(
    () =>
      areas.reduce<Record<string, MapAreaRecord>>((acc, area) => {
        acc[area.geoKey] = area;
        return acc;
      }, {}),
    [areas]
  );
  const scale = useMemo(() => buildPriorityScale(areas, metric), [areas, metric]);
  const legend = useMemo(() => buildLegend(areas, metric), [areas, metric]);
  const selectedArea = selectedGeoKey ? areaLookup[selectedGeoKey] : undefined;
  const selectedPriority = getPriorityLevel(selectedArea, metric, scale);

  if (geometry.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-mist-300 bg-mist-100/60 p-6 text-sm text-ink-600">
        La geometría oficial aún no está disponible en el dataset cargado.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[28px] border border-mist-200 bg-mist-100/50">
        {selectedArea ? (
          <div className="absolute left-4 top-4 z-10 max-w-[260px] rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
            <div className="text-sm font-semibold text-ink-900">{selectedArea.alcaldia}</div>
            <div className="mt-1 text-xs text-ink-600">
              {metricLabels[metric]}: {formatMetricValue(selectedArea, metric)}
            </div>
            <div
              className="mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-white"
              style={{ backgroundColor: getPriorityColor(selectedPriority) }}
            >
              {selectedPriority}
            </div>
          </div>
        ) : null}
        <svg
          viewBox="0 0 900 660"
          className="h-[420px] w-full bg-[radial-gradient(circle_at_top_left,rgba(14,165,164,0.06),transparent_42%),linear-gradient(180deg,#f8fafc,#eef2f7)]"
        >
          {geometry.map((feature) => {
            const area = areaLookup[feature.geoKey];
            const isSelected = feature.geoKey === selectedGeoKey;
            const priority = getPriorityLevel(area, metric, scale);
            return (
              <path
                key={feature.geoKey}
                d={feature.path}
                fill={area ? getPriorityColor(priority) : "#e2e8f0"}
                stroke={isSelected ? "#0f172a" : "#ffffff"}
                strokeWidth={isSelected ? 3 : 1.2}
                className="cursor-pointer transition-opacity duration-150 hover:opacity-90"
                onClick={() => onSelect(feature.geoKey)}
                onMouseEnter={() => onSelect(feature.geoKey)}
              >
                <title>{`${feature.alcaldia} · ${metricLabels[metric]}: ${formatMetricValue(area, metric)} · ${priority}`}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-600">Nivel de prioridad territorial</div>
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-mist-200 text-[11px] font-semibold text-ink-500"
            title="Los colores muestran prioridad relativa entre alcaldías para la métrica activa. No implican causalidad."
          >
            i
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {legend.map((item) => (
            <div
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-3 py-2 text-xs font-medium text-ink-700"
              title={`${item.label}: ${item.range}`}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
              <span className="text-ink-500">{item.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
