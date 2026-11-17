"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isWeatherKind, type WeatherKind, type WeatherReport } from "@/lib/weather";

type Shown = { kind: WeatherKind; temp?: number; city: string | null };

/**
 * The visitor's real weather over the landscape (app/api/weather): rain with ripples where drops land,
 * snow, cloud cover that dims the stars and aurora, lightning in a storm, and a small caption.
 * html[data-weather] drives the CSS parts; `?weather=rain|storm|snow|cloudy|fog|drizzle|clear` forces one.
 */
export default function Weather() {
  const { c } = useLanguage();
  const [w, setW] = useState<Shown | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const kind = w?.kind;

  useEffect(() => {
    const forced = new URLSearchParams(location.search).get("weather");
    let alive = true;
    fetch("/api/weather")
      .then((r) => r.json() as Promise<WeatherReport>)
      .catch((): WeatherReport => ({ kind: null, city: null }))
      .then((d) => {
        if (!alive) return;
        const k = isWeatherKind(forced) ? forced : d.kind;
        if (k) setW({ kind: k, temp: d.temp, city: d.city });
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!kind) return;
    const root = document.documentElement;
    root.dataset.weather = kind;
    return () => {
      delete root.dataset.weather;
    };
  }, [kind]);

  // Rain or snow, drawn on one canvas. Rain drops leave a ripple where they land on the ground or
  // the water (below the horizon); snow drifts down swaying.
  useEffect(() => {
    if (!kind || !["drizzle", "rain", "storm", "snow"].includes(kind)) return;
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const root = document.documentElement;
    const snow = kind === "snow";
    const low = root.dataset.quality === "low";
    const count = Math.round(({ drizzle: 90, rain: 220, storm: 320, snow: 150 } as Record<string, number>)[kind] * (low ? 0.5 : 1));
    const speed = kind === "storm" ? 1.25 : kind === "drizzle" ? 0.7 : 1;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = innerWidth;
      h = innerHeight;
      el.width = w * dpr;
      el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    type Drop = { x: number; y: number; v: number; len: number; land: number; r: number; phase: number };
    const spawn = (d: Partial<Drop> = {}, top = false): Drop => ({
      x: Math.random() * (w + 200),
      y: top ? -20 - Math.random() * 60 : Math.random() * h,
      v: snow ? 30 + Math.random() * 50 : (700 + Math.random() * 500) * speed,
      len: snow ? 0 : 10 + Math.random() * 16,
      land: h * (0.62 + Math.random() * 0.38),
      r: snow ? 1 + Math.random() * 2.2 : 0,
      phase: Math.random() * Math.PI * 2,
      ...d,
    });
    const drops = Array.from({ length: count }, () => spawn());
    const ripples: { x: number; y: number; age: number }[] = [];

    let raf = 0;
    let last = performance.now();
    const tick = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      ctx.clearRect(0, 0, w, h);
      const dark = root.dataset.theme === "dark";
      if (snow) {
        ctx.fillStyle = dark ? "rgba(235,245,255,0.8)" : "rgba(255,255,255,0.95)";
        for (const d of drops) {
          d.y += d.v * dt;
          d.x += Math.sin(ts / 1000 + d.phase) * 18 * dt - 6 * dt;
          if (d.y > h + 10) Object.assign(d, spawn({}, true));
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const slant = -0.18; // wind pushes the rain a little sideways
        ctx.strokeStyle = dark ? "rgba(190,220,235,0.32)" : "rgba(70,105,125,0.32)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const d of drops) {
          d.y += d.v * dt;
          d.x += d.v * slant * dt;
          if (d.y >= d.land) {
            if (ripples.length < 160) ripples.push({ x: d.x, y: d.land, age: 0 });
            Object.assign(d, spawn({}, true));
            continue;
          }
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.len * slant, d.y - d.len);
        }
        ctx.stroke();
        ctx.lineWidth = 0.8;
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.age += dt;
          const p = r.age / 0.45;
          if (p >= 1) {
            ripples.splice(i, 1);
            continue;
          }
          const depth = (r.y - h * 0.62) / (h * 0.38); // nearer the camera, bigger rings
          ctx.globalAlpha = (1 - p) * 0.5;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, (3 + p * 11) * (0.6 + depth), (1 + p * 3) * (0.6 + depth), 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [kind]);

  // Lightning now and then in a storm; the sound engine answers with thunder (Ambience.tsx).
  useEffect(() => {
    if (kind !== "storm") return;
    let timer = 0;
    const strike = () => {
      flash.current?.animate([{ opacity: 0 }, { opacity: 0.85 }, { opacity: 0.1 }, { opacity: 0.6 }, { opacity: 0 }], {
        duration: 750,
        easing: "ease-out",
      });
      dispatchEvent(new CustomEvent("thunder", { detail: { delay: 0.4 + Math.random() * 2 } }));
      timer = window.setTimeout(strike, 7000 + Math.random() * 12000);
    };
    timer = window.setTimeout(strike, 3000 + Math.random() * 4000);
    return () => clearTimeout(timer);
  }, [kind]);

  if (!w) return null;
  const city = w.city ?? c.weather.fallbackCity;
  return (
    <>
      <canvas ref={canvas} aria-hidden className="weather-fx" />
      {w.kind === "storm" && <div ref={flash} aria-hidden className="lightning" />}
      <p className="weather-chip">
        <WeatherIcon kind={w.kind} />
        <span>
          {c.weather.kinds[w.kind]} · {city}
          {w.temp != null && Number.isFinite(w.temp) && <span className="tabular-nums"> · {w.temp}°C</span>}
        </span>
      </p>
    </>
  );
}

function WeatherIcon({ kind }: { kind: WeatherKind }) {
  const cloud = <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 11.1 3.5 3.5 0 0 0 7 18z" />;
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {kind === "clear" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1" />
        </>
      ) : (
        <g transform={kind === "cloudy" || kind === "fog" ? undefined : "translate(0 -3)"}>
          {cloud}
          {(kind === "rain" || kind === "drizzle") && <path d="M9 21l-1 2M13 21l-1 2M17 21l-1 2" />}
          {kind === "storm" && <path d="M12.5 19l-2 3.5h3l-2 3" />}
          {kind === "snow" && <path d="M9 22h.01M13 22h.01M17 22h.01" />}
          {kind === "fog" && <path d="M5 21h14" />}
        </g>
      )}
    </svg>
  );
}
