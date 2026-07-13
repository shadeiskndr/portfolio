"use client";

import { Drawer as DrawerPrimitive } from "vaul";
import { Drawer, DrawerOverlay, DrawerPortal, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet whose body scrolls by touch.
 *
 * vaul's default `touch-action: none` means a finger drag never scrolls the
 * content. `handleOnly` confines the dismiss gesture to the grab handle, which
 * frees the body to pan — see the `[data-scroll-sheet]` rules in globals.css
 * for the touch-action half of that trade.
 *
 * Built on the vaul primitives rather than our styled `DrawerContent`, which
 * renders its own decorative bar for bottom drawers and would double up with
 * the real (draggable) handle.
 */
export default function MobileSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  contentClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} handleOnly>
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitive.Content
          data-scroll-sheet=""
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-2xl border-t bg-popover text-popover-foreground text-sm",
            className
          )}
        >
          <DrawerPrimitive.Handle className="mx-auto! mt-3! mb-1! h-1! w-10! shrink-0 rounded-full! bg-muted-foreground/30!" />
          <div className="shrink-0 px-4 pb-1">
            <DrawerTitle className="font-serif text-base">{title}</DrawerTitle>
            {description ? (
              <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
            ) : null}
          </div>
          <div
            className={cn(
              "min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 pt-2",
              // Clears the home indicator on gesture-nav phones.
              "pb-[max(1rem,env(safe-area-inset-bottom))]",
              contentClassName
            )}
          >
            {children}
          </div>
        </DrawerPrimitive.Content>
      </DrawerPortal>
    </Drawer>
  );
}
