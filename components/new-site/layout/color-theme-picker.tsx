"use client";

import { Palette, Zap, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSound } from "@/hooks/use-sound";
import { useColorTheme } from "@/lib/color-provider";
import { PALETTE_KEYS, type ThemeOption } from "@/lib/color-themes";
import { cn } from "@/lib/utils";

function ThemePalette({ theme }: { theme: ThemeOption }) {
  return (
    <div className="flex shrink-0 gap-0.5">
      {PALETTE_KEYS.map((key) => (
        <div
          key={key}
          className="inset-ring-1 inset-ring-foreground/15 flex h-4 w-2.5 shrink-0 rounded-xs bg-(--swatch) dark:bg-(--swatch-dark)"
          style={
            {
              "--swatch": theme.cssVars.light[key],
              "--swatch-dark": theme.cssVars.dark[key],
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function ColorThemePicker() {
  const {
    colorTheme,
    setColorThemeWithTransition,
    localThemes,
    remoteThemes,
    themes,
    transitionEnabled,
    setTransitionEnabled,
  } = useColorTheme();
  const { playClick } = useSound();

  const selectedTheme = themes.find((t) => t.id === colorTheme) ?? localThemes[0];

  return (
    <Popover>
      <Tooltip disableHoverablePopup>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Color theme"
                  onClick={() => playClick("icon")}
                  className="rounded-full text-muted-foreground"
                >
                  <Palette className="h-4 w-4" />
                </Button>
              }
            />
          }
        />
        <TooltipContent>Color theme</TooltipContent>
      </Tooltip>
      <PopoverContent className="rounded-2xl p-0" align="end" alignOffset={-8}>
        <Command
          className={cn(
            "**:data-[slot=command-input-wrapper]:h-12 **:[[cmdk-input]]:h-10",
            "**:[[cmdk-group]]:px-2",
            "**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
            "**:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-2"
          )}
        >
          <div className="flex items-center gap-1 pr-2">
            <div className="flex-1">
              <CommandInput placeholder="Search theme…" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-pressed={transitionEnabled}
              aria-label={
                transitionEnabled ? "Disable transition animation" : "Enable transition animation"
              }
              onClick={() => {
                playClick("icon");
                setTransitionEnabled(!transitionEnabled);
              }}
              className="mt-1.5 shrink-0 self-start text-muted-foreground"
            >
              {transitionEnabled ? <Zap /> : <ZapOff />}
            </Button>
          </div>
          {selectedTheme ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-sm">
                <ThemePalette theme={selectedTheme} />
                <span className="truncate font-medium">{selectedTheme.label}</span>
                <span className="ml-auto rounded-md bg-foreground/10 px-1.5 py-0.5 font-medium text-[10px] text-foreground/60 uppercase tracking-wide">
                  Current
                </span>
              </div>
              <CommandSeparator />
            </>
          ) : null}
          <CommandList className="scrollbar-thin max-h-80 [&::-webkit-scrollbar]:block">
            <CommandEmpty>No themes found.</CommandEmpty>
            <CommandGroup heading={`Local (${localThemes.length})`}>
              {localThemes.map((t) => (
                <CommandItem
                  key={t.id}
                  value={t.label}
                  data-checked={colorTheme === t.id}
                  onSelect={() => {
                    playClick("mouse");
                    setColorThemeWithTransition(t.id);
                  }}
                >
                  <ThemePalette theme={t} />
                  {t.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {remoteThemes.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading={`Remote (${remoteThemes.length})`}>
                  {remoteThemes.map((t) => (
                    <CommandItem
                      key={t.id}
                      value={t.label}
                      data-checked={colorTheme === t.id}
                      onSelect={() => {
                        playClick("mouse");
                        setColorThemeWithTransition(t.id);
                      }}
                    >
                      <ThemePalette theme={t} />
                      {t.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
