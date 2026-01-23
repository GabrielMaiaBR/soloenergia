// Re-export from the new ThemeProvider
export { useTheme } from "@/components/theme/ThemeProvider";
export type { ThemeMode, ThemePalette, ThemeSettings } from "@/components/theme/ThemeProvider";

// Theme metadata for UI
export const THEME_PALETTES = [
  {
    id: "classic" as const,
    name: "Clássico",
    description: "Azul técnico profissional",
    primaryColor: "#0F2A44",
  },
  {
    id: "solar" as const,
    name: "Solo Energia",
    description: "Laranja solar vibrante",
    primaryColor: "#E55A2B",
  },
];
