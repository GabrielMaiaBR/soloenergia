import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";
type ThemePalette = "classic" | "solar";

interface ThemeSettings {
    mode: ThemeMode;
    palette: ThemePalette;
}

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: ThemeSettings;
    storageKey?: string;
}

interface ThemeProviderState {
    theme: ThemeMode;
    palette: ThemePalette;
    setTheme: (theme: ThemeMode) => void;
    setPalette: (palette: ThemePalette) => void;
    toggleTheme: () => void;
    fullTheme: ThemeSettings;
}

const initialState: ThemeProviderState = {
    theme: "dark",
    palette: "classic",
    setTheme: () => null,
    setPalette: () => null,
    toggleTheme: () => null,
    fullTheme: { mode: "dark", palette: "classic" },
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = { mode: "dark", palette: "classic" },
    storageKey = "solo-smart-theme-v2",
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<ThemeSettings>(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    mode: parsed.mode === "light" ? "light" : "dark",
                    palette: parsed.palette === "solar" ? "solar" : "classic",
                };
            } catch {
                // Fallback or legacy
            }
        }
        return defaultTheme;
    });

    useEffect(() => {
        const root = document.documentElement;

        // Remove all theme classes first
        root.classList.remove("dark", "light", "theme-classic", "theme-solar");

        // Apply mode
        if (theme.mode === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.add("light");
        }

        // Apply palette
        root.classList.add(`theme-${theme.palette}`);

        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(theme));
    }, [theme, storageKey]);

    const setMode = (mode: ThemeMode) => {
        setThemeState((prev) => ({ ...prev, mode }));
    };

    const setPalette = (palette: ThemePalette) => {
        setThemeState((prev) => ({ ...prev, palette }));
    };

    const toggleTheme = () => {
        setThemeState((prev) => ({
            ...prev,
            mode: prev.mode === "dark" ? "light" : "dark",
        }));
    };

    const value = {
        theme: theme.mode,
        palette: theme.palette,
        setTheme: setMode,
        setPalette,
        toggleTheme,
        fullTheme: theme,
    };

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};
