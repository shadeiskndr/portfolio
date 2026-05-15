"use client";

import { Bell, BellOff, CheckIcon, MoonStar, Palette, Play, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorTheme } from "@/lib/color-provider";
import { useTheme } from "@/lib/light-dark-providers";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";

const colorThemes = [
  { id: "default", label: "Default" },
  { id: "claude", label: "Claude" },
  { id: "rose", label: "Rose" },
] as const;

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
  const { colorTheme, setColorThemeWithTransition } = useColorTheme();
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconBtn aria-label="Color theme" onClick={() => playClick("icon")}>
              <Palette className="h-4 w-4" />
            </IconBtn>
          }
        />
        <DropdownMenuContent align="end">
          {colorThemes.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => {
                playClick("mouse");
                setColorThemeWithTransition(t.id);
              }}
              className="gap-2"
            >
              {t.label}
              <span className="ml-auto flex items-center">
                {colorTheme === t.id ? <CheckIcon className="size-4" /> : null}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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
