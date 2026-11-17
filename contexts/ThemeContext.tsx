"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { clockNow } from "@/lib/clock";

type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; toggleTheme: () => void };

const ThemeContext = createContext<ThemeContextType | null>(null);

// The saved theme is applied before paint by the <head> script (lib/headScript.ts).
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the value the head script set
    setTheme(root.dataset.theme === "light" ? "light" : "dark");
    // Keep the sky in step with the clock while the page stays open.
    const tick = window.setInterval(() => (root.dataset.clock = clockNow(root.dataset.theme ?? "dark")), 60_000);
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
      localStorage.setItem("theme", next);
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
