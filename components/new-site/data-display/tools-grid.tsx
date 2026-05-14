import Image from "next/image";
import { Marquee, MarqueeContent, MarqueeItem } from "@/components/ui/diceui/marquee";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TOOLS } from "@/lib/new-site/data";
import { cn } from "@/lib/utils";

const SPEED = 10;
const MID = Math.ceil(TOOLS.length / 2);
const ROW_ONE = TOOLS.slice(0, MID);
const ROW_TWO = TOOLS.slice(MID);

function ToolChip({ label, logo }: { label: string; logo: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/40 p-1.5">
            <Image
              src={logo}
              alt={label}
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
              unoptimized
            />
          </span>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ToolsRow({
  items,
  side,
  className,
}: {
  items: typeof TOOLS;
  side: "left" | "right";
  className?: string;
}) {
  return (
    <Marquee
      side={side}
      pauseOnHover
      autoFill
      speed={SPEED}
      gap="0.375rem"
      className={cn("py-0.5", className)}
    >
      <MarqueeContent>
        {items.map((tool) => (
          <MarqueeItem key={tool.label}>
            <ToolChip label={tool.label} logo={tool.logo} />
          </MarqueeItem>
        ))}
      </MarqueeContent>
    </Marquee>
  );
}

export default function ToolsGrid() {
  return (
    <TooltipProvider>
      <section className="space-y-2.5">
        <h3 className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
          Tools & Platforms
        </h3>
        <div className="space-y-1.5">
          <ToolsRow items={ROW_ONE} side="right" />
          <ToolsRow items={ROW_TWO} side="left" />
        </div>
      </section>
    </TooltipProvider>
  );
}
