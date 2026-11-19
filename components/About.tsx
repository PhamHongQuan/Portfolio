"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Scene } from "./Film";
import SceneTitle from "./SceneTitle";

export default function About() {
  const { c } = useLanguage();
  const a = c.about;

  return (
    <>
      <Scene id="about" label={a.title}>
        <SceneTitle title={a.title} />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="spot p-7 md:col-span-2 md:p-10">
            <p className="vf text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.15] [--w:560]">{a.lead}</p>
            <div className="mt-6 max-w-[62ch] space-y-4 leading-relaxed text-muted md:text-lg">
              {a.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="grid gap-4 max-md:grid-cols-2">
            {a.stats.map((s, i) => (
              <div key={s.label} className={`spot flex flex-col justify-between gap-6 p-6 ${i === 0 ? "border-accent! bg-accent! text-on-accent" : ""}`}>
                <p className="vf text-[clamp(3rem,6vw,4.5rem)] leading-none [--d:80] [--w:760]">{s.value}</p>
                <p className={i === 0 ? "text-on-accent/75" : "text-muted"}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Scene>

      <Scene id="principles" label={a.principlesTitle}>
        <SceneTitle title={a.principlesTitle} center />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {a.principles.map((p) => (
            <div key={p.title} className="spot p-6 md:p-7">
              <span className="block h-1 w-10 rounded-full bg-sun" aria-hidden />
              <h3 className="vf mt-5 text-xl [--w:640] md:text-2xl">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </Scene>
    </>
  );
}
