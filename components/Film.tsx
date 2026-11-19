"use client";

import { ReactNode, useEffect, useRef, useSyncExternalStore } from "react";
import { Fore, Mid, starfield } from "./Landscape";
import { useLanguage } from "@/contexts/LanguageContext";
import { lookFor, sceneLayers, type Look } from "@/lib/content";

// Scroll distance per scene, in screen heights: it holds still for HOLD, then the camera travels for MOVE.
// No hold (the first pixel of scroll already moves the camera); a long MOVE keeps transitions unhurried.
const HOLD = 0;
const MOVE = 1.3;
const SEG = HOLD + MOVE;
// How far the camera trails the scroll, in ms (exponential, never overshoots). 0 = locked to the
// scroll (felt jumpy); the old 140 felt springy. Tune here.
const LAG = 90;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
// Smootherstep: starts and ends with zero speed and zero acceleration, so a transition begins softly
// on the first notch and comes to rest by itself near each scene.
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

// ---- Which scenes have their landscape drawn. Only the opening one ships in the HTML; the rest are
// drawn one at a time when the browser is idle (or at once, when the visitor gets near them).
const drawn = new Set<string>(["top"]);
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const draw = (id: string) => {
  if (drawn.has(id)) return;
  drawn.add(id);
  listeners.forEach((l) => l());
};
const useDrawn = (id: string) =>
  useSyncExternalStore(
    subscribe,
    () => drawn.has(id),
    () => id === "top",
  );

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/**
 * Pins one screen and plays the page as a sequence of scenes. Scrolling pushes the camera through the
 * current scene and out of it, while the next one comes in from the distance (multiplane, like a film).
 * It writes transform and opacity straight onto each scene's planes; ambient motion lives in globals.css.
 * Without JS, the scenes simply stack as normal full-height sections. It plays the same everywhere,
 * whatever the OS reduced-motion setting says (Windows turns it on when "Animation effects" is off).
 */
export default function Film({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLSpanElement>(null);
  const snaps = useRef<HTMLDivElement>(null);

  // Quality: weak devices (or a measured low frame rate) get the light version: same scenes and
  // camera, fewer ambient effects. `?quality=low|high` forces either one.
  useEffect(() => {
    const root = document.documentElement;
    const forced = new URLSearchParams(location.search).get("quality");
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem("quality");
    } catch {}
    const nav = navigator as Nav;
    const weak = (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2 || !!nav.connection?.saveData;
    const q = forced === "low" || forced === "high" ? forced : (saved ?? (weak ? "low" : "high"));
    root.dataset.quality = q;
    if (q === "low" || forced) return;

    let raf = 0;
    let timer = 0;
    let done = false;
    const sample = () => {
      if (done || document.hidden) return; // visibilitychange will call again
      const ts: number[] = [];
      const step = (t: number) => {
        if (done) return;
        if (document.hidden) return; // abandoned; a hidden tab says nothing about speed
        ts.push(t);
        if (ts.length < 90) {
          raf = requestAnimationFrame(step);
          return;
        }
        // Gaps over 100 ms are the browser throttling a covered/background window, not a slow
        // device: ignore them, and if too few real frames are left, try again later.
        const gaps = ts.slice(1).map((x, i) => x - ts[i]).filter((g) => g < 100).sort((a, b) => a - b);
        if (gaps.length < 60) {
          timer = window.setTimeout(sample, 4000);
          return;
        }
        done = true;
        if (gaps[gaps.length >> 1] > 26) {
          // Under ~38 fps while the opening scene plays: switch to the light version for this visit.
          root.dataset.quality = "low";
          try {
            sessionStorage.setItem("quality", "low");
          } catch {}
        }
      };
      raf = requestAnimationFrame(step);
    };
    const onVisible = () => !document.hidden && sample();
    timer = window.setTimeout(sample, 2500); // after the page-load animation settles
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      done = true;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Parallax: the planes of the scene on screen shift against each other with the pointer (or a
  // phone's tilt), nearer planes more, like looking through a window. Uses the `translate`
  // property so it composes with the camera's `transform: scale()`; eased, and idle when still.
  useEffect(() => {
    const root = document.documentElement;
    const depth: [string, number][] = [
      [".pl-back", 0.15],
      [".pl-mid", 0.45],
      [".pl-fore", 1],
      [".pl-main", -0.12],
    ];
    const MAX = 22; // px at depth 1
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (root.dataset.quality === "low" || root.classList.contains("skipping")) tx = ty = 0;
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      const settled = Math.abs(tx - x) < 0.002 && Math.abs(ty - y) < 0.002;
      if (settled) {
        x = tx;
        y = ty;
      }
      document.querySelectorAll<HTMLElement>(".scene[data-live]").forEach((sc) => {
        for (const [sel, d] of depth) {
          const el = sc.querySelector<HTMLElement>(`:scope > ${sel}`);
          if (el) el.style.translate = `${(x * MAX * d).toFixed(1)}px ${(y * MAX * 0.6 * d).toFixed(1)}px`;
        }
      });
      if (!settled) raf = requestAnimationFrame(tick);
    };
    const aim = (nx: number, ny: number) => {
      tx = Math.max(-1, Math.min(1, nx));
      ty = Math.max(-1, Math.min(1, ny));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse") aim(-(e.clientX / innerWidth - 0.5) * 2, -(e.clientY / innerHeight - 0.5) * 2);
    };
    // Tilt only where it needs no permission prompt (iOS asks; we don't interrupt for decoration).
    type DOE = typeof DeviceOrientationEvent & { requestPermission?: unknown };
    const tiltOk = typeof DeviceOrientationEvent !== "undefined" && !(DeviceOrientationEvent as DOE).requestPermission;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      aim(-e.gamma / 25, -(e.beta - 45) / 25);
    };
    addEventListener("pointermove", onPointer, { passive: true });
    if (tiltOk) addEventListener("deviceorientation", onTilt, { passive: true });
    return () => {
      removeEventListener("pointermove", onPointer);
      removeEventListener("deviceorientation", onTilt);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const film = ref.current;
    if (!film) return;
    let scenes = [...film.querySelectorAll<HTMLElement>(".scene")];

    // Draw the remaining landscapes in scroll order, one per idle slot.
    let idle = 0;
    const queue = scenes.map((s) => s.id).filter((id) => !drawn.has(id));
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 120));
    const cic = window.cancelIdleCallback ?? clearTimeout;
    const drawNext = () => {
      const id = queue.shift();
      if (!id) return;
      draw(id);
      idle = ric(drawNext, { timeout: 1500 });
    };
    idle = ric(drawNext, { timeout: 1500 });

    const root = document.documentElement;
    let n = scenes.length;
    root.classList.add("cinema");

    let vh = innerHeight;
    let top = 0;
    let cur = NaN; // smoothed camera position, in screen heights
    let alive = true;
    let last: { enter: number; leave: number; state: string }[] = [];
    let planes: HTMLElement[][] = [];
    // (Re)read the scenes. React can replace a scene element (e.g. a remount), and a scene the
    // engine doesn't know about would sit on screen unmanaged.
    const collect = () => {
      scenes = [...film.querySelectorAll<HTMLElement>(".scene")];
      n = scenes.length;
      last = scenes.map(() => ({ enter: -1, leave: -1, state: "" }));
      planes = scenes.map((el) =>
        [".pl-back", ".pl-mid", ".pl-fore", ".pl-main"].map((c) => el.querySelector<HTMLElement>(`:scope > ${c}`)!),
      );
      if (track.current) track.current.replaceChildren(...scenes.map(() => document.createElement("i")));
    };
    collect();
    // Light up the chapter the skip is passing through.
    const mark = (i: number) => track.current?.querySelectorAll("i").forEach((d, j) => d.toggleAttribute("data-on", j === i));

    const measure = () => {
      vh = innerHeight;
      film.style.height = `${((n - 1) * SEG + HOLD) * vh + vh}px`;
      top = film.getBoundingClientRect().top + scrollY;
      // Native scroll-snap points, one per scene: the browser settles on a scene when the gesture
      // ends (no JS easing, so nothing lags or springs back).
      snaps.current?.replaceChildren(
        ...scenes.map((_, i) => Object.assign(document.createElement("i"), { style: `top:${i * SEG * vh}px` })),
      );
      // Shrink any scene whose content is taller than the screen, so nothing is ever cut off.
      film.querySelectorAll<HTMLElement>(".fit").forEach((f) => {
        f.style.setProperty("--fit", "1");
        f.style.setProperty("--fit", String(Math.min(1, (vh - 96 - Math.max(40, vh * 0.09)) / f.scrollHeight)));
      });
      cur = NaN;
      frame();
    };

    const render = (p: number) => {
      const light = root.dataset.quality === "low";
      scenes.forEach((el, i) => {
        const v = p - i * SEG;
        const enter = i === 0 ? 0 : ease(clamp(-v / MOVE));
        const leave = i === n - 1 ? 0 : ease(clamp((v - HOLD) / MOVE));
        const shown = enter < 1 && leave < 1;
        // The neighbour about to come in is painted ahead of time (invisible), so its first frame
        // is ready when the camera starts moving. Skipped in the light version to save memory.
        const warm = !shown && !light && v > -SEG - 0.1 && v < SEG + 0.1;
        const state = shown ? "live" : warm ? "warm" : "off";
        if (shown || warm) draw(el.id);
        const prev = last[i];
        if (prev.state === state && Math.abs(prev.enter - enter) < 1e-4 && Math.abs(prev.leave - leave) < 1e-4) return;
        prev.enter = enter;
        prev.leave = leave;
        prev.state = state;
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
        el.style.opacity = shown ? Math.min(1, Math.max(0, 1 - enter * 1.05 - Math.max(0, leave - 0.3) * 1.7)).toFixed(3) : "0";
        el.style.visibility = state === "off" ? "hidden" : "";
        el.style.zIndex = String(n - i);
        el.toggleAttribute("data-live", shown);
        el.toggleAttribute("data-warm", warm);
        el.inert = !(enter < 0.5 && leave < 0.5);
      });
      // The scene the camera is nearest to, for the header menu (read via the "scene" event).
      const id = scenes[Math.min(n - 1, Math.max(0, Math.round(p / SEG)))]?.id;
      if (id && root.dataset.scene !== id) {
        root.dataset.scene = id;
        dispatchEvent(new Event("scene"));
      }
    };

    // The camera follows the scroll position directly: no easing, so it never lags or springs.
    let raf = 0;
    let lastTs = 0;
    const frame = (ts = performance.now()) => {
      raf = 0;
      const target = (scrollY - top) / vh;
      const dt = ts - lastTs;
      lastTs = ts;
      // Time-based, so 60 Hz and 120 Hz glide alike; after a long gap (background tab) jump there.
      cur = Number.isNaN(cur) || dt > 100 ? target : cur + (target - cur) * (1 - Math.exp(-dt / LAG));
      if (Math.abs(target - cur) < 0.0005) {
        cur = target;
        syncHash();
      } else raf = requestAnimationFrame(frame);
      render(cur);
    };

    // Deep links: the address follows the scene you rest on (?s=work-2, which shares with that
    // scene's preview image), without adding history entries; opening such a link starts there.
    const syncHash = () => {
      if (skipping) return;
      const i = Math.round(cur / SEG);
      if (i < 0 || i >= n || Math.abs(cur - i * SEG) > 0.02) return;
      const url = new URL(location.href);
      url.hash = "";
      if (i === 0) url.searchParams.delete("s");
      else url.searchParams.set("s", scenes[i].id);
      if (url.href !== location.href) history.replaceState(history.state, "", url);
    };
    let skipping = false;
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
    // While skipping, each new scene is pulled into the frame like film through a projector gate.
    const screen = film.querySelector<HTMLElement>(".screen")!;
    const kick = (dir: number) =>
      screen.animate([{ translate: `0 ${dir * 9}%`, filter: "brightness(1.25)" }, { translate: "0 0", filter: "none" }], {
        duration: 90,
        easing: "cubic-bezier(.2,.8,.2,1)",
      });
    const timers = new Set<number>();
    const wait = (ms: number) =>
      new Promise<void>((r) => {
        const t = window.setTimeout(() => {
          timers.delete(t);
          r();
        }, ms);
        timers.add(t);
      });

    // In-page links: a neighbouring scene glides in; a far one fast-forwards like a film reel:
    // letterbox bars close in, the scenes in between flash by while a chapter marker runs along
    // the track, then the camera glides into the destination.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      const to = a ? scenes.findIndex((s) => `#${s.id}` === a.getAttribute("href")) : -1;
      if (to < 0) return;
      e.preventDefault();
      goTo(to);
    };
    const goTo = async (to: number) => {
      if (skipping || to < 0 || to >= n) return;
      const from = Math.round((Number.isNaN(cur) ? (scrollY - top) / vh : cur) / SEG);
      const dest = top + to * SEG * vh;
      if (Math.abs(to - from) <= 1) {
        scrollTo({ top: dest, behavior: "smooth" });
        return;
      }

      skipping = true;
      root.style.scrollSnapType = "none"; // the reel stops between scenes; snapping would yank it
      const dir = Math.sign(to - from);
      mark(from);
      // Name the destination the way the menu does ("Contact"), falling back to the scene's label.
      const navName = document.querySelector(`header nav a[href="#${scenes[to].id}"]`)?.textContent;
      if (label.current) label.current.textContent = navName || scenes[to].getAttribute("aria-label") || "";
      root.classList.add("skipping");
      await wait(380); // the frame shrinks into the reel
      for (let k = from + dir; k !== to && alive; k += dir) {
        cut(k * SEG);
        mark(k);
        kick(dir);
        await wait(90);
      }
      if (!alive) return; // unmounted mid-skip: leave the page alone
      // Land just short of the destination, then let the camera glide the last stretch.
      cut(to * SEG - dir * MOVE * 0.7);
      mark(to);
      kick(dir);
      await wait(220);
      if (!alive) return;
      root.classList.remove("skipping"); // the frame grows back to full screen as the camera glides in
      scrollTo({ top: dest, behavior: "smooth" });
      skipping = false;
      await wait(900); // ponytail: fixed wait for the glide; scrollend once Safari has it everywhere
      root.style.scrollSnapType = "";
    };

    // Keyboard: ↓ / PageDown / Space next scene, ↑ / PageUp / Shift+Space previous, Home / End.
    // Outside the film (the footer) the keys scroll the page as usual.
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable]")) return;
      const here = Number.isNaN(cur) ? (scrollY - top) / vh : cur;
      if (here > (n - 1) * SEG + 0.05) return;
      const i = Math.round(here / SEG);
      const step =
        e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)
          ? 1
          : e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)
            ? -1
            : 0;
      const to = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : step ? i + step : -1;
      if (to < 0 || to >= n || to === i) return;
      e.preventDefault();
      goTo(to);
    };
    // Back / Forward and hand-typed hashes.
    const onHash = () => {
      const to = scenes.findIndex((s) => `#${s.id}` === location.hash);
      goTo(to < 0 ? 0 : to);
    };

    // Opened on a deep link: start right on that scene. Read the hash before the first measure(),
    // whose first frame syncs the address to the scene on screen (the top) and would clear it.
    // The <head> script parks the hash in data-start (lib/headScript.ts). Left in place: a remount
    // (React's development double-run, for one) must find it again.
    const startHash = location.hash || root.dataset.start || "";
    const start = scenes.findIndex((s) => `#${s.id}` === startHash);
    measure();
    if (start > 0) cut(start * SEG);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    const mo = new MutationObserver(() => {
      collect();
      measure();
    });
    mo.observe(film.querySelector(".screen")!, { childList: true });
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    addEventListener("keydown", onKey);
    addEventListener("hashchange", onHash);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("hashchange", onHash);
      alive = false;
      cic(idle);
      timers.forEach(clearTimeout);
      ro.disconnect();
      mo.disconnect();
      removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      root.classList.remove("cinema", "skipping");
      root.style.scrollSnapType = "";
      film.style.height = "";
      scenes.forEach((el, i) => {
        el.removeAttribute("style");
        el.removeAttribute("data-live");
        el.removeAttribute("data-warm");
        el.inert = false;
        planes[i].forEach((pl) => pl.removeAttribute("style"));
      });
    };
  }, []);

  return (
    <div ref={ref} className="film">
      <div className="screen">{children}</div>
      <div ref={snaps} aria-hidden className="snaps" />
      {/* Fast-forward overlay: film reels either side of the shrunken frame and a caption with the
          chapter track underneath, shown while skipping scenes. */}
      <div aria-hidden className="skip-fx">
        <div className="reel left">
          <i />
        </div>
        <div className="reel right">
          <i />
        </div>
        <div className="skip-bar">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
            <path d="M3 5l9 7-9 7zM12 5l9 7-9 7z" />
          </svg>
          <span ref={label} className="skip-name" />
          <span ref={track} className="skip-dots" />
        </div>
      </div>
    </div>
  );
}

export type Time = Look["time"];

export function Scene({
  id,
  label,
  fallback,
  clock,
  children,
  after,
}: {
  id: string;
  label: string;
  /** Default background when none is saved; fixed scenes find theirs in lib/content.ts by id. */
  fallback?: Look;
  /** Sky follows the visitor's real clock (html[data-clock], lib/clock.ts) instead of `time`. */
  clock?: boolean;
  children: ReactNode;
  after?: ReactNode;
}) {
  const { scenery } = useLanguage();
  const look = lookFor(scenery, fallback?.id ?? id, fallback);
  const { set, time, seed } = look;
  const { moon, palette, wind } = look;
  const hide = sceneLayers.filter((k) => !look[k]).map((k) => `no-${k}`).join(" ");
  const ready = useDrawn(id);

  return (
    <section id={id} aria-label={label} data-time={time} data-palette={palette} data-wind={wind} data-clock={clock ? "" : undefined} className={`scene ${hide}`}>
      <div aria-hidden className="pl pl-back">
        <div className="sky" />
        {ready && (
          <svg className="stars" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice">
            {starfield(seed).map((st, i) => (
              <circle key={i} cx={Math.round(st.x)} cy={Math.round(st.y)} r={st.s.toFixed(1)} />
            ))}
          </svg>
        )}
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
        {time === "dawn" ? <div className="sunrise" /> : clock && <div className="sunrise clock-sun" />}
      </div>

      <div aria-hidden className="pl pl-mid">
        {ready && <Mid set={set} seed={seed} />}
      </div>

      <div aria-hidden className="pl pl-fore">
        {ready && <Fore set={set} seed={seed} />}
      </div>

      {/* Content sits above the foreground so nothing ever covers the text. */}
      <div className="pl-main">
        <div className="fit container-x">{children}</div>
        {after}
      </div>
    </section>
  );
}
