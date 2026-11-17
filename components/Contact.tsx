"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { profile } from "@/lib/content";
import { Scene } from "./Film";

export default function Contact() {
  const { c } = useLanguage();
  const k = c.contact;
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const socials = [
    ["GitHub", profile.github],
    ["LinkedIn", profile.linkedin],
  ].filter(([, href]) => href);

  return (
    // Final shot: arriving at a yellow sunrise.
    <Scene id="contact" label={k.title} set="sunrise" time="dawn" seed={10}>
      <div className="flex -translate-y-[4vh] flex-col items-center text-center">
        <h2
          id="contact-title"
          className="vf max-w-5xl text-[clamp(2.75rem,7.5vw,6.5rem)] leading-[0.95] tracking-[-0.035em] [--d:76] [--w:720]"
        >
          {k.title}
        </h2>
        <p className="mt-6 max-w-[48ch] text-lg [text-shadow:0_1px_14px_var(--bg)] md:text-xl">{k.lead}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <a
            href={`mailto:${profile.email}`}
            className="vf text-[clamp(1.5rem,4.2vw,3.25rem)] leading-none underline decoration-accent decoration-2 underline-offset-[0.18em] transition-colors hover:text-accent [--w:560]"
          >
            {profile.email}
          </a>
          <button type="button" onClick={copy} className="btn btn-outline btn-sm" aria-live="polite">
            {copied ? c.ui.copied : c.ui.copy}
          </button>
        </div>

        <dl className="mt-12 flex flex-wrap justify-center gap-x-16 gap-y-6 rounded-3xl border border-line bg-bg/75 px-8 py-6">
          <div>
            <dt className="text-sm text-muted">{k.labels.phone}</dt>
            <dd className="mt-1 text-lg">
              <a href={profile.phoneHref} className="link">
                {profile.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">{k.labels.location}</dt>
            <dd className="mt-1 text-lg">{k.location}</dd>
          </div>
          {socials.length > 0 && (
            <div>
              <dt className="text-sm text-muted">GitHub, LinkedIn</dt>
              <dd className="mt-1 flex gap-5 text-lg">
                {socials.map(([name, href]) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="link">
                    {name}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </Scene>
  );
}
