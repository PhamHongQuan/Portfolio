"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Fore, Mid, SetName, starfield } from "./Landscape";

// Scroll distance per scene, in screen heights: it holds still for HOLD, then the camera travels for MOVE.
const HOLD = 0.55;
const MOVE = 1;
const SEG = HOLD + MOVE;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * Pins one screen and plays the page as a sequence of scenes. Scrolling pushes the camera through the
 * current scene and out of it, while the next one comes in from the distance (multiplane, like a film).
 * It writes transform and opacity straight onto each scene's planes; ambient motion lives in globals.css.
 * Without JS, or with reduced motion, the scenes simply stack as normal full-height sections.
 */
export default function Film({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const film = ref.current;
    if (!film || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const scenes = [...film.querySelectorAll<HTMLElement>(".scene")];
    const n = scenes.length;
    root.classList.add("cinema");

    let vh = innerHeight;
    let top = 0;
    let cur = NaN; // smoothed camera position, in screen heights
    const last = scenes.map(() => ({ enter: -1, leave: -1 }));
    const planes = scenes.map((el) =>
      [".pl-back", ".pl-mid", ".pl-fore", ".pl-main"].map((c) => el.querySelector<HTMLElement>(`:scope > ${c}`)!),
    );

    const measure = () => {
      vh = innerHeight;
      film.style.height = `${((n - 1) * SEG + HOLD) * vh + vh}px`;
      top = film.getBoundingClientRect().top + scrollY;
      // Shrink any scene whose content is taller than the screen, so nothing is ever cut off.
      film.querySelectorAll<HTMLElement>(".fit").forEach((f) => {
        f.style.setProperty("--fit", "1");
        f.style.setProperty("--fit", String(Math.min(1, (vh - 96 - Math.max(40, vh * 0.09)) / f.scrollHeight)));
      });
      cur = NaN;
      frame();
    };

    const render = (p: number) => {
      scenes.forEach((el, i) => {
        const v = p - i * SEG;
        const enter = i === 0 ? 0 : ease(clamp(-v / MOVE));
        const leave = i === n - 1 ? 0 : ease(clamp((v - HOLD) / MOVE));
        const prev = last[i];
        if (Math.abs(prev.enter - enter) < 1e-4 && Math.abs(prev.leave - leave) < 1e-4) return; // nothing moved
        prev.enter = enter;
        prev.leave = leave;
        const shown = enter < 1 && leave < 1;
        // Written straight onto the four planes: an inherited CSS variable would restyle every
        // descendant each frame (measured ~30x slower). Each plane scales at its own rate.
        const [back, mid, fore, main] = planes[i];
        back.style.transform = `scale(${(1 + leave * 0.35 - enter * 0.25).toFixed(4)})`;
        mid.style.transform = `scale(${(1 + leave * 1.6 - enter * 0.55).toFixed(4)})`;
        mid.style.opacity = (1 - leave * 0.9).toFixed(3);
        fore.style.transform = `scale(${(1 + leave * 3.5 + enter * 1.4).toFixed(4)})`;
        fore.style.opacity = Math.max(0, 1 - enter * 1.6 - leave * 0.6).toFixed(3);
        main.style.transform = `scale(${(1 + leave * 2.4 - enter * 0.7).toFixed(4)})`;
        main.style.opacity = Math.max(0, 1 - leave * 2.2).toFixed(3);
        // The leaving scene sits on top and dissolves once the camera is well inside it.
        el.style.opacity = Math.min(1, Math.max(0, 1 - enter * 1.05 - Math.max(0, leave - 0.3) * 1.7)).toFixed(3);
        el.style.visibility = shown ? "" : "hidden";
        el.style.zIndex = String(n - i);
        el.toggleAttribute("data-live", shown);
        el.inert = !(enter < 0.5 && leave < 0.5);
      });
    };

    // The camera eases toward the scroll position instead of jumping with each wheel notch.
    let raf = 0;
    let lastTs = 0;
    const frame = (ts = performance.now()) => {
      raf = 0;
      const target = (scrollY - top) / vh;
      // After a long gap (background tab, slow device) jump straight there instead of drifting.
      const stale = ts - lastTs > 100;
      lastTs = ts;
      cur = Number.isNaN(cur) || stale ? target : cur + (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      else raf = requestAnimationFrame(frame);
      render(cur);
    };
    const onScroll = () => {
      if (raf) return;
      lastTs = performance.now(); // starting from rest is not a gap
      raf = requestAnimationFrame(frame);
    };

    // Jump without easing: used to flick through scenes while skipping.
    const cut = (p: number) => {
      scrollTo({ top: top + p * vh, behavior: "instant" });
      cur = p;
      render(p);
    };
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // In-page links: a neighbouring scene glides in; a far one fast-forwards through the scenes
    // in between (each flashes by for a beat under speed lines), then glides into the destination.
    let skipping = false;
    const onClick = async (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      const to = a ? scenes.findIndex((s) => `#${s.id}` === a.getAttribute("href")) : -1;
      if (to < 0) return;
      e.preventDefault();
      if (skipping) return;
      const from = Math.round((Number.isNaN(cur) ? (scrollY - top) / vh : cur) / SEG);
      const dest = top + to * SEG * vh;
      if (Math.abs(to - from) <= 1) {
        scrollTo({ top: dest, behavior: "smooth" });
        return;
      }

      skipping = true;
      const dir = Math.sign(to - from);
      // Name the destination the way the menu does ("Contact"), falling back to the scene's label.
      const navName = document.querySelector(`header nav a[href="#${scenes[to].id}"]`)?.textContent;
      if (label.current) label.current.textContent = navName || scenes[to].getAttribute("aria-label") || "";
      root.classList.add("skipping");
      await wait(160);
      for (let k = from + dir; k !== to; k += dir) {
        cut(k * SEG);
        await wait(70);
      }
      // Land just short of the destination, then let the camera glide the last stretch.
      cut(to * SEG - dir * MOVE * 0.7);
      root.classList.remove("skipping");
      scrollTo({ top: dest, behavior: "smooth" });
      skipping = false;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    return () => {
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      root.classList.remove("cinema", "skipping");
      film.style.height = "";
      scenes.forEach((el, i) => {
        el.removeAttribute("style");
        el.removeAttribute("data-live");
        el.inert = false;
        planes[i].forEach((pl) => pl.removeAttribute("style"));
      });
    };
  }, []);

  return (
    <div ref={ref} className="film">
      <div className="screen">{children}</div>
      {/* Fast-forward overlay shown while skipping over scenes. */}
      <div aria-hidden className="skip-fx">
        <span className="skip-label">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
            <path d="M3 5l9 7-9 7zM12 5l9 7-9 7z" />
          </svg>
          <span ref={label} />
        </span>
      </div>
    </div>
  );
}

export type Time = "night" | "late" | "predawn" | "dawn";

export function Scene({
  id,
  label,
  ghost,
  set,
  time,
  seed,
  moon,
  children,
  after,
}: {
  id: string;
  label: string;
  ghost?: string;
  set: SetName;
  time: Time;
  seed: number;
  moon?: boolean;
  children: ReactNode;
  after?: ReactNode;
}) {
  return (
    <section id={id} aria-label={label} data-time={time} className="scene">
      <div aria-hidden className="pl pl-back">
        <div className="sky" />
        <svg className="stars" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice">
          {starfield(seed).map((st, i) => (
            <circle key={i} cx={st.x.toFixed(1)} cy={st.y.toFixed(1)} r={st.s.toFixed(2)} />
          ))}
        </svg>
        <div className={`aurora v${seed % 3}`}>
          <i />
          <i />
          <i />
        </div>
        {moon && <div className="moon" />}
        {(time === "night" || time === "late") && (
          <>
            <span className="meteor" style={{ left: `${55 + ((seed * 13) % 35)}%`, animationDelay: `${-((seed * 1.7) % 7)}s` }} />
            <span className="meteor" style={{ left: `${30 + ((seed * 29) % 40)}%`, top: "4%", animationDelay: `${-((seed * 2.9 + 3.5) % 7)}s` }} />
          </>
        )}
        {time === "dawn" && <div className="sunrise" />}
        {ghost && <div className="ghost">{ghost}</div>}
      </div>

      <div aria-hidden className="pl pl-mid">
        <Mid set={set} seed={seed} />
      </div>

      <div aria-hidden className="pl pl-fore">
        <Fore set={set} seed={seed} />
      </div>

      {/* Content sits above the foreground so nothing ever covers the text. */}
      <div className="pl-main">
        <div className="fit container-x">{children}</div>
        {after}
      </div>
    </section>
  );
}
