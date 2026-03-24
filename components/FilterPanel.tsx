"use client";

import type { FilterState } from "../lib/types";

type FilterConfig = {
  key: string;
  column: string;
  values: string[];
};

type FilterPanelProps = {
  filters: FilterConfig[];
  selected: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
};

export default function FilterPanel({ filters, selected, onChange, onReset }: FilterPanelProps) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-ink-900">Filtros globales</div>
          <div className="text-xs text-ink-600">Multi-seleccion por categoria.</div>
        </div>
        <button className="btn-ghost" type="button" onClick={onReset}>
          Reset filters
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filters.map((filter) => (
          <div key={filter.key} className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">{filter.key}</div>
            <div className="max-h-40 space-y-2 overflow-auto rounded-xl border border-mist-200 bg-white p-3">
              {filter.values.length === 0 ? (
                <div className="text-xs text-ink-500">Sin valores detectados.</div>
              ) : (
                filter.values.map((value) => {
                  const isChecked = selected[filter.column]?.includes(value) ?? false;
                  return (
                    <label key={value} className="flex items-center gap-2 text-sm text-ink-700">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(event) => {
                          const next = { ...selected };
                          const current = new Set(next[filter.column] ?? []);
                          if (event.target.checked) {
                            current.add(value);
                          } else {
                            current.delete(value);
                          }
                          next[filter.column] = Array.from(current);
                          onChange(next);
                        }}
                      />
                      {value}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
