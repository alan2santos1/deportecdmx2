"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SearchSelectOption = {
  value: string;
  label: string;
  hint?: string;
  badge?: string;
};

type SearchSelectProps = {
  value: string;
  options: SearchSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
};

export default function SearchSelect({
  value,
  options,
  onChange,
  placeholder = "Seleccionar",
  searchPlaceholder = "Buscar opción",
  emptyText = "Sin resultados"
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => [option.label, option.hint, option.badge].join(" ").toLowerCase().includes(normalized));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button className="selector-trigger" type="button" onClick={() => setOpen((current) => !current)}>
        <div className="min-w-0 text-left">
          <div className="truncate text-sm font-semibold text-ink-900">{selected?.label ?? placeholder}</div>
          {selected?.hint ? <div className="truncate text-xs text-ink-600">{selected.hint}</div> : null}
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">{open ? "Cerrar" : "Buscar"}</span>
      </button>

      {open ? (
        <div className="selector-panel">
          <input
            className="input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {filtered.length ? (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`selector-option ${option.value === value ? "selector-option-active" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink-900">{option.label}</div>
                    {option.hint ? <div className="truncate text-xs text-ink-600">{option.hint}</div> : null}
                  </div>
                  {option.badge ? <span className="badge shrink-0">{option.badge}</span> : null}
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-mist-300 bg-white/80 px-4 py-5 text-sm text-ink-600">
                {emptyText}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
