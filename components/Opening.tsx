"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

// html[data-opening] is set by the <head> script (lib/headScript.ts). Without JS it is never set, so
// the opening never shows and the page scrolls as usual.
const MIN_MS = 2100; // long enough for the Q to finish drawing (see .opening-logo in globals.css)
const MAX_MS = 8000; // never keep a visitor on a slow network waiting forever

/**
 * Opening title card, shown on first load until the page is actually ready to be scrolled: React
 * has hydrated, the Film engine has taken the page (html.cinema), the fonts are in and the window
 * has loaded. Then it opens like an old film, an iris widening from the centre, and the hero's
 * entrance animation plays as it opens.
 */
export default function Opening() {
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-opening")) return;
    let alive = true;
    // Nothing moves the page until the opening is over: wheel, touch and the scroll keys are held.
    const hold = (e: Event) => {
      if (root.hasAttribute("data-opening")) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    const keys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"]);
    const holdKey = (e: KeyboardEvent) => keys.has(e.key) && hold(e);
    const opts = { capture: true, passive: false };
    addEventListener("wheel", hold, opts);
    addEventListener("touchmove", hold, opts);
    addEventListener("keydown", holdKey, opts);
    const release = () => {
      removeEventListener("wheel", hold, opts);
      removeEventListener("touchmove", hold, opts);
      removeEventListener("keydown", holdKey, opts);
    };
    if (!location.hash && !root.dataset.start) scrollTo(0, 0);
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    const loaded = new Promise<void>((r) => (document.readyState === "complete" ? r() : addEventListener("load", () => r(), { once: true })));
    const engine = new Promise<void>((r) => {
      const check = () => (root.classList.contains("cinema") ? r() : timers.push(window.setTimeout(check, 50)));
      check();
    });

    Promise.race([Promise.all([loaded, document.fonts.ready, engine, wait(MIN_MS)]), wait(MAX_MS)]).then(() => {
      if (!alive) return;
      // Two frames so the first scene is painted before it is revealed.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!alive) return;
          root.removeAttribute("data-opening");
          release();
          setLeaving(true);
          timers.push(window.setTimeout(() => setDone(true), 1300));
        }),
      );
    });
    return () => {
      alive = false;
      release();
      timers.forEach(clearTimeout);
    };
  }, []);

  if (done) return null;
  return (
    <div aria-hidden className="opening" data-leaving={leaving ? "" : undefined}>
      <div className="opening-inner">
        {/* The Q is traced line by line (ring, inner ring, swoosh, tail), then the real logo fills in. */}
        <div className="opening-logo">
          <svg viewBox="0 0 335 256" aria-hidden>
            <ellipse pathLength={1} cx="141" cy="128" rx="124" ry="136" transform="rotate(-90 141 128)" />
            <ellipse pathLength={1} cx="142" cy="110" rx="83" ry="63" transform="rotate(180 142 110)" />
            <path pathLength={1} d="M4 244 Q2 126 334 47 Q2 172 4 244 Z" />
            <path pathLength={1} d="M122 170 L186 170 L260 256 L196 256 Z" />
          </svg>
          <Logo className="h-20" priority />
        </div>
        <span className="opening-bar">
          <i />
        </span>
      </div>
    </div>
  );
}
