"use client";

import { useSyncExternalStore } from "react";
import { MODULE_BY_ID } from "@/lib/tour/modules";
import { META, type TourContext, type TourRow, type TourStatus } from "@/lib/tour/logic";

// One small store shared by the header Help button, the dashboard tour card,
// the spotlight and the Help Center. It lives at module level so an active
// tour survives client-side navigation between pages, while the database
// (tour_progress) stays the source of truth across devices.

export interface ActiveTour {
  id: string;
  step: number;
}

interface State {
  loaded: boolean;
  signedIn: boolean;
  rows: TourRow[];
  ctx: TourContext;
  active: ActiveTour | null;
  helpOpen: boolean;
  /** The tour card appeared during this visit; kept so it stays up until answered. */
  offerVisible: boolean;
}

let state: State = {
  loaded: false,
  signedIn: false,
  rows: [],
  ctx: { isNew: false, entryCount: 0, hasArchetype: false, hasSchools: false },
  active: null,
  helpOpen: false,
  offerVisible: false,
};

const listeners = new Set<() => void>();
function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const SERVER_STATE = state;
export function useTour(): State {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}
export function getTour(): State {
  return state;
}

let inflight: Promise<void> | null = null;

/** Fetch progress and context. Called once per page view. */
export function loadTour(): Promise<void> {
  if (inflight) return inflight;
  inflight = fetch("/api/tour", { cache: "no-store" })
    .then(async (r) => {
      if (!r.ok) return set({ loaded: true, signedIn: false });
      const data = (await r.json()) as { rows: TourRow[]; ctx: TourContext };
      // Local rows written since the request left win over the fetched copy.
      set({ loaded: true, signedIn: true, rows: mergeRows(data.rows, state.rows), ctx: data.ctx });
    })
    .catch(() => set({ loaded: true }))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function mergeRows(server: TourRow[], local: TourRow[]): TourRow[] {
  const byId = new Map(server.map((r) => [r.module_id, r]));
  for (const r of local) {
    const s = byId.get(r.module_id);
    if (!s || (r.updated_at ?? "") > (s.updated_at ?? "")) byId.set(r.module_id, r);
  }
  return [...byId.values()];
}

/** Save one row locally and to the server. keepalive lets it finish even
 *  when the step's own action navigates away. */
export function saveRow(module_id: string, status: TourStatus, last_step = 0) {
  const row: TourRow = { module_id, status, last_step, updated_at: new Date().toISOString() };
  set({ rows: [...state.rows.filter((r) => r.module_id !== module_id), row] });
  void fetch("/api/tour", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ module_id, status, last_step }),
    keepalive: true,
  }).catch(() => {});
}

export function startTour(id: string, step = 0) {
  if (!MODULE_BY_ID[id]) return;
  set({ active: { id, step }, helpOpen: false });
  saveRow(id, "in_progress", step);
}

export function goToStep(step: number) {
  const a = state.active;
  if (!a) return;
  const m = MODULE_BY_ID[a.id];
  if (step < 0) return;
  if (step >= m.steps.length) return endTour("completed");
  set({ active: { id: a.id, step } });
  saveRow(a.id, "in_progress", step);
}

export function endTour(status: "completed" | "dismissed") {
  const a = state.active;
  if (!a) return;
  set({ active: null });
  saveRow(a.id, status, a.step);
}

export function markOfferShown() {
  if (state.offerVisible) return;
  set({ offerVisible: true });
  saveRow(META.offer, "in_progress");
}

export function openHelp() {
  set({ helpOpen: true });
}
export function closeHelp() {
  set({ helpOpen: false });
}

export function setTipsOff(off: boolean) {
  saveRow(META.tipsOff, off ? "completed" : "not_started");
}

export async function restartAllTours() {
  set({ rows: state.rows.filter((r) => r.module_id.startsWith("_")), active: null });
  await fetch("/api/tour", { method: "DELETE" }).catch(() => {});
}
