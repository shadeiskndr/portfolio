"use client";

import { Bell, BellOff, MoonStar, Sun } from "lucide-react";
import { useState } from "react";
import ColorThemePicker from "@/components/new-site/layout/color-theme-picker";
import MusicPlayerPopover from "@/components/new-site/layout/music-player-popover";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { useSound } from "@/hooks/use-sound";
import { useTheme } from "@/lib/light-dark-providers";

/**
 * Three placements, split so each surface gets controls sized and packaged for
 * it — and so the popover/sheet choice is decided by where the control lives
 * rather than by a media query, which would mismatch on hydration.
 *
 * - `bar`    desktop top nav: all four, popovers, 32px
 * - `dock`   mobile bottom dock: dark mode only, 40px
 * - `drawer` mobile nav drawer: music + sound + colour theme, sheets, 40px
 */
export default function ThemeControls({
  variant = "bar",
}: {
  variant?: "bar" | "dock" | "drawer";
}) {
  const [mounted, setMounted] = useState(false);
  const { theme, setThemeWithTransition } = useTheme();
  const { enabled: soundEnabled, toggle: toggleSound, playClick } = useSound();

  useMountEffect(() => setMounted(true));

  const size = variant === "bar" ? "size-8" : "size-10";
  const iconButtonClassName = `${size} rounded-full text-muted-foreground`;

  const soundToggle = (
    <Tooltip disableHoverablePopup>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={iconButtonClassName}
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
            {mounted && soundEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        }
      />
      <TooltipContent>{soundEnabled ? "Mute sounds" : "Unmute sounds"}</TooltipContent>
    </Tooltip>
  );

  const darkToggle = (
    <Tooltip disableHoverablePopup>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={iconButtonClassName}
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
          </Button>
        }
      />
      <TooltipContent>{mounted && theme === "dark" ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  );

  if (variant === "drawer") {
    return (
      <div className="flex items-center gap-1">
        {/* Safe to sit inside the drawer now that the `<audio>` lives in
            MusicPlayerProvider — closing the drawer no longer stops playback,
            so this behaves like the colour sheet and leaves the drawer up. */}
        <MusicPlayerPopover variant="sheet" />
        {soundToggle}
        <ColorThemePicker variant="sheet" />
      </div>
    );
  }

  // Music moved to the nav drawer, leaving the dock as nav plus one toggle.
  if (variant === "dock") {
    return darkToggle;
  }

  return (
    <div className="flex items-center gap-1">
      <MusicPlayerPopover />
      {soundToggle}
      <ColorThemePicker />
      {darkToggle}
    </div>
  );
}
