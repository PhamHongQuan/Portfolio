"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * A project's case study, as a full-screen sheet over the film (a modal <dialog>: the page behind is
 * inert, Esc closes, focus returns to the button that opened it). Laid out like the rest of the site:
 * a scene-like header with the project's name (it flies in from the scene, see Projects.tsx), then a
 * bento of glass cards, then the previous and next projects.
 */
export default function CaseStudy({ index, onGo, onClose }: { index: number; onGo: (i: number) => void; onClose: () => void }) {
  const { c } = useLanguage();
  const p = c.projects;
  const item = p.items[index];
  const count = p.items.length;
  const ref = useRef<HTMLDialogElement>(null);

  // Open as a modal straight away (layout effect: inside the view-transition update).
  useLayoutEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    const root = document.documentElement;
    root.classList.add("case-open"); // locks the page behind (a class, not :has(), to keep style work small)
    return () => root.classList.remove("case-open");
  }, []);

  // Another project: back to the top of the sheet.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [index]);

  const prev = (index - 1 + count) % count;
  const next = (index + 1) % count;

  return (
    <dialog
      ref={ref}
      className="case"
      aria-labelledby="case-title"
      onCancel={(e) => {
        e.preventDefault(); // close through onClose, so it animates
        onClose();
      }}
      // Keys stay in the sheet: the film behind must not change scene.
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="case-bar">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <button type="button" onClick={onClose} className="case-back">
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M10 3.5L5.5 8l4.5 4.5" />
            </svg>
            {p.back}
          </button>
          <p className="text-sm text-muted tabular-nums">
            {p.caseStudy} · {index + 1} / {count}
          </p>
          <button type="button" onClick={onClose} className="case-close" aria-label={c.ui.close}>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div key={item.url}>
        {/* Header: a small scene of its own (sky, far ridge) with the project's name as the set piece. */}
        <header className="case-hero">
          <svg aria-hidden viewBox="0 0 1000 120" preserveAspectRatio="none" className="case-ridge">
            <path d="M0 120 L0 70 L90 40 L170 66 L260 28 L350 60 L430 38 L520 72 L610 30 L700 58 L790 24 L880 62 L1000 36 L1000 120 Z" />
          </svg>
          <div className="container-x relative text-center">
            <p className="fade-in text-sun-ink [--delay:0.05s]">
              {item.kind} · <span className="tabular-nums">{item.year}</span>
            </p>
            <h2
              id="case-title"
              tabIndex={-1}
              autoFocus // the sheet opens on its title (read first by screen readers), not on a button
              className="case-title vf mt-4 whitespace-nowrap text-[clamp(1.75rem,min(8vw,13vh),6.5rem)] leading-[0.95] tracking-[-0.05em] [--w:780]"
            >
              {item.name}
            </h2>
            <p className="fade-in mx-auto mt-6 max-w-[58ch] text-lg leading-relaxed text-muted [--delay:0.12s]">{item.description}</p>
          </div>
        </header>

        <div className="container-x relative grid max-w-6xl! gap-4 pb-10 md:grid-cols-12">
          <section className="fade-in spot flex flex-col gap-6 p-7 md:col-span-4 [--delay:0.16s]">
            <div>
              <h3 className="text-sm text-muted">{p.labels.role}</h3>
              <p className="vf mt-2 text-xl leading-snug [--w:640]">{item.study.role}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted">{p.labels.year}</h3>
              <p className="vf mt-2 text-xl tabular-nums [--w:640]">{item.year}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted">{p.labels.stack}</h3>
              <p className="mt-3 flex flex-wrap gap-2">
                {item.stack.map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
              </p>
            </div>
          </section>

          <section className="fade-in spot p-7 md:col-span-8 md:p-10 [--delay:0.2s]">
            <h3 className="text-sm text-muted">{p.labels.context}</h3>
            <p className="vf mt-4 text-[clamp(1.375rem,2.4vw,2rem)] leading-[1.25] [--w:560]">{item.study.context}</p>
          </section>

          <section className="fade-in spot p-7 md:col-span-8 md:p-10 [--delay:0.26s]">
            <h3 className="text-sm text-muted">{p.labels.did}</h3>
            <ol className="mt-4">
              {item.study.did.map((d, k) => (
                <li key={d} className="case-step">
                  <span aria-hidden className="vf text-accent tabular-nums [--w:700]">
                    {String(k + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed md:text-lg">{d}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="fade-in spot flex flex-col justify-between gap-8 border-accent! bg-accent! p-7 text-on-accent md:col-span-4 md:p-8 [--delay:0.32s]">
            <div>
              <h3 className="text-sm opacity-75">{p.labels.outcome}</h3>
              <p className="vf mt-4 text-[clamp(1.25rem,2vw,1.625rem)] leading-snug [--w:600]">{item.study.outcome}</p>
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="case-visit group">
              {p.visit}
              <svg viewBox="0 0 16 16" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
              </svg>
            </a>
          </section>
        </div>

        <nav aria-label={p.title} className="container-x grid max-w-6xl! gap-4 pb-16 sm:grid-cols-2">
          <button type="button" onClick={() => onGo(prev)} className="case-nav text-left">
            <span className="text-sm text-muted">← {p.prev}</span>
            <span className="vf text-[clamp(1.5rem,3vw,2.25rem)] [--w:720]">{p.items[prev].name}</span>
          </button>
          <button type="button" onClick={() => onGo(next)} className="case-nav items-end text-right">
            <span className="text-sm text-muted">{p.next} →</span>
            <span className="vf text-[clamp(1.5rem,3vw,2.25rem)] [--w:720]">{p.items[next].name}</span>
          </button>
        </nav>
      </div>
    </dialog>
  );
}
