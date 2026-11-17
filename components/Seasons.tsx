"use client";

import { useEffect, useRef, useState } from "react";
import { SEASONS, seasonFor, type Season } from "@/lib/seasons";

/**
 * Festivals, by the visitor's calendar (lib/seasons.ts), drawn on one canvas over the landscape:
 *   Tết: apricot (mai) and peach (đào) blossoms drifting down; fireworks over the valley at night.
 *   Trung thu: paper lanterns rising slowly into the sky; the moon grows warmer (CSS).
 *   Noel: snow.
 * html[data-season] lets the CSS join in. `?season=tet|trungthu|noel` forces one, `?season=none` none.
 */
export default function Seasons() {
  const [season, setSeason] = useState<Season | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const forced = new URLSearchParams(location.search).get("season");
    const s = SEASONS.includes(forced as Season) ? (forced as Season) : forced === "none" ? null : seasonFor(new Date());
    if (!s) return;
    const root = document.documentElement;
    root.dataset.season = s;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the date is only known on the client
    setSeason(s);
    return () => {
      delete root.dataset.season;
    };
  }, []);

  useEffect(() => {
    if (!season) return;
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const root = document.documentElement;
    const low = root.dataset.quality === "low";
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
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // ---- falling things: blossoms or snow
    type Fall = { x: number; y: number; vx: number; vy: number; r: number; rot: number; spin: number; phase: number; color: string };
    const blossom = season === "tet";
    const fallCount = season === "trungthu" ? 0 : Math.round((blossom ? 34 : 130) * (low ? 0.5 : 1));
    const newFall = (top: boolean): Fall => ({
      x: rand(-50, w + 50),
      y: top ? rand(-60, -10) : rand(0, h),
      vx: blossom ? rand(-30, -10) : rand(-8, 4),
      vy: blossom ? rand(28, 55) : rand(30, 80),
      r: blossom ? rand(5, 9) : rand(1, 2.6),
      rot: rand(0, Math.PI * 2),
      spin: rand(-1.5, 1.5),
      phase: rand(0, Math.PI * 2),
      color: blossom ? (Math.random() < 0.6 ? "#f7c948" : "#f6a5b8") : "rgba(240,248,255,0.9)",
    });
    const falls = Array.from({ length: fallCount }, () => newFall(false));
    const flower = (f: Fall) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.fillStyle = f.color;
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -f.r * 0.55, f.r * 0.34, f.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#c2410c";
      ctx.beginPath();
      ctx.arc(0, 0, f.r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ---- lanterns (Trung thu)
    type Lantern = { x: number; y: number; vy: number; s: number; phase: number; hue: number };
    const newLantern = (bottom: boolean): Lantern => ({
      x: rand(0.04, 0.96) * w,
      y: bottom ? h + rand(20, 200) : rand(h * 0.1, h),
      vy: rand(14, 28),
      s: rand(0.6, 1.2),
      phase: rand(0, Math.PI * 2),
      hue: rand(8, 38),
    });
    const lanterns = season === "trungthu" ? Array.from({ length: low ? 8 : 15 }, () => newLantern(false)) : [];
    const lantern = (l: Lantern, t: number) => {
      const x = l.x + Math.sin(t * 0.6 + l.phase) * 12;
      const flicker = 0.85 + Math.sin(t * 7 + l.phase) * 0.08;
      const bw = 16 * l.s;
      const bh = 22 * l.s;
      const glow = ctx.createRadialGradient(x, l.y, 0, x, l.y, bh * 2.2);
      glow.addColorStop(0, `hsla(${l.hue}, 100%, 60%, ${0.35 * flicker})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - bh * 2.2, l.y - bh * 2.2, bh * 4.4, bh * 4.4);
      const body = ctx.createLinearGradient(x, l.y - bh / 2, x, l.y + bh / 2);
      body.addColorStop(0, `hsla(${l.hue + 20}, 100%, ${70 * flicker}%, 1)`);
      body.addColorStop(1, `hsla(${l.hue}, 95%, ${48 * flicker}%, 1)`);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.roundRect(x - bw / 2, l.y - bh / 2, bw, bh, bw * 0.45);
      ctx.fill();
      ctx.fillStyle = "rgba(60,20,0,0.55)";
      ctx.fillRect(x - bw * 0.3, l.y - bh / 2 - 1.5 * l.s, bw * 0.6, 2 * l.s);
      ctx.fillRect(x - bw * 0.3, l.y + bh / 2 - 0.5 * l.s, bw * 0.6, 2 * l.s);
    };

    // ---- fireworks (Tết, at night)
    type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number; color: string };
    type Rocket = { x: number; y: number; vy: number; top: number; color: string };
    const sparks: Spark[] = [];
    const rockets: Rocket[] = [];
    const COLORS = ["#ffd166", "#ff5d5d", "#ff9f43", "#ffe8a3", "#f78fb3"];
    let nextRocket = 1.2;
    const burst = (r: Rocket) => {
      const n = low ? 36 : 70;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.05, 0.05);
        const v = rand(60, 150);
        sparks.push({ x: r.x, y: r.top, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: rand(1, 1.8), color: r.color });
      }
    };

    let raf = 0;
    let last = performance.now();
    let clock = 0;
    const tick = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      clock += dt;
      ctx.clearRect(0, 0, w, h);
      const night = root.dataset.theme === "dark";

      for (const f of falls) {
        f.y += f.vy * dt;
        f.x += (f.vx + Math.sin(clock * 1.3 + f.phase) * (blossom ? 22 : 10)) * dt;
        f.rot += f.spin * dt;
        if (f.y > h + 20 || f.x < -80) Object.assign(f, newFall(true));
        if (blossom) flower(f);
        else {
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const l of lanterns) {
        l.y -= l.vy * dt;
        if (l.y < -60) Object.assign(l, newLantern(true));
        lantern(l, clock);
      }

      if (blossom && night) {
        nextRocket -= dt;
        if (nextRocket <= 0) {
          nextRocket = rand(1.2, 3.5);
          rockets.push({ x: rand(0.15, 0.85) * w, y: h * 0.62, vy: rand(380, 520), top: rand(0.1, 0.32) * h, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
        }
      }
      ctx.lineWidth = 2;
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y -= r.vy * dt;
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + 14);
        ctx.stroke();
        if (r.y <= r.top) {
          burst(r);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.age += dt;
        if (s.age >= s.life) {
          sparks.splice(i, 1);
          continue;
        }
        s.vx *= 0.985;
        s.vy = s.vy * 0.985 + 60 * dt; // gravity
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.globalAlpha = (1 - s.age / s.life) * (0.7 + Math.random() * 0.3);
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x - 1.2, s.y - 1.2, 2.4, 2.4);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onVis = () => {
      last = performance.now(); // no jump after a hidden tab
    };
    document.addEventListener("visibilitychange", onVis);
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("resize", resize);
    };
  }, [season]);

  if (!season) return null;
  return <canvas ref={canvas} aria-hidden className="season-fx" />;
}
