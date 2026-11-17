"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { content, Content, Language } from "@/lib/content";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  c: Content;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

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
    <LanguageContext.Provider value={{ language, setLanguage, c: content[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
