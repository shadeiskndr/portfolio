"use client";

import { createContext, useContext } from "react";
import { COLOR_THEMES, type ColorTheme, type ThemeOption } from "@/lib/color-themes";

export type ColorThemeProviderState = {
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

export const ColorThemeProviderContext = createContext<ColorThemeProviderState>(initialState);

export const useColorTheme = () => {
  const context = useContext(ColorThemeProviderContext);

  if (context === undefined)
    throw new Error("useColorTheme must be used within a ColorThemeProvider");

  return context;
};
