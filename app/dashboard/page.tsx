"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import FileLoader from "../../components/FileLoader";
import Dashboard from "../../components/Dashboard";
import DataQuality from "../../components/DataQuality";
import RawSheets from "../../components/RawSheets";
import Methodology from "../../components/Methodology";
import AdminModal from "../../components/AdminModal";
import Badge from "../../components/ui/Badge";
import Tabs from "../../components/ui/Tabs";
import Toggle from "../../components/ui/Toggle";
import StatusPill from "../../components/ui/StatusPill";
import LoadingState from "../../components/LoadingState";
import { useWorkbookStore } from "../../store/useWorkbookStore";
import useWorkbookJsonLoader from "../../lib/useWorkbookJsonLoader";

const baseTabs = ["Panorama", "Calidad", "Hojas", "Metodología"] as const;

type TabKey = (typeof baseTabs)[number];

export default function DashboardPage() {
  const {
    workbook,
    loadWorkbook,
    loading,
    error,
    presentationMode,
    setPresentationMode,
    meta,
    dataSource
  } = useWorkbookStore();
  const [activeTab, setActiveTab] = useState<TabKey>("Panorama");
  const [showAdmin, setShowAdmin] = useState(false);
  const { autoLoading, jsonFailed } = useWorkbookJsonLoader();

  const methodologySheets = useMemo(
    () => [
      { title: "README", sheet: workbook?.sheets["README"] ?? null },
      { title: "METODOLOGÍA", sheet: workbook?.sheets["METODOLOGIA"] ?? null },
      { title: "DICCIONARIO MVP", sheet: workbook?.sheets["DICCIONARIO_MVP"] ?? null },
      { title: "FUENTES", sheet: workbook?.sheets["FUENTES"] ?? null }
    ],
    [workbook]
  );

  return (
    <main className={`min-h-screen bg-atmosphere px-6 py-10 ${presentationMode ? "presentation" : ""}`}>
      <div className={`mx-auto flex w-full max-w-6xl flex-col gap-10 ${presentationMode ? "max-w-screen-2xl" : ""}`}>
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge>Inteligencia deportiva territorial</Badge>
            <h1 className="text-3xl font-semibold text-ink-900 md:text-4xl">Deporte CDMX</h1>
            <p className="max-w-2xl text-sm text-ink-600">
              Dashboard de inteligencia deportiva para actividad física, infraestructura y salud en la Ciudad de México.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Toggle checked={presentationMode} onChange={setPresentationMode} label="Modo presentación" />
            <div className="flex items-center gap-2">
              {!presentationMode ? (
                <button className="btn-ghost" type="button" onClick={() => setShowAdmin(true)}>
                  Dataset
                </button>
              ) : null}
              <StatusPill meta={meta} label={dataSource === "json" ? "Dataset: deporte_cdmx" : meta?.fileName} />
            </div>
          </div>
        </header>

        <AdminModal open={showAdmin} onClose={() => setShowAdmin(false)} />

        {error ? <div className="card p-4 text-sm text-red-600">{error}</div> : null}

        {loading || autoLoading ? (
          <LoadingState />
        ) : !workbook && jsonFailed ? (
          <div className={presentationMode ? "hidden" : ""}>
            <FileLoader onLoad={loadWorkbook} loading={loading} />
          </div>
        ) : !workbook ? (
          <div className="card p-6 text-sm text-ink-600">
            <p className="font-semibold text-ink-900">Carga de datos</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Se carga automáticamente `public/data/workbook.json` si existe.</li>
              <li>También puedes subir un archivo `.xlsx` con una hoja `DEPORTE_CDMX_BASE`.</li>
              <li>La información se procesa localmente en el navegador.</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs tabs={baseTabs} active={activeTab} onChange={setActiveTab} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "Panorama" && <Dashboard />}
                {activeTab === "Calidad" && <DataQuality />}
                {activeTab === "Hojas" && <RawSheets />}
                {activeTab === "Metodología" && <Methodology sheets={methodologySheets} />}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
