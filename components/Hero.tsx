"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Scene } from "./Film";

// Opening shot: the whole valley seen from far away, under the aurora and the moon.
export default function Hero() {
  const { c, profile } = useLanguage();
  const h = c.hero;
  let n = 0; // running letter index for the staggered entrance

  const marquee = (
    <div className="marquee absolute inset-x-0 bottom-[7vh] border-t border-line bg-bg/80 py-4">
      <ul className="marquee-track gap-12 text-muted" aria-label={c.nav.stack}>
        {[...h.stack, ...h.stack].map((s, i) => (
          <li key={i} aria-hidden={i >= h.stack.length} className="flex shrink-0 items-center gap-3">
            <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Scene id="top" label={c.name} clock after={marquee}>
      <div className="flex -translate-y-[6vh] flex-col items-center text-center">
        <h1
          aria-label={c.name}
          className="vf mt-7 text-[clamp(2.25rem,min(8.6vw,14vh),9rem)] leading-[0.95] tracking-[-0.045em] [--d:75] [--w:780]"
        >
          {c.name.split(" ").map((word, wi) => (
            <span key={wi} aria-hidden>
              <span className="rise inline-block whitespace-nowrap">
                {Array.from(word).map((ch) => (
                  <span key={n} style={{ "--i": n++ } as React.CSSProperties}>
                    {ch}
                  </span>
                ))}
              </span>{" "}
            </span>
          ))}
        </h1>

        <p className="fade-in vf mt-6 text-[clamp(1.375rem,2.6vw,2rem)] text-sun-ink [--delay:0.55s] [--w:560]">{h.role}</p>
        <p className="fade-in mt-3 max-w-[50ch] text-lg leading-relaxed text-ink/80 [text-shadow:0_1px_14px_var(--bg)] [--delay:0.65s]">{h.intro}</p>

        <div className="fade-in mt-8 flex flex-wrap justify-center gap-3 [--delay:0.75s]">
          <a href="#contact" className="btn btn-primary">
            {h.primary}
          </a>
          {profile.cv ? (
            <a href={profile.cv} className="btn btn-outline" download>
              {h.secondary}
            </a>
          ) : (
            <a href="#work" className="btn btn-outline">
              {c.nav.work}
            </a>
          )}
        </div>
      </div>
    </Scene>
  );
}
