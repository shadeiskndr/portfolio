"use client";

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
import { useColorTheme } from "@/lib/color-provider";
import { DEFAULT_COLOR_THEME, PALETTE_KEYS, type ThemeOption } from "@/lib/color-themes";
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

export function ColorThemeToggle() {
  const { colorTheme, setColorThemeWithTransition, localThemes, remoteThemes } = useColorTheme();

  const activeTheme =
    localThemes.find((t) => t.id === colorTheme) ??
    remoteThemes.find((t) => t.id === colorTheme) ??
    DEFAULT_COLOR_THEME;

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  className="bg-transparent px-1.75 shadow-none dark:border-border dark:bg-transparent dark:aria-expanded:bg-input/50"
                  variant="outline"
                  size="sm"
                  aria-label="Change color theme"
                >
                  <ThemePalette theme={activeTheme} />
                </Button>
              }
            />
          }
        />
        <TooltipContent>
          <p>{activeTheme.label}</p>
        </TooltipContent>
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
          <CommandInput placeholder="Search theme…" />
          <CommandList className="max-h-80">
            <CommandEmpty>No themes found.</CommandEmpty>
            <CommandGroup heading={`Local (${localThemes.length})`}>
              {localThemes.map((t) => (
                <CommandItem
                  key={t.id}
                  value={t.label}
                  data-checked={colorTheme === t.id}
                  onSelect={() => setColorThemeWithTransition(t.id)}
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
                      onSelect={() => setColorThemeWithTransition(t.id)}
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
