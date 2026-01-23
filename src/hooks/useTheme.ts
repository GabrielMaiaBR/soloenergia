import { useState, useEffect } from "react";

/**
 * Sistema de temas do Solo Smart
 * 
 * Modos: light, dark
 * Paletas: classic (azul técnico), solar (laranja Solo Energia)
 */

export type ThemeMode = "light" | "dark";
export type ThemePalette = "classic" | "solar";

export interface ThemeSettings {
  mode: ThemeMode;
  palette: ThemePalette;
}

const DEFAULT_THEME: ThemeSettings = {
  mode: "dark",
  palette: "classic",
};

export function useTheme() {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    // Check localStorage first
    const stored = localStorage.getItem("solo-smart-theme-v2");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          mode: parsed.mode === "light" ? "light" : "dark",
          palette: parsed.palette === "solar" ? "solar" : "classic",
        };
      } catch {
        // Fallback to old theme format
        const oldTheme = localStorage.getItem("solo-smart-theme");
        if (oldTheme === "light" || oldTheme === "dark") {
          return { mode: oldTheme, palette: "classic" };
        }
      }
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove("dark", "light", "theme-classic", "theme-solar");

    // Apply mode
    if (theme.mode === "dark") {
      root.classList.add("dark");
    }

    // Apply palette
    root.classList.add(`theme-${theme.palette}`);

    // Save to localStorage
    localStorage.setItem("solo-smart-theme-v2", JSON.stringify(theme));
  }, [theme]);

  const toggleMode = () => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === "dark" ? "light" : "dark",
    }));
  };

  const setPalette = (palette: ThemePalette) => {
    setTheme((prev) => ({ ...prev, palette }));
  };

  const setMode = (mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }));
  };

  // Legacy compatibility
  const toggleTheme = toggleMode;

  return {
    theme: theme.mode,
    palette: theme.palette,
    setTheme: setMode,
    setPalette,
    toggleTheme,
    toggleMode,
    fullTheme: theme,
    setFullTheme: setTheme,
  };
}

// Theme metadata for UI
export const THEME_PALETTES = [
  {
    id: "classic" as ThemePalette,
    name: "Clássico",
    description: "Azul técnico profissional",
    primaryColor: "#0F2A44",
  },
  {
    id: "solar" as ThemePalette,
    name: "Solo Energia",
    description: "Laranja solar vibrante",
    primaryColor: "#E55A2B",
  },
];
