"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { navLinks } from "./Header";
import Logo from "./Logo";

export default function Footer() {
  const site = useLanguage();
  const { c } = site;

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
            {navLinks(site).map(([href, label]) => (
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
          © {new Date().getFullYear()} {c.name}. {c.footer.rights}
        </p>
        <a href="#top" className="inline-block py-1 hover:text-ink">
          {c.ui.backToTop}
        </a>
      </div>
    </footer>
  );
}
