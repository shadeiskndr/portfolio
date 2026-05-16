"use client";

import { Bell, BellOff, MoonStar, Play, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import ColorThemePicker from "@/components/new-site/layout/color-theme-picker";
import { useSound } from "@/hooks/use-sound";
import { useTheme } from "@/lib/light-dark-providers";
import { cn } from "@/lib/utils";

function IconBtn({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export default function ThemeControls() {
  const [mounted, setMounted] = useState(false);
  const { theme, setThemeWithTransition } = useTheme();
  const { enabled: soundEnabled, toggle: toggleSound, playClick } = useSound();

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-1">
      <IconBtn aria-label="Play">
        <Play className="h-4 w-4" />
      </IconBtn>
      <IconBtn
        aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
        aria-pressed={soundEnabled}
        onClick={() => {
          const willEnable = !soundEnabled;
          toggleSound();
          if (willEnable) {
            playClick("sound");
          }
        }}
      >
        {mounted && soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </IconBtn>
      <ColorThemePicker />
      <IconBtn
        aria-label="Toggle dark mode"
        onClick={() => {
          playClick("icon");
          setThemeWithTransition(theme === "dark" ? "light" : "dark");
        }}
      >
        {mounted && theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <MoonStar className="h-4 w-4" />
        )}
      </IconBtn>
    </div>
  );
}
