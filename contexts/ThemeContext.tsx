"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { clockNow, hourNow, themeFor } from "@/lib/clock";

type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextType | null>(null);

// The theme is applied before paint by the <head> script (lib/headScript.ts): day or night by the
// visitor's clock, unless they picked one by hand in this visit (kept for the session only).
const picked = () => {
  try {
    return sessionStorage.getItem("theme");
  } catch {
    return null;
  }
};
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the value the head script set
    setTheme(root.dataset.theme === "light" ? "light" : "dark");
    // Keep the sky, and day / night unless picked by hand, in step with the clock while the page stays open.
    const tick = window.setInterval(() => {
      if (!picked()) {
        const t = themeFor(hourNow());
        root.dataset.theme = t;
        setTheme(t);
      }
      root.dataset.clock = clockNow(root.dataset.theme ?? "dark");
    }, 60_000);
    return () => clearInterval(tick);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      document.documentElement.dataset.clock = clockNow(next);
      setTheme(next);
    };
    try {
      sessionStorage.setItem("theme", next);
    } catch {}
    // Cross-fade where supported; instant elsewhere.
    if (document.startViewTransition) {
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
