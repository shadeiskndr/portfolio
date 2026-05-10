"use client";

import { MoonStar, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import IconButton from "@/components/general/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/lib/providers";

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
      <TooltipTrigger
        render={
          <IconButton onClick={toggleTheme}>{theme === "dark" ? <Sun /> : <MoonStar />}</IconButton>
        }
      />
      <TooltipContent>
        <p>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeSwitcher;
