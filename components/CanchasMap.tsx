"use client";

import type { CanchaOperationalRecord, MapGeometryFeature } from "../lib/dashboard-types";

export type CanchasMapColorMode = "opening" | "work" | "documentation" | "location";

type CanchasMapProps = {
  geometry: MapGeometryFeature[];
  records: CanchaOperationalRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  colorMode: CanchasMapColorMode;
};

const colorsByOpening = {
  inaugurada_confirmada: "#1f9d72",
  probable: "#f0b429",
  sin_confirmacion_publica: "#d64545",
  contradiccion: "#7c3aed"
} as const;

const colorsByWork = {
  intervencion_confirmada: "#0ea5e9",
  lista_confirmada: "#1f9d72",
  entregada_confirmada: "#15803d",
  sin_confirmacion: "#d64545",
  contradiccion: "#7c3aed"
} as const;

const colorsByDocumentation = {
  completa: "#1f9d72",
  parcial: "#f0b429",
  minima: "#d64545"
} as const;

const colorsByLocation = {
  real: "#0f172a",
  aproximada_pilares: "#0ea5e9",
  aproximada_alcaldia: "#94a3b8",
  sin_coordenada: "#e2e8f0"
} as const;

const labelsByOpening = {
  inaugurada_confirmada: "Inaugurada confirmada",
  probable: "Probable",
  sin_confirmacion_publica: "Sin confirmación pública",
  contradiccion: "Contradicción"
} as const;

const labelsByWork = {
  intervencion_confirmada: "Intervención confirmada",
  lista_confirmada: "Lista confirmada",
  entregada_confirmada: "Entrega confirmada",
  sin_confirmacion: "Sin confirmación",
  contradiccion: "Contradicción"
} as const;

const labelsByDocumentation = {
  completa: "Documentación completa",
  parcial: "Documentación parcial",
  minima: "Documentación mínima"
} as const;

const labelsByLocation = {
  real: "Coordenada real",
  aproximada_pilares: "Aproximada por PILARES",
  aproximada_alcaldia: "Aproximada por alcaldía",
  sin_coordenada: "Sin coordenada"
} as const;

export default function CanchasMap({ geometry, records, selectedId, onSelect, colorMode }: CanchasMapProps) {
  const recordsWithPoint = records.filter((record) => record.projectedPoint);
  const selectedRecord = records.find((record) => record.id === selectedId) ?? recordsWithPoint[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[28px] border border-mist-200 bg-mist-100/50">
        {selectedRecord?.projectedPoint ? (
          <div className="absolute left-4 top-4 z-10 max-w-[280px] rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
            <div className="text-sm font-semibold text-ink-900">{selectedRecord.name}</div>
            <div className="mt-1 text-xs text-ink-600">{selectedRecord.alcaldia}</div>
            <div className="mt-2 text-xs text-ink-700">
              {colorMode === "opening"
                ? `Estado de apertura: ${labelsByOpening[selectedRecord.openingStatus]}`
                : colorMode === "work"
                  ? `Estado de obra: ${labelsByWork[selectedRecord.workStatus]}`
                  : colorMode === "documentation"
                    ? `Completitud documental: ${labelsByDocumentation[selectedRecord.documentationStatus]}`
                    : `Calidad de ubicación: ${labelsByLocation[selectedRecord.geolocationType]}`}
            </div>
            <div className="mt-2 inline-flex rounded-full border border-mist-200 bg-mist-100 px-3 py-1 text-[11px] font-medium text-ink-700">
              {selectedRecord.geolocationLabel}
            </div>
          </div>
        ) : null}
        <svg
          viewBox="0 0 900 660"
          className="h-[440px] w-full bg-[radial-gradient(circle_at_top_left,rgba(14,165,164,0.06),transparent_42%),linear-gradient(180deg,#f8fafc,#eef2f7)]"
        >
          {geometry.map((feature) => (
            <path
              key={feature.geoKey}
              d={feature.path}
              fill="#f8fafc"
              stroke="#d7dee7"
              strokeWidth={1.2}
            />
          ))}
          {recordsWithPoint.map((record) => {
            const isSelected = record.id === selectedRecord?.id;
            const point = record.projectedPoint!;
            const fill =
              colorMode === "opening"
                ? colorsByOpening[record.openingStatus]
                : colorMode === "work"
                  ? colorsByWork[record.workStatus]
                  : colorMode === "documentation"
                    ? colorsByDocumentation[record.documentationStatus]
                    : colorsByLocation[record.geolocationType];
            const label =
              colorMode === "opening"
                ? labelsByOpening[record.openingStatus]
                : colorMode === "work"
                  ? labelsByWork[record.workStatus]
                  : colorMode === "documentation"
                    ? labelsByDocumentation[record.documentationStatus]
                    : labelsByLocation[record.geolocationType];
            return (
              <g
                key={record.id}
                className="cursor-pointer"
                onClick={() => onSelect(record.id)}
                onMouseEnter={() => onSelect(record.id)}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 7.5 : 5.5}
                  fill={fill}
                  stroke={record.geolocationType === "real" ? (isSelected ? "#0f172a" : "#ffffff") : "#334155"}
                  strokeWidth={record.geolocationType === "real" ? (isSelected ? 2.5 : 1.5) : (isSelected ? 3 : 2)}
                  strokeDasharray={record.geolocationType === "real" ? undefined : "3 2"}
                  opacity={0.95}
                >
                  <title>{`${record.name} · ${record.alcaldia} · ${label} · ${record.geolocationLabel}`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3">
        {(colorMode === "opening"
          ? [
              { label: "Inaugurada confirmada", color: colorsByOpening.inaugurada_confirmada },
              { label: "Probable", color: colorsByOpening.probable },
              { label: "Sin confirmación pública", color: colorsByOpening.sin_confirmacion_publica },
              { label: "Contradicción", color: colorsByOpening.contradiccion }
            ]
          : colorMode === "work"
            ? [
                { label: "Intervención confirmada", color: colorsByWork.intervencion_confirmada },
                { label: "Lista confirmada", color: colorsByWork.lista_confirmada },
                { label: "Entrega confirmada", color: colorsByWork.entregada_confirmada },
                { label: "Sin confirmación", color: colorsByWork.sin_confirmacion },
                { label: "Contradicción", color: colorsByWork.contradiccion }
              ]
            : colorMode === "documentation"
              ? [
                  { label: "Documentación completa", color: colorsByDocumentation.completa },
                  { label: "Documentación parcial", color: colorsByDocumentation.parcial },
                  { label: "Documentación mínima", color: colorsByDocumentation.minima }
                ]
              : [
                  { label: "Coordenada real", color: colorsByLocation.real },
                  { label: "Aproximada por PILARES", color: colorsByLocation.aproximada_pilares },
                  { label: "Aproximada por alcaldía", color: colorsByLocation.aproximada_alcaldia },
                  { label: "Sin coordenada", color: colorsByLocation.sin_coordenada }
                ]).map((item) => (
          <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-3 py-2 text-xs font-medium text-ink-700">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-3 py-2 text-xs font-medium text-ink-700">
          <span className="h-3 w-3 rounded-full border-2 border-white bg-slate-700" />
          <span>Coordenada real</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-3 py-2 text-xs font-medium text-ink-700">
          <span className="h-3 w-3 rounded-full border-2 border-dashed border-slate-700 bg-white" />
          <span>Ubicación aproximada</span>
        </div>
      </div>
    </div>
  );
}
