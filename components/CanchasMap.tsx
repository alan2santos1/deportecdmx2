"use client";

import type { CanchaOperationalRecord, MapGeometryFeature } from "../lib/dashboard-types";

export type CanchasMapColorMode = "inauguration" | "completion";

type CanchasMapProps = {
  geometry: MapGeometryFeature[];
  records: CanchaOperationalRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  colorMode: CanchasMapColorMode;
};

const colorsByInauguration = {
  inaugurada: "#1f9d72",
  proxima: "#f0b429",
  sin_fecha: "#d64545"
} as const;

const colorsByCompletion = {
  completa: "#1f9d72",
  lista_para_operar: "#0ea5e9",
  parcial: "#f0b429",
  pendiente: "#d64545"
} as const;

const labelsByInauguration = {
  inaugurada: "Inaugurada",
  proxima: "Próxima",
  sin_fecha: "Sin fecha"
} as const;

const labelsByCompletion = {
  completa: "Completa",
  lista_para_operar: "Lista para operar",
  parcial: "Parcial",
  pendiente: "Pendiente"
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
              {colorMode === "inauguration"
                ? `Estatus de inauguración: ${labelsByInauguration[selectedRecord.inaugurationStatus]}`
                : `Estatus operativo: ${labelsByCompletion[selectedRecord.operationalStatus]}`}
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
              colorMode === "inauguration"
                ? colorsByInauguration[record.inaugurationStatus]
                : colorsByCompletion[record.operationalStatus];
            const label =
              colorMode === "inauguration"
                ? labelsByInauguration[record.inaugurationStatus]
                : labelsByCompletion[record.operationalStatus];
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
        {(colorMode === "inauguration"
          ? [
              { label: "Inaugurada", color: colorsByInauguration.inaugurada },
              { label: "Próxima", color: colorsByInauguration.proxima },
              { label: "Sin fecha", color: colorsByInauguration.sin_fecha }
            ]
          : [
              { label: "Completa", color: colorsByCompletion.completa },
              { label: "Lista para operar", color: colorsByCompletion.lista_para_operar },
              { label: "Parcial", color: colorsByCompletion.parcial },
              { label: "Pendiente", color: colorsByCompletion.pendiente }
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
