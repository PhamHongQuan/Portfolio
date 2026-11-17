"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { profile } from "@/lib/content";

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * The page as a one-page résumé. Hidden on screen; when printing (Ctrl+P / Save as PDF) it is the only
 * thing on the paper, in the language the visitor is reading. Built from lib/content.ts, so it never
 * drifts from the site.
 */
export default function PrintCV() {
  const { c } = useLanguage();
  const contacts = [
    profile.email,
    profile.phone,
    c.contact.location,
    host(profile.site),
    profile.github && host(profile.github),
    profile.linkedin && host(profile.linkedin),
  ].filter(Boolean);

  return (
    <article className="cv">
      <header>
        <h1>{c.name}</h1>
        <p className="cv-role">{c.hero.role}</p>
        <p className="cv-contact">{contacts.join("  ·  ")}</p>
      </header>

      <section>
        <h2>{c.cv.profile}</h2>
        <p>{c.hero.intro}</p>
      </section>

      <section>
        <h2>{c.cv.experience}</h2>
        {c.experience.jobs.map((job) => (
          <div key={job.period} className="cv-item">
            <div className="cv-row">
              <h3>
                {job.role} · {job.org}
              </h3>
              <span>{job.period}</span>
            </div>
            <p className="cv-meta">{job.meta}</p>
            {job.points.length > 0 && (
              <ul>
                {job.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            )}
            {job.stack.length > 0 && <p className="cv-meta">{job.stack.join(", ")}</p>}
          </div>
        ))}
      </section>

      <section>
        <h2>{c.cv.projects}</h2>
        {c.projects.items.map((item) => (
          <div key={item.url} className="cv-item">
            <div className="cv-row">
              <h3>
                {item.name} · <span className="cv-kind">{item.kind}</span>
              </h3>
              <span>{item.year}</span>
            </div>
            <p>{item.description}</p>
            <p className="cv-meta">
              {item.stack.join(", ")} · {host(item.url)}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2>{c.cv.skills}</h2>
        <dl className="cv-skills">
          {c.stack.layers.map((layer) => (
            <div key={layer.name}>
              <dt>
                {layer.name} <span className="cv-kind">({layer.level})</span>
              </dt>
              <dd>{layer.tools.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>{c.cv.education}</h2>
        {c.experience.education.map((ed) => (
          <div key={ed.title} className="cv-item">
            <div className="cv-row">
              <h3>
                {ed.title} · <span className="cv-kind">{ed.org}</span>
              </h3>
              <span>{ed.period}</span>
            </div>
            <p className="cv-meta">{ed.note}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
