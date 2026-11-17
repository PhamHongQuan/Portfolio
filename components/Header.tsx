"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "./Logo";
import { SoundToggle } from "./Ambience";

export const navLinks = (c: ReturnType<typeof useLanguage>["c"]) => [
  ["#about", c.nav.about],
  ["#stack", c.nav.stack],
  ["#work", c.nav.work],
  ["#experience", c.nav.experience],
  ["#contact", c.nav.contact],
];

// Floating dark glass pill, the same in both themes.
export default function Header() {
  const { c, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links = navLinks(c);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 rounded-full border border-line bg-bg/60 pr-2 pl-4 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.45)] backdrop-blur-xl">
        <a href="#top" aria-label={c.name} className="flex items-center gap-2.5">
          <Logo className="h-9" priority />
        </a>

        <nav aria-label={c.ui.nav} className="hidden items-center gap-1 text-[0.9375rem] text-muted lg:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-3.5 py-2 transition-colors hover:bg-ink/5 hover:text-ink">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div role="group" aria-label={c.ui.language} className="flex rounded-full border border-line p-0.5 text-[0.8125rem]">
            {(["en", "vi"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                lang={lang}
                aria-pressed={language === lang}
                onClick={() => setLanguage(lang)}
                className="h-8 min-w-8 cursor-pointer rounded-full px-2 text-muted transition-colors hover:text-ink aria-pressed:bg-ink aria-pressed:text-bg"
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <SoundToggle />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? c.ui.toLight : c.ui.toDark}
            className="grid size-10 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              {theme === "dark" ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </>
              ) : (
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              )}
            </svg>
          </button>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-ink/5 lg:hidden"
          >
            <span className="sr-only">{open ? c.ui.close : c.ui.menu}</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 9h16M4 15h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={c.ui.nav}
          className="mx-auto mt-2 max-w-5xl rounded-3xl border border-line bg-bg/95 p-3 lg:hidden"
        >
          <ul>
            {links.map(([href, label]) => (
              <li key={href}>
                <a href={href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3.5 text-lg hover:bg-ink/5">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
