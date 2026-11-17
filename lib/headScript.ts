import { clockFor } from "./clock";

/**
 * Runs in <head> before the first paint. A plain module (not "use client"), so the root layout, a
 * server component, gets the actual string.
 * - Theme: the saved one, so it never flashes.
 * - Clock: the opening sky matches the visitor's time of day (lib/clock.ts).
 * - Opening: marks the first load; Opening.tsx shows the title card and locks scrolling until the
 *   page is ready. Without JS none of this runs, so the page simply scrolls.
 */
export const headScript = [
  `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="dark";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`,
  `try{var d=new Date();document.documentElement.dataset.clock=(${clockFor.toString()})(document.documentElement.dataset.theme,d.getHours()+d.getMinutes()/60,location.search)}catch(e){}`,
  `document.documentElement.setAttribute("data-opening","")`,
  // Every load (F5 included) starts from the opening: no restoring the old scroll position. A deep
  // link (#work-2) still lands on its scene; Film.tsx handles that.
  `try{history.scrollRestoration="manual"}catch(e){}`,
  // A deep link (#work-2): take the hash off before the browser smooth-scrolls to that element by
  // itself, which would fight Film.tsx's own jump to the scene. Film reads it from data-start.
  `if(location.hash){document.documentElement.dataset.start=location.hash;history.replaceState(history.state,"",location.pathname+location.search)}`,
].join(";");
