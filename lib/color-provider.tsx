"use client";

import { useQuery } from "convex/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTimeout } from "@/hooks/use-timeout";
import { applyThemeCSSVars } from "@/lib/apply-theme-css-vars";
import { applyThemeFonts } from "@/lib/apply-theme-fonts";
import {
  COLOR_THEMES,
  type ColorTheme,
  DEFAULT_COLOR_THEME,
  type ThemeOption,
} from "@/lib/color-themes";

type ColorThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ColorTheme;
  storageKey?: string;
};

type ColorThemeProviderState = {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  setColorThemeWithTransition: (theme: ColorTheme) => void;
  themes: ThemeOption[];
  localThemes: ThemeOption[];
  remoteThemes: ThemeOption[];
  transitionEnabled: boolean;
  setTransitionEnabled: (enabled: boolean) => void;
};

const initialState: ColorThemeProviderState = {
  colorTheme: "default",
  setColorTheme: () => null,
  setColorThemeWithTransition: () => null,
  themes: COLOR_THEMES,
  localThemes: COLOR_THEMES,
  remoteThemes: [],
  transitionEnabled: true,
  setTransitionEnabled: () => null,
};

const ColorThemeProviderContext = createContext<ColorThemeProviderState>(initialState);

export function ColorThemeProvider({
  children,
  defaultTheme = "default",
  storageKey = "vite-ui-color-theme",
  ...props
}: ColorThemeProviderProps) {
  const [colorTheme, setColorTheme] = useLocalStorage<ColorTheme>(storageKey, defaultTheme);
  const [transitionEnabled, setTransitionEnabled] = useLocalStorage<boolean>(
    `${storageKey}-transition`,
    true
  );
  const [styleId, setStyleId] = useState<string | null>(null);

  const remoteThemesRaw = useQuery(api.themes.getTweakcnThemes);
  const remoteThemes = useMemo<ThemeOption[]>(() => remoteThemesRaw ?? [], [remoteThemesRaw]);

  const { themes, themesById } = useMemo(() => {
    const merged = [...COLOR_THEMES, ...remoteThemes];
    return {
      themes: merged,
      themesById: new Map(merged.map((t) => [t.id, t])),
    };
  }, [remoteThemes]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", colorTheme);
    const theme = themesById.get(colorTheme) ?? DEFAULT_COLOR_THEME;
    applyThemeCSSVars(window.document, theme);
    applyThemeFonts(window.document, theme);
  }, [colorTheme, themesById]);

  // Clean up animation styles after transition
  useTimeout(
    () => {
      if (styleId) {
        const styleEl = document.getElementById(styleId);
        if (styleEl) {
          styleEl.remove();
        }
        setStyleId(null);
      }
    },
    styleId ? 3000 : null
  );

  const setColorThemeWithTransition = (newTheme: ColorTheme) => {
    if (!transitionEnabled) {
      setColorTheme(newTheme);
      return;
    }

    // Inject polygon wipe animation styles
    const newStyleId = `color-theme-transition-${Date.now()}`;
    const style = document.createElement("style");
    style.id = newStyleId;

    const css = `
      @supports (view-transition-name: root) {
        ::view-transition-old(root) {
          animation: none;
        }
        ::view-transition-new(root) {
          animation: wipe-in 0.4s ease-out;
        }
        @keyframes wipe-in {
          from {
            clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          }
          to {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
        }
      }
    `;

    style.textContent = css;
    document.head.appendChild(style);
    setStyleId(newStyleId);

    // Use View Transitions API if supported
    if ("startViewTransition" in document) {
      document.startViewTransition(() => {
        setColorTheme(newTheme);
      });
    } else {
      setColorTheme(newTheme);
    }
  };

  const value: ColorThemeProviderState = {
    colorTheme,
    setColorTheme,
    setColorThemeWithTransition,
    themes,
    localThemes: COLOR_THEMES,
    remoteThemes,
    transitionEnabled,
    setTransitionEnabled,
  };

  return (
    <ColorThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ColorThemeProviderContext.Provider>
  );
}

export const useColorTheme = () => {
  const context = useContext(ColorThemeProviderContext);

  if (context === undefined)
    throw new Error("useColorTheme must be used within a ColorThemeProvider");

  return context;
};
