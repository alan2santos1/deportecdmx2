"use client";

import { useEffect, useState } from "react";
import type { WorkbookJson } from "./types";
import { useWorkbookStore } from "../store/useWorkbookStore";

export default function useWorkbookJsonLoader() {
  const { loadWorkbookJson } = useWorkbookStore();
  const [autoLoading, setAutoLoading] = useState(true);
  const [jsonFailed, setJsonFailed] = useState(false);

  useEffect(() => {
    const loadJson = async () => {
      try {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
        const response = await fetch(`${basePath}/data/workbook.json`, { cache: "no-store" });
        if (!response.ok) {
          setJsonFailed(true);
          return;
        }
        const payload = (await response.json()) as WorkbookJson;
        loadWorkbookJson(payload);
      } catch (err) {
        console.error(err);
        setJsonFailed(true);
      } finally {
        setAutoLoading(false);
      }
    };
    loadJson();
  }, [loadWorkbookJson]);

  return { autoLoading, jsonFailed };
}
