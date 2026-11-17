"use client";

import { useEffect, useState } from "react";

/*
 * Hidden performance panel: press ? (Esc closes). Live frame rate and frame time, the Core Web
 * Vitals of this visit (rated with Google's thresholds) and what the page is doing: render quality,
 * scenes drawn, weather, season, clock. "Measure, then optimize", on the page itself.
 */

type Vitals = { lcp?: number; cls: number; inp?: number; fcp?: number; ttfb?: number };
// [good up to, poor from]
const LIMITS = { lcp: [2500, 4000], cls: [0.1, 0.25], inp: [200, 500], fcp: [1800, 3000], ttfb: [800, 1800] } as const;

const vitals: Vitals = { cls: 0 };
let observing = false;

// Start listening at page load (buffered entries cover what happened before), so the numbers are
// there whenever the panel is opened.
function observe() {
  if (observing || typeof PerformanceObserver === "undefined") return;
  observing = true;
  const on = (type: string, cb: (list: PerformanceObserverEntryList) => void, extra: object = {}) => {
    try {
      new PerformanceObserver(cb).observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
    } catch {}
  };
  on("largest-contentful-paint", (l) => {
    const e = l.getEntries().at(-1);
    if (e) vitals.lcp = e.startTime;
  });
  on("layout-shift", (l) => {
    for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) vitals.cls += e.value;
  });
  // INP, approximated as the slowest interaction so far.
  on(
    "event",
    (l) => {
      for (const e of l.getEntries() as (PerformanceEntry & { interactionId?: number })[])
        if (e.interactionId) vitals.inp = Math.max(vitals.inp ?? 0, e.duration);
    },
    { durationThreshold: 16 },
  );
  on("paint", (l) => {
    for (const e of l.getEntries()) if (e.name === "first-contentful-paint") vitals.fcp = e.startTime;
  });
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav) vitals.ttfb = nav.responseStart;
}

type Snapshot = {
  fps: number;
  frame: number;
  worst: number;
  v: Vitals;
  quality: string;
  scenes: string;
  weather: string;
  season: string;
  clock: string;
  dom: number;
  heap?: number;
};

const rate = (key: keyof typeof LIMITS, v?: number) => (v == null ? "" : v <= LIMITS[key][0] ? "good" : v < LIMITS[key][1] ? "meh" : "poor");
const ms = (v?: number) => (v == null ? "–" : v >= 1000 ? `${(v / 1000).toFixed(2)} s` : `${Math.round(v)} ms`);

export default function PerfHud() {
  const [open, setOpen] = useState(false);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    observe();
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "?") setOpen((o) => !o);
      else if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  // While open: count frames, and refresh the panel twice a second.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    let raf = 0;
    let last = performance.now();
    let frames: number[] = [];
    const loop = (ts: number) => {
      frames.push(ts - last);
      last = ts;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const read = () => {
      const f = frames.length ? frames : [16.7];
      frames = [];
      const avg = f.reduce((a, b) => a + b, 0) / f.length;
      const scenes = document.querySelectorAll(".scene");
      const drawn = [...scenes].filter((s) => s.querySelector(".pl-mid svg")).length;
      const live = [...document.querySelectorAll<HTMLElement>(".scene[data-live]")].map((s) => s.id).join(", ");
      const mem = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      setSnap({
        fps: Math.round(1000 / avg),
        frame: avg,
        worst: Math.max(...f),
        v: { ...vitals },
        quality: root.dataset.quality ?? "–",
        scenes: `${drawn}/${scenes.length} drawn · on screen: ${live || "–"}`,
        weather: root.dataset.weather ?? "–",
        season: root.dataset.season ?? "–",
        clock: `${root.dataset.theme ?? "dark"} · ${root.dataset.clock ?? "–"}`,
        dom: document.getElementsByTagName("*").length,
        heap: mem ? mem.usedJSHeapSize / 1048576 : undefined,
      });
    };
    read();
    const timer = window.setInterval(read, 500);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, [open]);

  if (!open || !snap) return null;
  const { v } = snap;
  const fpsRate = snap.fps >= 55 ? "good" : snap.fps >= 40 ? "meh" : "poor";
  return (
    <aside className="perf-hud" aria-label="Performance">
      <header>
        <span>Performance</span>
        <kbd>?</kbd>
      </header>
      <dl>
        <dt>FPS</dt>
        <dd data-rate={fpsRate}>{snap.fps}</dd>
        <dt>Frame</dt>
        <dd>
          {snap.frame.toFixed(1)} ms <small>· worst {snap.worst.toFixed(0)} ms</small>
        </dd>
      </dl>
      <h3>Web Vitals</h3>
      <dl>
        <dt>LCP</dt>
        <dd data-rate={rate("lcp", v.lcp)}>{ms(v.lcp)}</dd>
        <dt>CLS</dt>
        <dd data-rate={rate("cls", v.cls)}>{v.cls.toFixed(3)}</dd>
        <dt>INP</dt>
        <dd data-rate={rate("inp", v.inp)}>{v.inp == null ? "interact" : ms(v.inp)}</dd>
        <dt>FCP</dt>
        <dd data-rate={rate("fcp", v.fcp)}>{ms(v.fcp)}</dd>
        <dt>TTFB</dt>
        <dd data-rate={rate("ttfb", v.ttfb)}>{ms(v.ttfb)}</dd>
      </dl>
      <h3>Page</h3>
      <dl>
        <dt>Quality</dt>
        <dd>{snap.quality}</dd>
        <dt>Scenes</dt>
        <dd>{snap.scenes}</dd>
        <dt>Sky</dt>
        <dd>
          {snap.clock} · {snap.weather}
          {snap.season !== "–" && ` · ${snap.season}`}
        </dd>
        <dt>DOM</dt>
        <dd>
          {snap.dom} nodes{snap.heap != null && ` · ${snap.heap.toFixed(1)} MB heap`}
        </dd>
      </dl>
    </aside>
  );
}
