"use client";

import { create } from "zustand";
import type { DashboardDataset } from "../lib/dashboard-types";

type DashboardState = {
  dataset: DashboardDataset | null;
  loading: boolean;
  error: string | null;
  presentationMode: boolean;
  loadDashboard: (payload: DashboardDataset) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setPresentationMode: (value: boolean) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  dataset: null,
  loading: false,
  error: null,
  presentationMode: false,
  loadDashboard: (payload) => set({ dataset: payload, loading: false, error: null }),
  setLoading: (value) => set({ loading: value }),
  setError: (value) => set({ error: value, loading: false }),
  setPresentationMode: (value) => set({ presentationMode: value })
}));
