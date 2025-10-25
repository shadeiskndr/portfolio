"use client";

import { useState, useEffect } from "react";
import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "@/lib/providers";

import IconButton from "@/components/general/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setThemeWithTransition } = useTheme();

  const toggleTheme = () => {
    setThemeWithTransition(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // until the UI is mounted, display a dummy icon
  if (!mounted) {
    return (
      <IconButton>
        <Sun />
      </IconButton>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton onClick={toggleTheme}>{theme === "dark" ? <Sun /> : <MoonStar />}</IconButton>
      </TooltipTrigger>
      <TooltipContent>
        <p>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeSwitcher;
