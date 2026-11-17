"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Scene } from "./Film";
import CaseStudy from "./CaseStudy";

// One scene per project: the name is the set piece.
export default function Projects() {
  const { c } = useLanguage();
  const p = c.projects;
  const [open, setOpen] = useState<number | null>(null);
  const titles = useRef<(HTMLHeadingElement | null)[]>([]);
  const opener = useRef<HTMLButtonElement | null>(null);

  // Open or close the case study inside a view transition: the scene's title is named for the
  // transition, so it morphs into the sheet's heading (which carries the same name) and back.
  const show = (next: number | null) => {
    const i = next ?? open;
    const title = i == null ? null : titles.current[i];
    const update = () => flushSync(() => setOpen(next));
    if (!title || !document.startViewTransition) {
      update();
      if (next == null) opener.current?.focus();
      return;
    }
    if (next != null) title.style.viewTransitionName = "case-title";
    const vt = document.startViewTransition(() => {
      update();
      title.style.viewTransitionName = next == null ? "case-title" : "";
    });
    vt.finished.finally(() => {
      title.style.viewTransitionName = "";
      if (next == null) opener.current?.focus();
    });
  };

  return (
    <>
      {p.items.map((item, i) => (
        <Scene
          key={item.url} // stable across languages: a changing key remounts the scene
          id={i === 0 ? "work" : `work-${i + 1}`}
          label={item.name}
          set={(["river", "meadow", "lone"] as const)[i % 3]}
          time="late"
          seed={5 + i}
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-muted">
              {p.title} <span className="tabular-nums">· {i + 1} / {p.items.length}</span>
            </p>
            <h2
              ref={(el) => {
                titles.current[i] = el;
              }}
              className="vf mt-4 whitespace-nowrap text-[clamp(1.5rem,min(8.5vw,15vh),7rem)] leading-[0.95] tracking-[-0.05em] [--d:75] [--w:780]"
            >
              {item.name}
            </h2>
            <p className="mt-4 text-sun-ink">
              {item.kind} · <span className="tabular-nums">{item.year}</span>
            </p>
            <p className="mx-auto mt-6 max-w-[56ch] text-lg leading-relaxed text-muted">{item.description}</p>
            <p className="mt-6 flex flex-wrap justify-center gap-2">
              {item.stack.map((s) => (
                <span key={s} className="tag bg-bg/70">
                  {s}
                </span>
              ))}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="btn btn-outline"
                aria-haspopup="dialog"
                onClick={(e) => {
                  opener.current = e.currentTarget;
                  show(i);
                }}
              >
                {p.caseStudy}
              </button>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="group btn btn-primary">
                {p.visit}
                <svg viewBox="0 0 16 16" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                </svg>
              </a>
            </div>
          </div>
        </Scene>
      ))}
      {open != null && (
        <CaseStudy
          index={open}
          onClose={() => show(null)}
          onGo={(i) => {
            setOpen(i);
            // Move the film behind to that project too, so closing lands on its scene.
            location.hash = i === 0 ? "work" : `work-${i + 1}`;
          }}
        />
      )}
    </>
  );
}
