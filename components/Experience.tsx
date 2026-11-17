"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Scene } from "./Film";
import SceneTitle from "./SceneTitle";

export default function Experience() {
  const { c } = useLanguage();
  const e = c.experience;

  return (
    <>
      <Scene id="experience" label={e.title} ghost={e.title} set="valleys" time="predawn" seed={8}>
        <SceneTitle title={e.title} intro={e.intro} />
        <ol className="grid gap-4 md:grid-cols-[2fr_3fr]">
          {e.jobs.map((job, i) => (
            <li key={i} className={`spot p-6 md:p-8 ${i === 0 ? "border-accent/60!" : ""}`}>
              <p className="text-sm text-muted tabular-nums">{job.period}</p>
              <h3 className="vf mt-3 text-[clamp(1.5rem,2.6vw,2.125rem)] leading-tight [--d:84] [--w:680]">{job.role}</h3>
              <p className="mt-1">{job.org}</p>
              <p className="text-sm text-muted">{job.meta}</p>
              {job.points.length > 0 && (
                <ul className="mt-5 space-y-2 text-[0.9375rem] leading-relaxed text-muted max-sm:[&>li:nth-child(n+4)]:hidden">
                  {job.points.map((pt, j) => (
                    <li key={j} className="relative pl-5">
                      <span aria-hidden className="absolute top-[0.6em] left-0 size-1.5 rotate-45 bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
              {job.stack.length > 0 && (
                <p className="mt-5 flex flex-wrap gap-2" aria-label={e.stackLabel}>
                  {job.stack.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Scene>

      <Scene id="education" label={e.educationTitle} ghost={e.educationTitle} set="lake" time="predawn" seed={9}>
        <SceneTitle title={e.educationTitle} center />
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {e.education.map((ed) => (
            <div key={ed.title} className="spot p-7 md:p-8">
              <p className="text-sm text-muted tabular-nums">{ed.period}</p>
              <h3 className="vf mt-3 text-2xl [--w:660]">{ed.title}</h3>
              <p className="mt-1">{ed.org}</p>
              <p className="mt-4 leading-relaxed text-muted">{ed.note}</p>
            </div>
          ))}
        </div>
      </Scene>
    </>
  );
}
