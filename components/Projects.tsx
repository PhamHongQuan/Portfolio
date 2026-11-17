"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Scene } from "./Film";

// One scene per project: the name is the set piece.
export default function Projects() {
  const { c } = useLanguage();
  const p = c.projects;

  return (
    <>
      {p.items.map((item, i) => (
        <Scene
          key={item.name}
          id={i === 0 ? "work" : `work-${i + 1}`}
          label={item.name}
          ghost={item.name}
          set={(["river", "meadow", "lone"] as const)[i % 3]}
          time="late"
          seed={5 + i}
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-muted">
              {p.title} <span className="tabular-nums">· {i + 1} / {p.items.length}</span>
            </p>
            <h2 className="vf mt-4 text-[clamp(3.5rem,min(13vw,20vh),11rem)] leading-[0.85] tracking-[-0.05em] [--d:75] [--w:780]">
              {item.name}
            </h2>
            <p className="mt-4 text-sun-ink">
              {item.kind} · <span className="tabular-nums">{item.year}</span>
            </p>
            <p className="mx-auto mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">{item.description}</p>
            <p className="mt-6 flex flex-wrap justify-center gap-2">
              {item.stack.map((s) => (
                <span key={s} className="tag bg-bg/50 backdrop-blur">
                  {s}
                </span>
              ))}
            </p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="group btn btn-primary mt-8">
              {p.visit}
              <svg viewBox="0 0 16 16" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
              </svg>
            </a>
          </div>
        </Scene>
      ))}
    </>
  );
}
