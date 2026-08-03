"use client";

import { MoonStar, Sun } from "lucide-react";
import { useState } from "react";
import IconButton from "@/components/old-portfolio/general/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useTheme } from "@/lib/theme-context";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setThemeWithTransition } = useTheme();

  const toggleTheme = () => {
    setThemeWithTransition(theme === "dark" ? "light" : "dark");
  };

  useMountEffect(() => setMounted(true));

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
