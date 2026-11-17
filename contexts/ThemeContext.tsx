"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextType | null>(null);

// Runs in <head> before paint so the saved theme never flashes.
export const themeInitScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="dark";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the value the head script set
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    try {
      localStorage.setItem("theme", next);
    } catch {}
    // Cross-fade where supported; instant elsewhere.
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
