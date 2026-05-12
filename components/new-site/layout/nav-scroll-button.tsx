import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NavScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={`Scroll nav ${direction}`}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground",
        disabled && "pointer-events-none opacity-0"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
