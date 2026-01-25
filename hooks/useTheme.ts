"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

type Theme = "light" | "dark";

export function useTheme() {
  // Start with a neutral, server-safe default to avoid hydration mismatches.
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, setTheme, toggleTheme, mounted };
}

