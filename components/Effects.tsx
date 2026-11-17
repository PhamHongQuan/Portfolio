"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

// One listener for every .spot card: the glow follows the pointer. At most one update per frame,
// and only on devices with a real mouse (touch has nothing to follow).
export function Spotlight() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const e = last;
      const card = (e?.target as Element | null)?.closest?.<HTMLElement>(".spot");
      if (!e || !card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}

// Is the point over the moon of the scene on screen? (The moon sits behind the content layer, so it
// never receives the pointer itself.)
function moonAt(x: number, y: number) {
  const cinema = document.documentElement.classList.contains("cinema");
  for (const m of document.querySelectorAll<HTMLElement>(".moon")) {
    const scene = m.closest<HTMLElement>(".scene");
    if (cinema && !scene?.hasAttribute("data-live")) continue;
    if (scene && parseFloat(scene.style.opacity || "1") < 0.5) continue;
    const r = m.getBoundingClientRect();
    if (x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 10) return true;
  }
  return false;
}

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, summary";

type Mote = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number };

/**
 * A firefly that follows the mouse a little behind, hovering around it, and leaves a wake of glowing
 * motes. It swells over links and buttons, and glows bright over the moon (a hint: click it).
 * Mouse only, and night only (dark theme); the real cursor stays, the firefly is decoration on top.
 */
export function FireflyCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = dot.current!;
    const canvas = trail.current!;
    const ctx = canvas.getContext("2d")!;
    const root = document.documentElement;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = innerWidth;
      h = innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // A soft glowing dot, drawn once per theme and stamped for every mote.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const paintSprite = () => {
      const cs = getComputedStyle(root);
      const color = (root.dataset.theme === "dark" ? cs.getPropertyValue("--firefly") : cs.getPropertyValue("--sun")).trim() || "#d8ff9e";
      const g = sprite.getContext("2d")!;
      g.clearRect(0, 0, 32, 32);
      const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "#fff");
      grad.addColorStop(0.18, color);
      grad.addColorStop(1, "transparent");
      g.fillStyle = grad;
      g.fillRect(0, 0, 32, 32);
    };
    paintSprite();
    const themeWatch = new MutationObserver(paintSprite);
    themeWatch.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const motes: Mote[] = [];
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let scale = 1;
    let shown = false;
    let over: Element | null = null;
    let onMoon = false;
    let moonCheck = -1e9;
    let raf = 0;
    let lastTs = 0;
    let lastSpawn = 0;
    let drewMotes = false;

    const spawn = (n: number, burst = false) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = burst ? 0.05 + Math.random() * 0.12 : 0.01 + Math.random() * 0.025;
        motes.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - (burst ? 0.02 : 0.012), // drift upward, like sparks
          age: 0,
          life: (burst ? 700 : 520) + Math.random() * 500,
          size: (burst ? 10 : 7) + Math.random() * 8,
        });
      }
    };

    const tick = (ts: number) => {
      raf = 0;
      const dt = Math.min(50, ts - (lastTs || ts));
      lastTs = ts;
      const k = 1 - Math.exp(-dt / 90);
      // Hover around a point just above and right of the pointer, wandering a little.
      const t = ts / 1000;
      const hx = tx + 14 + Math.sin(t * 2.1) * 7 + Math.sin(t * 3.7) * 3;
      const hy = ty - 14 + Math.cos(t * 1.7) * 6 + Math.sin(t * 2.9) * 3;
      const px = x;
      const py = y;
      x += (hx - x) * k;
      y += (hy - y) * k;

      const target = onMoon ? 2.6 : over?.closest?.(INTERACTIVE) ? 1.7 : 1;
      scale += (target - scale) * k;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;

      const moved = Math.hypot(x - px, y - py);
      const gap = root.dataset.quality === "low" ? 70 : 30;
      // Fireflies are a night thing: by day (light theme) there is no firefly and no wake.
      if (shown && moved > 0.6 && ts - lastSpawn > gap && root.dataset.theme === "dark") {
        lastSpawn = ts;
        spawn(moved > 6 ? 2 : 1);
      }

      if (motes.length || drewMotes) {
        ctx.clearRect(0, 0, w, h);
        for (let i = motes.length - 1; i >= 0; i--) {
          const m = motes[i];
          m.age += dt;
          if (m.age >= m.life) {
            motes.splice(i, 1);
            continue;
          }
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          m.vx *= 0.985;
          const p = m.age / m.life;
          ctx.globalAlpha = (1 - p) * (0.55 + 0.45 * Math.sin(p * Math.PI * 3 + i)); // flicker as it fades
          const s = m.size * (1 - p * 0.5);
          ctx.drawImage(sprite, m.x - s / 2, m.y - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
        drewMotes = motes.length > 0;
      }

      // By day the firefly is hidden (CSS), so the loop rests too.
      if ((shown && root.dataset.theme === "dark") || motes.length) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      over = e.target as Element;
      // Over the moon? Measured here, at most ten times a second, never inside the animation loop:
      // reading layout there would force the browser to recompute it every frame while scrolling.
      if (e.timeStamp - moonCheck > 100) {
        moonCheck = e.timeStamp;
        const m = moonAt(tx, ty);
        if (m !== onMoon) el.toggleAttribute("data-moon", (onMoon = m));
      }
      if (!shown) {
        shown = true;
        x = tx + 14;
        y = ty - 14;
        el.toggleAttribute("data-on", true);
      }
      wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget) return; // still inside the page
      shown = false;
      el.toggleAttribute("data-on", false);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !shown || root.dataset.theme !== "dark") return;
      spawn(root.dataset.quality === "low" ? 6 : 14, true);
      wake();
    };

    addEventListener("resize", resize);
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave);
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      removeEventListener("resize", resize);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <>
      <canvas ref={trail} aria-hidden className="fly-trail" />
      <div ref={dot} aria-hidden className="fly-cursor">
        <i />
      </div>
    </>
  );
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

type Streak = { left: number; top: number; len: number; delay: number; dur: number };

/** Easter egg: click the moon (or type the Konami code) for a meteor shower. */
export function MeteorShower() {
  const [shower, setShower] = useState<{ id: number; streaks: Streak[] } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    let step = 0;

    const fire = () => {
      const n = root.dataset.quality === "low" ? 14 : 32;
      const streaks = Array.from({ length: n }, (_, i) => ({
        left: 20 + Math.random() * 95,
        top: -12 + Math.random() * 55,
        len: 80 + Math.random() * 180,
        delay: (i / n) * 2.6 + Math.random() * 0.3,
        dur: 0.8 + Math.random() * 0.9,
      }));
      setShower({ id: Date.now(), streaks });
      root.classList.add("wishing");
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        setShower(null);
        root.classList.remove("wishing");
      }, 4600);
    };

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      step = key === KONAMI[step] ? step + 1 : key === KONAMI[0] ? 1 : 0;
      if (step === KONAMI.length) {
        step = 0;
        fire();
      }
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(`${INTERACTIVE}, .spot`)) return;
      if (moonAt(e.clientX, e.clientY)) fire();
    };

    addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      clearTimeout(timer);
      root.classList.remove("wishing");
      removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  if (!shower) return null;
  return (
    <div key={shower.id} aria-hidden className="shower">
      {shower.streaks.map((s, i) => (
        <i
          key={i}
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.len}px`,
              "--delay": `${s.delay.toFixed(2)}s`,
              "--dur": `${s.dur.toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
