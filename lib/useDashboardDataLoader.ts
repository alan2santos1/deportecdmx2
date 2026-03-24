"use client";

import { useEffect, useState } from "react";
import type { DashboardDataset } from "./dashboard-types";
import { useDashboardStore } from "../store/useDashboardStore";

export default function useDashboardDataLoader() {
  const { loadDashboard, setError, setLoading } = useDashboardStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const candidates = [`${basePath}/data/dashboard.json`, "/data/dashboard.json"];

      try {
        setLoading(true);
        setError(null);
        console.log("[dashboard-loader] iniciando carga", { basePath, candidates });

        let payload: DashboardDataset | null = null;
        let lastError: Error | null = null;

        for (const url of candidates) {
          try {
            const response = await fetch(url, { cache: "no-store" });
            console.log("[dashboard-loader] respuesta fetch", { url, ok: response.ok, status: response.status });
            if (!response.ok) {
              throw new Error(`No se pudo cargar dashboard.json (${response.status}) desde ${url}`);
            }
            const nextPayload = (await response.json()) as DashboardDataset;
            console.log("[dashboard-loader] payload recibido", {
              url,
              territorialRecords: nextPayload.territorialRecords?.length ?? 0,
              infrastructureDetails: nextPayload.infrastructureDetails?.length ?? 0,
              healthProfiles: nextPayload.healthProfiles?.length ?? 0,
              mapAreas: nextPayload.mapAreas?.length ?? 0
            });
            if (!nextPayload.territorialRecords || nextPayload.territorialRecords.length === 0) {
              console.log("[dashboard-loader] payload vacío o incompleto", { url, hasMeta: Boolean(nextPayload.meta) });
            }
            payload = nextPayload;
            break;
          } catch (error) {
            lastError = error instanceof Error ? error : new Error("Error desconocido cargando dashboard.json");
            console.error("[dashboard-loader] fallo candidate", url, lastError);
          }
        }

        if (!payload) {
          throw lastError ?? new Error("No fue posible cargar ninguna ruta de dashboard.json");
        }

        loadDashboard(payload);
      } catch (error) {
        console.error(error);
        setError("No fue posible cargar el dataset estructurado del dashboard.");
      } finally {
        setReady(true);
        setLoading(false);
      }
    };
    load();
  }, [loadDashboard, setError, setLoading]);

  return { ready };
}
