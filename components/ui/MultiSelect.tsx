"use client";

import { useMemo, useState } from "react";

export type MultiSelectOption = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  title: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
};

export default function MultiSelect({ title, options, selected, onChange }: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query) return options;
    const lower = query.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lower));
  }, [options, query]);

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">{title}</div>
      <input
        className="input"
        placeholder={`Buscar ${title}`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="max-h-40 space-y-2 overflow-auto rounded-xl border border-mist-200 bg-white p-3">
        {filtered.length === 0 ? (
          <div className="text-xs text-ink-500">Sin valores detectados.</div>
        ) : (
          filtered.map((option) => {
            const isChecked = selected.includes(option.value);
            return (
              <label key={option.value} className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(event) => {
                    const next = new Set(selected);
                    if (event.target.checked) {
                      next.add(option.value);
                    } else {
                      next.delete(option.value);
                    }
                    onChange(Array.from(next));
                  }}
                />
                {option.label}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
