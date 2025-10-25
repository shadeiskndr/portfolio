import { CheckIcon, Palette } from "lucide-react";

import IconButton from "@/components/general/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useColorTheme } from "@/lib/color-provider";

export function ColorThemeToggle() {
  const { colorTheme, setColorThemeWithTransition } = useColorTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <IconButton>
              <Palette className="h-[1.2rem] w-[1.2rem]" />
            </IconButton>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change Color Theme</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setColorThemeWithTransition("default")}>
          Default
          <span className="ml-auto flex items-center">
            {colorTheme === "default" && <CheckIcon className="size-4" />}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setColorThemeWithTransition("claude")}>
          Claude
          <span className="ml-auto flex items-center">
            {colorTheme === "claude" && <CheckIcon className="size-4" />}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setColorThemeWithTransition("rose")}>
          Rose
          <span className="ml-auto flex items-center">
            {colorTheme === "rose" && <CheckIcon className="size-4" />}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
