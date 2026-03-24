"use client";

import { useCallback, useRef, useState } from "react";

type FileLoaderProps = {
  onLoad: (buffer: ArrayBuffer, fileName: string) => Promise<void>;
  loading: boolean;
};

export default function FileLoader({ onLoad, loading }: FileLoaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.name.endsWith(".xlsx")) {
        setError("Selecciona un archivo .xlsx.");
        return;
      }
      setError(null);
      const buffer = await file.arrayBuffer();
      await onLoad(buffer, file.name);
    },
    [onLoad]
  );

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    await handleFiles(event.dataTransfer.files);
  };

  const handleSample = async () => {
    setError(null);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const response = await fetch(`${basePath}/sample.xlsx`);
    if (!response.ok) {
      setError("No se encontró `sample.xlsx` en `/public`.");
      return;
    }
    const buffer = await response.arrayBuffer();
    await onLoad(buffer, "sample.xlsx");
  };

  return (
    <div className="card p-6 space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragActive ? "border-accent-600 bg-accent-600/5" : "border-mist-200 bg-white"
        }`}
      >
        <div className="text-lg font-semibold text-ink-900">Carga tu archivo Excel</div>
        <p className="text-sm text-ink-600">
          Compatible con `.xlsx`. El archivo se procesa localmente en tu navegador y no se sube a ningún servidor.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className="btn-primary"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Seleccionar archivo"}
          </button>
          <button className="btn-ghost" type="button" onClick={handleSample} disabled={loading}>
            Cargar ejemplo desde /public
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}
