"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Content, Language, Site } from "@/lib/content";
import { themeCss } from "@/lib/themeCss";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  c: Content;
  profile: Site["profile"];
  sections: Site["settings"]["sections"];
  scenery: Site["settings"]["scenery"];
};

const LanguageContext = createContext<LanguageContextType | null>(null);

// The site comes from the server (lib/site.ts: Supabase over the defaults), so the admin can change it.
// The admin (/admin) previews unsaved drafts in an iframe or a tab it opened. Only a same-origin
// window at /admin may send one, so visitors never see a draft.
function adminWindow(): Window | null {
  for (const w of [window.parent !== window ? window.parent : null, window.opener as Window | null]) {
    try {
      if (w && w.location.origin === location.origin && w.location.pathname.startsWith("/admin")) return w;
    } catch {}
  }
  return null;
}

export function LanguageProvider({ site: saved, children }: { site: Site; children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [draft, setDraft] = useState<Site | null>(null);
  const site = draft ?? saved;

  useEffect(() => {
    const admin = adminWindow();
    if (!admin) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin === location.origin && e.source === admin && e.data?.type === "preview") setDraft(e.data.site as Site);
    };
    addEventListener("message", onMessage);
    admin.postMessage({ type: "preview-ready" }, location.origin);
    return () => removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const style = document.getElementById("site-theme");
    if (draft && style) style.textContent = themeCss(draft.settings.theme);
  }, [draft]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("language");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is client-only
      if (saved === "en" || saved === "vi") setLanguageState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("language", lang);
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, c: site.content[language], profile: site.profile, sections: site.settings.sections, scenery: site.settings.scenery }}>
      {children}
      {draft && (
        <div className="pointer-events-none fixed bottom-3 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-sun px-3 py-1 text-xs font-semibold text-black shadow">
          Xem trước · chưa xuất bản
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
