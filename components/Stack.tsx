"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Scene } from "./Film";
import SceneTitle from "./SceneTitle";

// Bento: the main focus gets the big accent card, the supporting layers sit beside it.
export default function Stack() {
  const { c } = useLanguage();
  const s = c.stack;
  const [main, ...rest] = s.layers;

  return (
    <Scene id="stack" label={s.title}>
      <SceneTitle title={s.title} intro={s.intro} />
      <div className="grid gap-4 md:grid-cols-5 md:grid-rows-3">
        <article className="spot flex flex-col justify-between gap-8 border-accent! bg-accent! p-7 text-on-accent md:col-span-3 md:row-span-3 md:p-10">
          <div>
            <p className="inline-flex rounded-full bg-on-accent/10 px-3 py-1 text-sm font-medium">{main.level}</p>
            <h3 className="vf mt-6 text-[clamp(3rem,6vw,5.5rem)] leading-[0.9] tracking-[-0.04em] [--d:76] [--w:780]">{main.name}</h3>
            <p className="mt-5 max-w-[46ch] leading-relaxed opacity-80 md:text-lg">{main.text}</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {main.tools.map((t) => (
              <li key={t} className="rounded-full border border-on-accent/25 px-3.5 py-1.5 text-[0.9375rem] font-medium">
                {t}
              </li>
            ))}
          </ul>
        </article>

        {rest.map((layer) => (
          <article key={layer.name} className="spot flex flex-col gap-3 p-6 md:col-span-2">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="vf text-2xl [--w:680]">{layer.name}</h3>
              <span className="text-sm text-accent">{layer.level}</span>
            </div>
            <p className="text-[0.9375rem] leading-relaxed text-muted max-md:hidden">{layer.text}</p>
            <p className="mt-auto text-sm text-muted">{layer.tools.join(" · ")}</p>
          </article>
        ))}
      </div>
    </Scene>
  );
}
