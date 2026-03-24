"use client";

import { useRef, useState } from "react";
import { useWorkbookStore } from "../store/useWorkbookStore";

export default function AdminModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { loadWorkbook } = useWorkbookStore();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.endsWith(".xlsx")) {
      setError("Selecciona un archivo .xlsx.");
      return;
    }
    setError(null);
    const buffer = await file.arrayBuffer();
    await loadWorkbook(buffer, file.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-ink-900">Dataset</div>
            <div className="text-sm text-ink-600">Carga manual y reconstrucción del workbook deportivo.</div>
          </div>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-mist-200 bg-mist-100 p-4 text-sm text-ink-700">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">Reemplazar dataset</div>
            <p className="mt-2">Sube un nuevo Excel para sustituir localmente el dataset cargado.</p>
            <button className="btn-primary mt-3" type="button" onClick={() => inputRef.current?.click()}>
              Reemplazar dataset (.xlsx)
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(event) => handleUpload(event.target.files)}
            />
            {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
          </div>
          <div className="rounded-xl border border-mist-200 bg-white p-4 text-sm text-ink-700">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">Reconstrucción</div>
            <p className="mt-2">Actualiza el seed en <span className="font-mono">/data/deporte-cdmx-seed.json</span> y ejecuta:</p>
            <div className="mt-3 rounded-lg bg-mist-100 px-3 py-2 text-xs font-mono text-ink-700">
              npm run data:build
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
