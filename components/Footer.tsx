"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { navLinks } from "./Header";
import Logo from "./Logo";

export default function Footer() {
  const { c } = useLanguage();

  return (
    <footer className="relative">
      <div className="container-x flex flex-col gap-10 border-t border-line py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p aria-label={c.name}>
            <Logo className="h-14" />
          </p>
          <p className="mt-2 max-w-[36ch] text-muted">{c.footer.tagline}</p>
        </div>
        <nav aria-label={c.ui.nav}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-muted">
            {navLinks(c).map(([href, label]) => (
              <li key={href}>
                <a href={href} className="inline-block py-1 hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container-x flex flex-col justify-between gap-3 border-t border-line py-6 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {c.name}. {c.footer.rights}{" "}
          {/* Required credit for the CC BY-SA recording in public/sounds/frogs.mp3 */}
          <a
            href="https://commons.wikimedia.org/wiki/File:Frogs_croaking_in_a_pipe_in_Thailand.flac"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap underline-offset-2 hover:text-ink hover:underline"
          >
            {c.footer.frogCredit}: Amada44, CC BY-SA 3.0
          </a>
        </p>
        <a href="#top" className="inline-block py-1 hover:text-ink">
          {c.ui.backToTop}
        </a>
      </div>
    </footer>
  );
}
