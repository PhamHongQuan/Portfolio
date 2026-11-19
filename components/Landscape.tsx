import { CSSProperties, ReactNode, memo, useId } from "react";
import type { Look } from "@/lib/content";

// Landscape sets for the film. Each scene is a different place on one journey, from a far
// panorama in at night to a sunrise close up. Everything is drawn from seeded generators, so
// server and client render identical SVG. Colours come from CSS variables (theme + time of day).

export type SetName = Look["set"];

const rng = (seed: number) => {
  let s = (seed * 7919 + 104729) % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
};
const f = (n: number) => n.toFixed(1);
const rd = (n: number) => Math.round(n); // path coordinates: whole units are plenty in a 1000-wide box

// Jagged mountain range in a 1000×300 box; `valley` < 1 keeps the middle lower.
const range = (seed: number, n: number, lo: number, hi: number, valley = 0.5) => {
  const r = rng(seed);
  let d = "M0 300";
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 1000;
    const edge = valley + (1 - valley) * (Math.abs(x - 500) / 500);
    d += ` L${rd(x)} ${rd(300 - (i % 2 ? hi * (0.7 + r() * 0.3) : lo * (0.6 + r() * 0.4)) * edge)}`;
  }
  return d + " L1000 300 Z";
};

// Smooth rolling ridge in a 1000×300 box, plus a height lookup to stand trees on it.
const rolling = (seed: number, lo: number, hi: number, valley = 0.5) => {
  const r = rng(seed + 11);
  const pts = Array.from({ length: 7 }, (_, i) => {
    const x = (i / 6) * 1000;
    const edge = valley + (1 - valley) * (Math.abs(x - 500) / 500);
    return [x, 300 - (lo + r() * (hi - lo)) * edge] as const;
  });
  let d = `M0 300 L0 ${rd(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    d += ` C${rd(px + 80)} ${rd(py)} ${rd(x - 80)} ${rd(y)} ${rd(x)} ${rd(y)}`;
  }
  const yAt = (x: number) => {
    const i = Math.min(5, Math.floor(x / (1000 / 6)));
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const t = (x - x0) / (x1 - x0);
    return y0 + (y1 - y0) * (t * t * (3 - 2 * t));
  };
  return { d: d + " L1000 300 Z", yAt };
};

const pine = (x: number, base: number, h: number) => {
  const w = h * 0.34;
  const tiers = 5;
  const top = base - h;
  const y = (t: number) => top + (h * 0.88 * t) / tiers;
  let d = ` M${rd(x)} ${rd(top)}`;
  for (let t = 1; t <= tiers; t++) d += ` L${rd(x + (w * t) / tiers)} ${rd(y(t))} L${rd(x + (w * t * 0.5) / tiers)} ${rd(y(t))}`;
  d += ` L${rd(x + w * 0.07)} ${rd(base)} L${rd(x - w * 0.07)} ${rd(base)}`;
  for (let t = tiers; t >= 1; t--) d += ` L${rd(x - (w * t * 0.5) / tiers)} ${rd(y(t))} L${rd(x - (w * t) / tiers)} ${rd(y(t))}`;
  return d + " Z";
};

// Pines standing along a ridge, keeping a clear gap in the middle for the content.
const pinesOn = (yAt: (x: number) => number, seed: number, count: number, lo: number, hi: number, gap = 140) => {
  const r = rng(seed + 29);
  let d = "";
  for (let k = 0; k < count; k++) {
    const x = r() * 1000;
    if (Math.abs(x - 500) < gap) continue;
    d += pine(x, yAt(x) + 4, lo + r() * (hi - lo));
  }
  return d;
};

// Tall pines framing one side (400×400 box, mirrored for the right).
const grove = (seed: number, count: number, lo: number, hi: number) => {
  const r = rng(seed + 23);
  let d = "";
  for (let k = 0; k < count; k++) d += pine(-30 + k * (300 / count) + r() * 30, 404, lo + r() * (hi - lo) - k * 14);
  return d;
};

// Grass or reeds in a 1000×100 box, optionally only inside some x bands.
const blades = (seed: number, count: number, lo: number, hi: number, bands: [number, number][] = [[0, 1000]]) => {
  const r = rng(seed + 37);
  let d = "";
  for (let k = 0; k < count; k++) {
    const [a, b] = bands[k % bands.length];
    const x = a + r() * (b - a);
    const h = lo + r() * (hi - lo);
    const bend = (r() - 0.5) * 26;
    d += ` M${rd(x - 2.2)} 100 Q${rd(x + bend * 0.3)} ${rd(100 - h * 0.6)} ${rd(x + bend)} ${rd(100 - h)} Q${rd(x + bend * 0.2 + 1)} ${rd(100 - h * 0.5)} ${rd(x + 2.2)} 100 Z`;
  }
  return d;
};

// Broadleaf tree: a trunk and a crown of overlapping circles. The crown sits high enough
// that about a third of the trunk shows below it.
const broadleaf = (seed: number, x: number, base: number, h: number) => {
  const r = rng(seed + 43);
  const crownY = base - h * 0.7;
  const R = h * 0.24;
  const crown = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2;
    return { cx: x + Math.cos(a) * R * (0.7 + r() * 0.4), cy: crownY + Math.sin(a) * R * 0.6 * (0.7 + r() * 0.4), r: R * (0.55 + r() * 0.3) };
  });
  crown.push({ cx: x, cy: crownY - R * 0.2, r: R * 0.9 });
  const tw = h * 0.05;
  const trunk = `M${rd(x - tw)} ${rd(base)} L${rd(x - tw * 0.5)} ${rd(crownY)} L${rd(x + tw * 0.5)} ${rd(crownY)} L${rd(x + tw)} ${rd(base)} Z`;
  return { trunk, crown };
};

export const starfield = (seed: number) => {
  const r = rng(seed + 71);
  return Array.from({ length: 110 }, () => ({ x: r() * 1000, y: r() * 400, s: 0.5 + r() * r() * 1.6 }));
};

// ---- small drawing helpers ----
const Land = ({ d, style, fill, box = "0 0 1000 300", extra }: { d: string; style: CSSProperties; fill: string; box?: string; extra?: string }) => (
  <svg viewBox={box} preserveAspectRatio="none" className="land" style={{ ...style, fill }}>
    <path d={d} />
    {extra && <path d={extra} style={{ fill: "var(--tree)" }} />}
  </svg>
);
const Tree = ({ t, style, fill = "var(--tree)", sway }: { t: ReturnType<typeof broadleaf>; style: CSSProperties; fill?: string; sway?: boolean }) => (
  <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMax meet" className="land" style={{ ...style, fill }}>
    <path d={t.trunk} />
    {/* Only the crown moves in the wind; the trunk stays planted. */}
    <g className={sway ? "sway" : undefined}>
      {t.crown.map((c, i) => (
        <circle key={i} cx={rd(c.cx)} cy={rd(c.cy)} r={rd(c.r)} />
      ))}
    </g>
  </svg>
);
const Grove = ({ seed, side, height, count = 6, lo = 170, hi = 400 }: { seed: number; side: "left" | "right"; height: string; count?: number; lo?: number; hi?: number }) => (
  <svg
    viewBox="0 0 400 400"
    preserveAspectRatio="xMinYMax meet"
    className="grove"
    // --lean flips the bend back on the mirrored side so both groves lean with the same wind.
    style={{ height, width: `calc(${height} * 0.75)`, [side]: "-3%", ...(side === "right" && { transform: "scaleX(-1)", "--lean": -1 }) } as CSSProperties}
  >
    <path className="sway" d={grove(seed + (side === "right" ? 5 : 0), count, lo, hi)} />
  </svg>
);
// Grass in three layers that each catch the wind on their own beat, so the meadow ripples.
const Grass = ({ b: [seed, count, lo, hi, bands], height, extra }: { b: Parameters<typeof blades>; height: string; extra?: ReactNode }) => (
  <>
    {[0, 1, 2].map((j) => (
      <svg key={j} viewBox="0 0 1000 100" preserveAspectRatio="none" className={`meadow wind${j}`} style={{ height }}>
        <path d={blades(seed + j * 13, Math.ceil((count * 0.7) / 3), lo * (1 - j * 0.1), hi * (1 - j * 0.06), bands)} />
        {j === 2 && extra}
      </svg>
    ))}
  </>
);

// Leaves and seeds carried across the screen by the wind.
const Drifters = ({ seed, count }: { seed: number; count: number }) => {
  const r = rng(seed + 83);
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="drift"
          style={{ top: `${f(25 + r() * 60)}%`, animationDuration: `${f(6 + r() * 6)}s`, animationDelay: `${f(-r() * 12)}s` }}
        >
          <i style={{ animationDuration: `${f(0.9 + r() * 1.2)}s`, scale: f(0.7 + r() * 1.1) }} />
        </span>
      ))}
    </>
  );
};
const mix = (pct: number) => `color-mix(in oklab, var(--mtn-far) ${100 - pct}%, var(--tree))`;

// Middle planes: the place itself.
export const Mid = memo(function Mid({ set, seed }: { set: SetName; seed: number }) {
  const id = useId().replace(/:/g, "");
  const water = (
    <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style={{ stopColor: "var(--water-top)" }} />
      <stop offset="1" style={{ stopColor: "var(--water-bottom)" }} />
    </linearGradient>
  );

  switch (set) {
    case "panorama": {
      const low = rolling(seed, 30, 80, 0.4);
      return (
        <>
          <Land d={range(seed, 22, 50, 130, 0.7)} fill="var(--mtn-far)" style={{ bottom: "37.8%", height: "15%", opacity: 0.75 }} />
          <Land d={range(seed + 1, 14, 60, 190, 0.5)} fill="var(--mtn)" style={{ bottom: "37.8%", height: "21%" }} />
          <div className="mist" style={{ top: "57%" }} />
          <Land d={low.d} extra={pinesOn(low.yAt, seed, 60, 8, 18, 60)} fill="var(--hill)" style={{ bottom: 0, height: "40%" }} />
        </>
      );
    }
    case "lake": {
      const m = range(seed, 12, 70, 230, 0.4);
      return (
        <>
          <Land d={m} fill="var(--mtn)" style={{ bottom: "37%", height: "30%" }} />
          <div className="lake">
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="land reflection" style={{ top: 0, height: "81%", fill: "var(--mtn)" }}>
              <path d={m} />
            </svg>
            <div className="lake-glow" />
            <div className="shimmer" />
          </div>
          <div className="mist" style={{ top: "56%" }} />
        </>
      );
    }
    case "forest": {
      const far = rolling(seed, 120, 210, 0.55);
      const near = rolling(seed + 3, 70, 150, 0.4);
      return (
        <>
          <Land d={range(seed, 14, 50, 160, 0.6)} fill="var(--mtn-far)" style={{ bottom: "37.8%", height: "20%" }} />
          <Land d={far.d} extra={pinesOn(far.yAt, seed, 70, 18, 34, 120)} fill="var(--mtn)" style={{ bottom: "16%", height: "30%" }} />
          <div className="mist" style={{ top: "62%" }} />
          <Land d={near.d} extra={pinesOn(near.yAt, seed + 1, 34, 36, 70, 170)} fill="var(--hill)" style={{ bottom: 0, height: "30%" }} />
        </>
      );
    }
    case "deep": {
      const row = (s: number, n: number, lo: number, hi: number, gap: number) => {
        const r = rng(s);
        let d = "";
        for (let k = 0; k < n; k++) {
          const x = r() * 1000;
          if (Math.abs(x - 500) > gap) d += pine(x, 300, lo + r() * (hi - lo));
        }
        return d + " M0 300 L0 296 L1000 296 L1000 300 Z";
      };
      return (
        <>
          <div className="rays">
            <i />
            <i />
            <i />
            <i />
          </div>
          <Land d={row(seed, 40, 140, 240, 110)} fill="var(--mtn)" style={{ bottom: "26%", height: "48%" }} />
          <div className="mist" style={{ top: "64%" }} />
          <Land d={row(seed + 9, 22, 200, 290, 220)} fill="var(--hill)" style={{ bottom: 0, height: "72%" }} />
        </>
      );
    }
    case "river": {
      const banks = rolling(seed, 80, 170, 0.12);
      const r = rng(seed + 61);
      const phase = r() * 6;
      const left: string[] = [];
      const right: string[] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const y = t * 380;
        const cx = 500 + Math.sin(t * 5 + phase) * 160 * t;
        const hw = 5 + t * t * 300;
        left.push(`${rd(cx - hw)} ${rd(y)}`);
        right.unshift(`${rd(cx + hw)} ${rd(y)}`);
      }
      return (
        <>
          <Land d={range(seed, 16, 60, 180, 0.55)} fill="var(--mtn-far)" style={{ bottom: "37.8%", height: "22%" }} />
          <Land d={banks.d} extra={pinesOn(banks.yAt, seed, 44, 18, 44, 210)} fill="var(--hill)" style={{ bottom: 0, height: "44%" }} />
          <svg viewBox="0 0 1000 380" preserveAspectRatio="none" className="land" style={{ bottom: 0, height: "38%" }}>
            <defs>{water}</defs>
            <path d={`M${left.join(" L")} L${right.join(" L")} Z`} fill={`url(#${id}w)`} />
          </svg>
          <div className="mist" style={{ top: "57%" }} />
        </>
      );
    }
    case "meadow": {
      const far = rolling(seed, 110, 190, 0.6);
      const near = rolling(seed + 3, 50, 120, 0.5);
      return (
        <>
          <Land d={range(seed, 16, 40, 110, 0.6)} fill="var(--mtn-far)" style={{ bottom: "37.8%", height: "14%" }} />
          <Land d={far.d} fill="var(--mtn)" style={{ bottom: "18%", height: "28%" }} />
          <Tree t={broadleaf(seed, 790, 600, 170)} style={{ bottom: "34%", height: "20%" }} fill="var(--mtn)" />
          <div className="mist" style={{ top: "63%" }} />
          <Land d={near.d} fill="var(--hill)" style={{ bottom: 0, height: "30%" }} />
        </>
      );
    }
    case "lone": {
      const cliff = "M520 600 L560 470 L600 420 L640 352 L700 330 L800 318 L900 300 L1000 296 L1000 600 Z";
      return (
        <>
          <Land d={range(seed, 18, 40, 120, 0.7)} fill="var(--mtn-far)" style={{ bottom: "37.8%", height: "16%", opacity: 0.8 }} />
          <div className="mist" style={{ top: "56%" }} />
          <Land d={rolling(seed, 40, 90, 0.6).d} fill="var(--mtn)" style={{ bottom: 0, height: "36%" }} />
          <svg viewBox="0 0 1000 600" preserveAspectRatio="xMaxYMax slice" className="land" style={{ bottom: 0, height: "62%", fill: "var(--hill)" }}>
            <path d={cliff} />
          </svg>
          <Tree t={broadleaf(seed, 820, 600, 420)} style={{ bottom: "32%", height: "42%", right: "-4%", left: "auto", width: "62%" }} sway />
        </>
      );
    }
    case "valleys":
      return (
        <>
          {[0, 1, 2, 3, 4].map((j) => {
            const ridge = rolling(seed + j * 7, 120, 230, 0.55);
            return (
              <div key={j}>
                <Land
                  d={ridge.d}
                  extra={j >= 2 ? pinesOn(ridge.yAt, seed + j, 30 + j * 6, 10 + j * 6, 20 + j * 10, 130 + j * 20) : undefined}
                  fill={mix(j * 25)}
                  style={{ bottom: `${30 - j * 8}%`, height: "30%" }}
                />
                <div className="mist" style={{ top: `${50 + j * 8}%`, height: "10%" }} />
              </div>
            );
          })}
        </>
      );
    case "sunrise": {
      const h = rolling(seed, 120, 230, 0.5);
      return (
        <>
          <Land d={range(seed, 12, 70, 220, 0.45)} fill="var(--mtn)" style={{ bottom: "37.8%", height: "30%" }} />
          <div className="mist" style={{ top: "55%" }} />
          <Land d={h.d} extra={pinesOn(h.yAt, seed, 26, 24, 58, 140)} fill="var(--hill)" style={{ bottom: 0, height: "44%" }} />
        </>
      );
    }
  }
});

// Foreground: what is right in front of the camera. It grows nearer as the journey goes on.
export const Fore = memo(function Fore({ set, seed }: { set: SetName; seed: number }) {
  const r = rng(seed + 51);
  const count = { panorama: 9, lake: 10, forest: 14, deep: 24, river: 10, meadow: 16, lone: 10, valleys: 11, sunrise: 6 }[set];
  const flies = Array.from({ length: count }, (_, i) => (
    <span
      key={i}
      className={`firefly ${i >= 6 ? "extra" : ""}`}
      style={{ left: `${f(5 + r() * 90)}%`, top: `${f(40 + r() * 50)}%`, animationDelay: `${f(r() * -12)}s` }}
    >
      <i style={{ animationDelay: `${f(r() * -3)}s`, animationDuration: `${f(1.8 + r() * 2.4)}s` }} />
    </span>
  ));
  const drift = { panorama: 9, lake: 12, forest: 16, deep: 10, river: 14, meadow: 24, lone: 18, valleys: 16, sunrise: 12 }[set];

  const parts = {
    panorama: <Grass b={[seed, 160, 20, 50]} height="5vh" />,
    lake: (
      <>
        <Grass b={[seed, 140, 60, 98, [[0, 230], [770, 1000]]]} height="16vh" />
        <Grove seed={seed} side="left" height="46%" count={4} />
      </>
    ),
    forest: (
      <>
        <Grove seed={seed} side="left" height="66%" />
        <Grove seed={seed} side="right" height="60%" />
        <Grass b={[seed, 220, 30, 95]} height="9vh" />
      </>
    ),
    deep: (
      <>
        <div className="canopy" />
        <div className="trunk" style={{ left: "-2%", width: "7vw" }} />
        <div className="trunk" style={{ left: "9%", width: "3.5vw", opacity: 0.85 }} />
        <div className="trunk" style={{ right: "-1%", width: "8vw" }} />
        <div className="trunk" style={{ right: "12%", width: "3vw", opacity: 0.85 }} />
        <Grass b={[seed, 260, 40, 100]} height="11vh" />
      </>
    ),
    river: (
      <>
        <Grove seed={seed} side="left" height="58%" count={5} />
        <Grass b={[seed, 150, 50, 98, [[700, 1000]]]} height="14vh" />
      </>
    ),
    meadow: (
      <>
        <Tree t={broadleaf(seed + 2, 220, 600, 560)} style={{ bottom: "5vh", height: "78%", left: "-12%", width: "60%" }} fill="var(--tree-fore)" sway />
        <Grass
          b={[seed, 240, 30, 100]}
          height="13vh"
          extra={Array.from({ length: 70 }, (_, i) => (
            <circle key={i} className="flower" cx={f(r() * 1000)} cy={f(30 + r() * 55)} r={f(1.6 + r() * 1.8)} />
          ))}
        />
      </>
    ),
    lone: <Grass b={[seed, 120, 30, 90, [[560, 1000]]]} height="9vh" />,
    valleys: (
      <>
        <Grove seed={seed} side="left" height="70%" />
        <Grove seed={seed} side="right" height="76%" />
        <Grass b={[seed, 220, 30, 95]} height="9vh" />
      </>
    ),
    sunrise: (
      <>
        <Grove seed={seed} side="left" height="74%" />
        <Grove seed={seed} side="right" height="70%" count={5} />
        <Grass b={[seed, 220, 30, 95]} height="9vh" />
      </>
    ),
  }[set];

  return (
    <>
      {parts}
      <Drifters seed={seed} count={drift} />
      {flies}
    </>
  );
});
