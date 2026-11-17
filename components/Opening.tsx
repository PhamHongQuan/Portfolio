"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

// html[data-opening] is set by the <head> script (lib/headScript.ts). Without JS it is never set, so
// the opening never shows and the page scrolls as usual.
const MIN_MS = 900; // long enough to read as an intro, not a flash
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
        <Logo className="h-16" priority />
        <span className="opening-bar">
          <i />
        </span>
      </div>
    </div>
  );
}
